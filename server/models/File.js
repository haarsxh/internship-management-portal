const mongoose = require('mongoose');

// Uploaded resumes live in MongoDB so they survive restarts on hosts with ephemeral disks
const fileSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    contentType: { type: String, required: true },
    size: Number,
    data: { type: Buffer, required: true, select: false },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model('File', fileSchema);
