const multer = require('multer');
const ApiError = require('../utils/ApiError');

// Files are kept in memory, validated, then stored in MongoDB by utils/saveFile
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') return cb(null, true);
  cb(new ApiError(400, 'Only PDF files are allowed'));
};

module.exports = multer({ storage: multer.memoryStorage(), fileFilter, limits: { fileSize: 2 * 1024 * 1024 } });
