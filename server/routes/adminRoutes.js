const router = require('express').Router();
const { body } = require('express-validator');
const c = require('../controllers/adminController');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));
router.get('/stats', c.stats);
router.get('/users', c.listUsers);
router.put('/users/:id/approve', c.approve);
router.delete('/users/:id', c.removeUser);
router.get('/internships', c.listInternships); // close/reopen/delete reuse PUT/DELETE /api/internships/:id
router.get('/audit', c.auditLog);
router.get('/announcements', c.listAnnouncements);
router.post(
  '/announcements',
  [body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 280 }).withMessage('Keep it under 280 characters')],
  validate,
  c.createAnnouncement
);
router.put('/announcements/:id', c.updateAnnouncement);
router.delete('/announcements/:id', c.removeAnnouncement);

module.exports = router;
