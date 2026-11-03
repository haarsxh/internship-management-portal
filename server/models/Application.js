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
    // One entry per status change, used for the student's timeline
    statusHistory: [{ _id: false, status: String, at: { type: Date, default: Date.now } }],
    // Private to the company (never returned to students)
    notes: { type: String, trim: true, maxlength: 2000 },
    rating: { type: Number, min: 1, max: 5 },
    interview: {
      proposedAt: Date,
      note: { type: String, trim: true, maxlength: 500 },
      status: { type: String, enum: ['proposed', 'confirmed', 'declined'] },
    },
  },
  { timestamps: true }
);

applicationSchema.pre('save', async function () {
  if (this.isNew && this.statusHistory.length === 0) this.statusHistory.push({ status: this.status });
  else if (!this.isNew && this.isModified('status')) this.statusHistory.push({ status: this.status });
});

// A student can apply to an internship only once
applicationSchema.index({ student: 1, internship: 1 }, { unique: true });
applicationSchema.index({ internship: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
