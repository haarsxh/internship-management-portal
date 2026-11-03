const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    internship: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true },
    coverLetter: { type: String, trim: true, maxlength: 2000 },
    resumeUrl: String,
    status: {
      type: String,
      enum: ['applied', 'shortlisted', 'accepted', 'rejected'],
      default: 'applied',
    },
  },
  { timestamps: true }
);

// A student can apply to an internship only once
applicationSchema.index({ student: 1, internship: 1 }, { unique: true });
applicationSchema.index({ internship: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
