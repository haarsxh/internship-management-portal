const path = require('path');
const File = require('../models/File');
const ApiError = require('./ApiError');

// Stores an uploaded PDF (multer memory file) and returns the URL it is served from
module.exports = async (file, ownerId) => {
  // The mimetype comes from the client, so also check the PDF magic bytes
  if (!file.buffer.subarray(0, 4).equals(Buffer.from('%PDF'))) throw new ApiError(400, 'Only PDF files are allowed');
  const safeName = path.basename(file.originalname).replace(/[^a-zA-Z0-9.\-_]/g, '_') || 'resume.pdf';
  const saved = await File.create({
    filename: safeName,
    contentType: 'application/pdf',
    size: file.size,
    data: file.buffer,
    owner: ownerId,
  });
  return `/api/files/${saved._id}`;
};
