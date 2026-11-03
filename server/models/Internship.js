const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    description: { type: String, required: [true, 'Description is required'] },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    location: { type: String, required: [true, 'Location is required'], trim: true },
    mode: { type: String, enum: ['remote', 'onsite', 'hybrid'], default: 'onsite' },
    stipend: { type: Number, min: [0, 'Stipend cannot be negative'], default: 0 },
    durationMonths: { type: Number, min: [1, 'Duration must be at least 1 month'], default: 2 },
    skills: [String],
    deadline: { type: Date, required: [true, 'Deadline is required'] },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
  },
  { timestamps: true }
);

// Optimization: listing queries filter by status and sort by deadline; search uses text index
internshipSchema.index({ status: 1, deadline: 1 });
internshipSchema.index({ company: 1 });
internshipSchema.index({ title: 'text', skills: 'text', location: 'text' });

module.exports = mongoose.model('Internship', internshipSchema);
