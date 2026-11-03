const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    message: { type: String, required: [true, 'Message is required'], trim: true, maxlength: [280, 'Keep it under 280 characters'] },
    active: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

announcementSchema.index({ active: 1, createdAt: -1 });

module.exports = mongoose.model('Announcement', announcementSchema);
