const Application = require('../models/Application');
const Internship = require('../models/Internship');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const saveFile = require('../utils/saveFile');

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

  const resumeUrl = req.file ? await saveFile(req.file, req.user._id) : req.user.profile?.resumeUrl;
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
    .select('-notes -rating') // private to the company
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

// Loads an application and checks the caller owns its internship (or is admin)
const loadOwned = async (id, user) => {
  const application = await Application.findById(id).populate('internship');
  if (!application) throw new ApiError(404, 'Application not found');
  if (user.role !== 'admin' && String(application.internship?.company) !== String(user._id)) {
    throw new ApiError(403, 'Not your internship');
  }
  return application;
};

// PUT /api/applications/bulk/status  body: { ids: [], status }
exports.bulkStatus = asyncHandler(async (req, res) => {
  const { ids, status } = req.body;
  const applications = await Application.find({ _id: { $in: ids } }).populate('internship');
  if (applications.length !== new Set(ids).size) throw new ApiError(404, 'Some applications were not found');
  if (
    req.user.role !== 'admin' &&
    applications.some((a) => String(a.internship?.company) !== String(req.user._id))
  ) {
    throw new ApiError(403, 'You can only update applications for your own internships');
  }
  for (const a of applications) {
    a.status = status;
    await a.save();
  }
  res.json({ success: true, updated: applications.length });
});

// PUT /api/applications/:id/review  body: { notes?, rating? (1-5 or null to clear) }
exports.review = asyncHandler(async (req, res) => {
  const application = await loadOwned(req.params.id, req.user);
  if (req.body.notes !== undefined) application.notes = req.body.notes;
  if (req.body.rating !== undefined) application.rating = req.body.rating === null ? undefined : Number(req.body.rating);
  await application.save();
  res.json({ success: true, application });
});

// PUT /api/applications/:id/interview  body: { proposedAt, note? }
exports.scheduleInterview = asyncHandler(async (req, res) => {
  const application = await loadOwned(req.params.id, req.user);
  if (application.status === 'rejected') throw new ApiError(400, 'Cannot schedule an interview for a rejected application');
  application.interview = { proposedAt: req.body.proposedAt, note: req.body.note, status: 'proposed' };
  await application.save();
  res.json({ success: true, application });
});

// DELETE /api/applications/:id/interview
exports.cancelInterview = asyncHandler(async (req, res) => {
  const application = await loadOwned(req.params.id, req.user);
  application.interview = undefined;
  await application.save();
  res.json({ success: true, application });
});

// PUT /api/applications/:id/interview/respond  body: { response: 'confirmed' | 'declined' } (student)
exports.respondInterview = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id).select('-notes -rating');
  if (!application) throw new ApiError(404, 'Application not found');
  if (String(application.student) !== String(req.user._id)) throw new ApiError(403, 'Not your application');
  if (application.interview?.status !== 'proposed') throw new ApiError(400, 'There is no interview waiting for your reply');
  application.interview.status = req.body.response;
  await application.save();
  res.json({ success: true, application });
});
