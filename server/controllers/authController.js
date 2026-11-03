const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');

const sendAuth = (res, status, user) => {
  const data = user.toObject();
  delete data.password;
  res.status(status).json({ success: true, token: generateToken(user._id), user: data });
};

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role, companyName } = req.body;
  if (await User.findOne({ email })) throw new ApiError(409, 'Email already registered');

  // Admin accounts cannot be self-registered
  const userRole = role === 'company' ? 'company' : 'student';
  const user = await User.create({
    name,
    email,
    password,
    role: userRole,
    companyName: userRole === 'company' ? companyName : undefined,
    isApproved: userRole !== 'company',
  });
  sendAuth(res, 201, user);
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) throw new ApiError(401, 'Invalid email or password');
  sendAuth(res, 200, user);
});

// GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

// PUT /api/auth/me
exports.updateMe = asyncHandler(async (req, res) => {
  const { name, companyName, website, phone, college, branch, skills } = req.body;
  const user = req.user;
  if (name !== undefined) user.name = name;
  if (user.role === 'company') {
    if (companyName !== undefined) user.companyName = companyName;
    if (website !== undefined) user.website = website;
  }
  if (user.role === 'student') {
    if (phone !== undefined) user.profile.phone = phone;
    if (college !== undefined) user.profile.college = college;
    if (branch !== undefined) user.profile.branch = branch;
    if (skills !== undefined) {
      user.profile.skills = (Array.isArray(skills) ? skills : String(skills).split(','))
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  await user.save();
  res.json({ success: true, user });
});

// POST /api/auth/me/resume
exports.uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Please attach a PDF resume');
  req.user.profile.resumeUrl = `/uploads/${req.file.filename}`;
  await req.user.save();
  res.json({ success: true, user: req.user });
});
