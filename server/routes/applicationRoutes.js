const router = require('express').Router();
const { body } = require('express-validator');
const a = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const statuses = ['applied', 'shortlisted', 'accepted', 'rejected'];

router.get('/mine', protect, authorize('student'), a.mine);
// Must be declared before '/:id/status' or "bulk" would be read as an id
router.put(
  '/bulk/status',
  protect,
  authorize('company', 'admin'),
  [
    body('ids').isArray({ min: 1 }).withMessage('Select at least one application'),
    body('ids.*').isMongoId().withMessage('Invalid application id'),
    body('status').isIn(statuses).withMessage('Invalid status'),
  ],
  validate,
  a.bulkStatus
);
router.put(
  '/:id/status',
  protect,
  authorize('company', 'admin'),
  [body('status').isIn(statuses).withMessage('Invalid status')],
  validate,
  a.updateStatus
);
router.put(
  '/:id/review',
  protect,
  authorize('company', 'admin'),
  [
    body('rating').optional({ nullable: true }).isInt({ min: 1, max: 5 }).withMessage('Rating must be 1 to 5'),
    body('notes').optional().isLength({ max: 2000 }).withMessage('Notes are limited to 2000 characters'),
  ],
  validate,
  a.review
);
router.put(
  '/:id/interview',
  protect,
  authorize('company', 'admin'),
  [
    body('proposedAt')
      .isISO8601()
      .withMessage('Valid interview date is required')
      .custom((v) => new Date(v) > new Date())
      .withMessage('Interview must be in the future'),
    body('note').optional().isLength({ max: 500 }).withMessage('Note is limited to 500 characters'),
  ],
  validate,
  a.scheduleInterview
);
router.delete('/:id/interview', protect, authorize('company', 'admin'), a.cancelInterview);
router.put(
  '/:id/interview/respond',
  protect,
  authorize('student'),
  [body('response').isIn(['confirmed', 'declined']).withMessage('Response must be confirmed or declined')],
  validate,
  a.respondInterview
);
router.delete('/:id', protect, authorize('student'), a.withdraw);

module.exports = router;
