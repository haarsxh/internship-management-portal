const User = require('../models/User');
const Internship = require('../models/Internship');
const Application = require('../models/Application');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

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
  res.json({ success: true, message: 'User deleted' });
});

// GET /api/admin/stats — aggregation pipelines for the dashboard
exports.stats = asyncHandler(async (req, res) => {
  const [usersByRole, applicationsByStatus, topInternships, topCompanies, internshipsByStatus] = await Promise.all([
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
  ]);

  const toMap = (arr) => Object.fromEntries(arr.map((x) => [x._id, x.count]));
  const pendingCompanies = await User.countDocuments({ role: 'company', isApproved: false });
  res.json({
    success: true,
    stats: {
      usersByRole: toMap(usersByRole),
      applicationsByStatus: toMap(applicationsByStatus),
      internshipsByStatus: toMap(internshipsByStatus),
      pendingCompanies,
      topInternships,
      topCompanies,
    },
  });
});
