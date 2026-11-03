const User = require('../models/User');
const Internship = require('../models/Internship');
const Application = require('../models/Application');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const DAY = 24 * 60 * 60 * 1000;
const norm = (s) => String(s).trim().toLowerCase();

// GET /api/student/saved
exports.saved = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'savedInternships',
    populate: { path: 'company', select: 'name companyName' },
  });
  const internships = user.savedInternships.filter(Boolean).map((i) => ({ ...i.toObject(), saved: true }));
  res.json({ success: true, internships });
});

// POST /api/student/saved/:id
exports.save = asyncHandler(async (req, res) => {
  if (!(await Internship.exists({ _id: req.params.id }))) throw new ApiError(404, 'Internship not found');
  await User.updateOne({ _id: req.user._id }, { $addToSet: { savedInternships: req.params.id } });
  res.status(201).json({ success: true, saved: true });
});

// DELETE /api/student/saved/:id
exports.unsave = asyncHandler(async (req, res) => {
  await User.updateOne({ _id: req.user._id }, { $pull: { savedInternships: req.params.id } });
  res.json({ success: true, saved: false });
});

// GET /api/student/recommendations — rank open internships by skill overlap with the profile
exports.recommendations = asyncHandler(async (req, res) => {
  const mine = (req.user.profile?.skills || []).map(norm).filter(Boolean);
  if (mine.length === 0) return res.json({ success: true, needsSkills: true, internships: [] });

  const applied = await Application.find({ student: req.user._id }).distinct('internship');
  const open = await Internship.find({
    status: 'open',
    deadline: { $gte: new Date() },
    _id: { $nin: applied },
  }).populate('company', 'name companyName');

  const have = new Set(mine);
  const saved = new Set((req.user.savedInternships || []).map(String));
  const ranked = open
    .map((i) => {
      const wanted = (i.skills || []).map(norm);
      const matched = (i.skills || []).filter((s) => have.has(norm(s)));
      const score = wanted.length ? Math.round((matched.length / wanted.length) * 100) : 0;
      return { internship: i, matched, score };
    })
    .filter((r) => r.matched.length > 0)
    .sort((a, b) => b.score - a.score || b.matched.length - a.matched.length || a.internship.deadline - b.internship.deadline)
    .slice(0, 6)
    .map((r) => ({ ...r.internship.toObject(), saved: saved.has(String(r.internship._id)), matchedSkills: r.matched, matchScore: r.score }));

  res.json({ success: true, needsSkills: false, internships: ranked });
});

// GET /api/student/alerts — saved internships closing within 3 days, and interviews awaiting a reply
exports.alerts = asyncHandler(async (req, res) => {
  const now = new Date();
  const soon = new Date(now.getTime() + 3 * DAY);
  const applied = await Application.find({ student: req.user._id }).distinct('internship');

  const closing = await Internship.find({
    _id: { $in: req.user.savedInternships, $nin: applied },
    status: 'open',
    deadline: { $gte: now, $lte: soon },
  }).select('title deadline');

  const interviews = await Application.find({
    student: req.user._id,
    'interview.status': 'proposed',
    'interview.proposedAt': { $gte: now },
  }).populate('internship', 'title');

  res.json({
    success: true,
    alerts: [
      ...closing.map((i) => ({ type: 'deadline', internshipId: i._id, title: i.title, deadline: i.deadline })),
      ...interviews.map((a) => ({ type: 'interview', applicationId: a._id, title: a.internship?.title, proposedAt: a.interview.proposedAt })),
    ],
  });
});
