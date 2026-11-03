const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['student', 'company', 'admin'], default: 'student' },
    // Companies must be approved by an admin before they can post internships
    isApproved: { type: Boolean, default: true },
    companyName: { type: String, trim: true },
    website: { type: String, trim: true },
    profile: {
      phone: String,
      college: String,
      branch: String,
      skills: [String],
      resumeUrl: String,
    },
  },
  { timestamps: true }
);

userSchema.index({ role: 1, isApproved: 1 });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);
