const Application = require('../models/Application');
const Internship = require('../models/Internship');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/internships/:id/apply (student) — multipart: coverLetter, resume(optional PDF)
exports.apply = asyncHandler(async (req, res) => {
  const internship = await Internship.findById(req.params.id);
  if (!internship) throw new ApiError(404, 'Internship not found');
  if (internship.status !== 'open' || internship.deadline < new Date()) {
    throw new ApiError(400, 'Applications for this internship are closed');
  }
  if (await Application.findOne({ student: req.user._id, internship: internship._id })) {
    throw new ApiError(409, 'You have already applied to this internship');
  }

  const resumeUrl = req.file ? `/uploads/${req.file.filename}` : req.user.profile?.resumeUrl;
  if (!resumeUrl) throw new ApiError(400, 'Please upload a resume (or add one to your profile)');

  const application = await Application.create({
    student: req.user._id,
    internship: internship._id,
    coverLetter: req.body.coverLetter,
    resumeUrl,
  });
  res.status(201).json({ success: true, application });
});

// GET /api/applications/mine (student)
exports.mine = asyncHandler(async (req, res) => {
  const applications = await Application.find({ student: req.user._id })
    .sort({ createdAt: -1 })
    .populate({ path: 'internship', populate: { path: 'company', select: 'name companyName' } });
  res.json({ success: true, applications });
});

// GET /api/internships/:id/applications (owning company or admin)
exports.forInternship = asyncHandler(async (req, res) => {
  const internship = await Internship.findById(req.params.id);
  if (!internship) throw new ApiError(404, 'Internship not found');
  if (req.user.role !== 'admin' && String(internship.company) !== String(req.user._id)) {
    throw new ApiError(403, 'Not your internship');
  }
  const applications = await Application.find({ internship: internship._id })
    .sort({ createdAt: -1 })
    .populate('student', 'name email profile');
  res.json({ success: true, internship, applications });
});

// PUT /api/applications/:id/status (owning company)
exports.updateStatus = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id).populate('internship');
  if (!application) throw new ApiError(404, 'Application not found');
  if (req.user.role !== 'admin' && String(application.internship.company) !== String(req.user._id)) {
    throw new ApiError(403, 'Not your internship');
  }
  application.status = req.body.status;
  await application.save();
  res.json({ success: true, application });
});

// DELETE /api/applications/:id (student withdraws own application)
exports.withdraw = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);
  if (!application) throw new ApiError(404, 'Application not found');
  if (String(application.student) !== String(req.user._id)) throw new ApiError(403, 'Not your application');
  if (application.status !== 'applied') throw new ApiError(400, 'Only pending applications can be withdrawn');
  await application.deleteOne();
  res.json({ success: true, message: 'Application withdrawn' });
});
