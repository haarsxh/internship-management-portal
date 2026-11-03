const User = require('../models/User');
const Internship = require('../models/Internship');
const Application = require('../models/Application');
const ApiError = require('../utils/ApiError');
const Announcement = require('../models/Announcement');
const AuditLog = require('../models/AuditLog');
const asyncHandler = require('../utils/asyncHandler');
const logAudit = require('../utils/audit');

// GET /api/admin/users?role=
exports.listUsers = asyncHandler(async (req, res) => {
  const filter = req.query.role ? { role: req.query.role } : {};
  const users = await User.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, users });
});

// PUT /api/admin/users/:id/approve  body: { isApproved }
exports.approve = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  user.isApproved = req.body.isApproved !== false;
  await user.save();
  await logAudit(req.user, user.isApproved ? 'user.approve' : 'user.revoke', 'User', user._id, `${user.name} (${user.email})`);
  res.json({ success: true, user });
});

// DELETE /api/admin/users/:id
exports.removeUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  if (user.role === 'admin') throw new ApiError(400, 'Admin accounts cannot be deleted');

  if (user.role === 'company') {
    const ids = (await Internship.find({ company: user._id }).select('_id')).map((i) => i._id);
    await Application.deleteMany({ internship: { $in: ids } });
    await Internship.deleteMany({ company: user._id });
  } else {
    await Application.deleteMany({ student: user._id });
  }
  await user.deleteOne();
  await logAudit(req.user, 'user.delete', 'User', user._id, `${user.name} (${user.email}, ${user.role})`);
  res.json({ success: true, message: 'User deleted' });
});

// GET /api/admin/stats — aggregation pipelines for the dashboard
exports.stats = asyncHandler(async (req, res) => {
  const DAYS = 14;
  const since = new Date();
  // MongoDB's $dateToString groups in UTC, so build the day buckets in UTC too
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - (DAYS - 1));

  const [usersByRole, applicationsByStatus, topInternships, topCompanies, internshipsByStatus, perDay] = await Promise.all([
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Application.aggregate([
      { $group: { _id: '$internship', applications: { $sum: 1 } } },
      { $sort: { applications: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'internships', localField: '_id', foreignField: '_id', as: 'internship' } },
      { $unwind: '$internship' },
      { $project: { _id: 0, title: '$internship.title', applications: 1 } },
    ]),
    Internship.aggregate([
      { $group: { _id: '$company', internships: { $sum: 1 } } },
      { $sort: { internships: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'company' } },
      { $unwind: '$company' },
      { $project: { _id: 0, name: { $ifNull: ['$company.companyName', '$company.name'] }, internships: 1 } },
    ]),
    Internship.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Application.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    ]),
  ]);

  // Fill days with no applications so the chart line is continuous
  const byDay = Object.fromEntries(perDay.map((d) => [d._id, d.count]));
  const applicationsOverTime = Array.from({ length: DAYS }, (_, n) => {
    const d = new Date(since);
    d.setUTCDate(since.getUTCDate() + n);
    const key = d.toISOString().slice(0, 10);
    return { date: key, count: byDay[key] || 0 };
  });

  const toMap = (arr) => Object.fromEntries(arr.map((x) => [x._id, x.count]));
  const pendingCompanies = await User.countDocuments({ role: 'company', isApproved: false });
  res.json({
    success: true,
    stats: {
      usersByRole: toMap(usersByRole),
      applicationsByStatus: toMap(applicationsByStatus),
      internshipsByStatus: toMap(internshipsByStatus),
      pendingCompanies,
      applicationsOverTime,
      topInternships,
      topCompanies,
    },
  });
});

// GET /api/admin/internships?status= — every internship, for moderation
exports.listInternships = asyncHandler(async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  const items = await Internship.find(filter).sort({ createdAt: -1 }).populate('company', 'name companyName email');
  const counts = await Application.aggregate([{ $group: { _id: '$internship', count: { $sum: 1 } } }]);
  const map = Object.fromEntries(counts.map((c) => [String(c._id), c.count]));
  const internships = items.map((i) => ({ ...i.toObject(), applicationCount: map[String(i._id)] || 0 }));
  res.json({ success: true, internships });
});

// GET /api/admin/audit?page=&limit=&action=
exports.auditLog = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const filter = req.query.action ? { action: new RegExp(`^${req.query.action.replace(/[^a-z._]/gi, '')}`) } : {};
  const [entries, total] = await Promise.all([
    AuditLog.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    AuditLog.countDocuments(filter),
  ]);
  res.json({ success: true, total, page, pages: Math.ceil(total / limit), entries });
});

// GET /api/admin/announcements
exports.listAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await Announcement.find().sort({ createdAt: -1 }).limit(50).populate('createdBy', 'name');
  res.json({ success: true, announcements });
});

// POST /api/admin/announcements — the new one becomes the only live banner
exports.createAnnouncement = asyncHandler(async (req, res) => {
  await Announcement.updateMany({ active: true }, { active: false });
  const announcement = await Announcement.create({ message: req.body.message, createdBy: req.user._id });
  await logAudit(req.user, 'announcement.create', 'Announcement', announcement._id, announcement.message);
  res.status(201).json({ success: true, announcement });
});

// PUT /api/admin/announcements/:id  body: { active }
exports.updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) throw new ApiError(404, 'Announcement not found');
  announcement.active = req.body.active !== false;
  if (announcement.active) await Announcement.updateMany({ _id: { $ne: announcement._id }, active: true }, { active: false });
  await announcement.save();
  await logAudit(req.user, announcement.active ? 'announcement.show' : 'announcement.hide', 'Announcement', announcement._id, announcement.message);
  res.json({ success: true, announcement });
});

// DELETE /api/admin/announcements/:id
exports.removeAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) throw new ApiError(404, 'Announcement not found');
  await announcement.deleteOne();
  await logAudit(req.user, 'announcement.delete', 'Announcement', announcement._id, announcement.message);
  res.json({ success: true, message: 'Announcement deleted' });
});
