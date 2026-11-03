const router = require('express').Router();
const Announcement = require('../models/Announcement');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/announcements/active — public; the newest live announcement (or null)
router.get(
  '/active',
  asyncHandler(async (req, res) => {
    const announcement = await Announcement.findOne({ active: true }).sort({ createdAt: -1 }).select('message createdAt');
    res.json({ success: true, announcement });
  })
);

module.exports = router;
