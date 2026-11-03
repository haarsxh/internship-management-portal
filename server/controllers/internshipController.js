const Internship = require('../models/Internship');
const Application = require('../models/Application');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const logAudit = require('../utils/audit');

const toSkills = (s) =>
  Array.isArray(s) ? s : String(s || '').split(',').map((x) => x.trim()).filter(Boolean);

// Loads an internship and checks the caller owns it (or is admin)
const getOwned = async (id, user) => {
  const internship = await Internship.findById(id);
  if (!internship) throw new ApiError(404, 'Internship not found');
  if (user.role !== 'admin' && String(internship.company) !== String(user._id)) {
    throw new ApiError(403, 'You can only modify your own internships');
  }
  return internship;
};

// GET /api/internships?q=&mode=&location=&minStipend=&page=&limit=
exports.list = asyncHandler(async (req, res) => {
  const { q, mode, location, minStipend } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 9, 50);

  const filter = { status: 'open', deadline: { $gte: new Date() } };
  if (q) filter.$text = { $search: q };
  if (mode) filter.mode = mode;
  if (location) filter.location = new RegExp(location.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  if (minStipend) filter.stipend = { $gte: Number(minStipend) };

  const [items, total] = await Promise.all([
    Internship.find(filter)
      .sort({ deadline: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('company', 'name companyName website'),
    Internship.countDocuments(filter),
  ]);
  // Students see which internships they have bookmarked
  const saved = new Set(req.user?.role === 'student' ? req.user.savedInternships.map(String) : []);
  const internships = items.map((i) => ({ ...i.toObject(), saved: saved.has(String(i._id)) }));
  res.json({ success: true, total, page, pages: Math.ceil(total / limit), internships });
});

// GET /api/internships/mine (company)
exports.mine = asyncHandler(async (req, res) => {
  const items = await Internship.find({ company: req.user._id }).sort({ createdAt: -1 });
  const counts = await Application.aggregate([
    { $match: { internship: { $in: items.map((i) => i._id) } } },
    { $group: { _id: '$internship', count: { $sum: 1 } } },
  ]);
  const map = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));
  const internships = items.map((i) => ({ ...i.toObject(), applicationCount: map[String(i._id)] || 0 }));
  res.json({ success: true, internships });
});

// GET /api/internships/:id
exports.getOne = asyncHandler(async (req, res) => {
  const internship = await Internship.findById(req.params.id).populate('company', 'name companyName website');
  if (!internship) throw new ApiError(404, 'Internship not found');

  let application = null;
  let saved = false;
  if (req.user && req.user.role === 'student') {
    // notes/rating are private to the company
    application = await Application.findOne({ student: req.user._id, internship: internship._id }).select('-notes -rating');
    saved = req.user.savedInternships.some((id) => String(id) === String(internship._id));
  }
  res.json({ success: true, internship, application, saved });
});

// POST /api/internships (company)
exports.create = asyncHandler(async (req, res) => {
  if (req.user.role === 'company' && !req.user.isApproved) {
    throw new ApiError(403, 'Your company account is awaiting admin approval');
  }
  const { title, description, location, mode, stipend, durationMonths, skills, deadline } = req.body;
  const internship = await Internship.create({
    title,
    description,
    location,
    mode,
    stipend,
    durationMonths,
    skills: toSkills(skills),
    deadline,
    company: req.user._id,
  });
  res.status(201).json({ success: true, internship });
});

// PUT /api/internships/:id (owner)
exports.update = asyncHandler(async (req, res) => {
  const internship = await getOwned(req.params.id, req.user);
  const fields = ['title', 'description', 'location', 'mode', 'stipend', 'durationMonths', 'deadline', 'status'];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) internship[f] = req.body[f];
  });
  if (req.body.skills !== undefined) internship.skills = toSkills(req.body.skills);
  const statusChanged = internship.isModified('status');
  await internship.save();
  if (statusChanged) {
    await logAudit(req.user, `internship.${internship.status === 'closed' ? 'close' : 'reopen'}`, 'Internship', internship._id, internship.title);
  }
  res.json({ success: true, internship });
});

// DELETE /api/internships/:id (owner or admin)
exports.remove = asyncHandler(async (req, res) => {
  const internship = await getOwned(req.params.id, req.user);
  await Application.deleteMany({ internship: internship._id });
  await internship.deleteOne();
  await logAudit(req.user, 'internship.delete', 'Internship', internship._id, internship.title);
  res.json({ success: true, message: 'Internship deleted' });
});
