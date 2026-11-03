const router = require('express').Router();
const File = require('../models/File');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/files/:id — serves a stored resume. The id is an unguessable ObjectId, so the link
// works in a plain <a href> (which cannot send a Bearer token).
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const file = await File.findById(req.params.id).select('+data');
    if (!file) throw new ApiError(404, 'File not found');
    res.set({
      'Content-Type': file.contentType,
      'Content-Disposition': `inline; filename="${file.filename}"`,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, max-age=3600',
    });
    res.send(file.data);
  })
);

module.exports = router;
