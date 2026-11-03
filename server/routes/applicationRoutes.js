const router = require('express').Router();
const { body } = require('express-validator');
const a = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

router.get('/mine', protect, authorize('student'), a.mine);
router.put(
  '/:id/status',
  protect,
  authorize('company', 'admin'),
  [body('status').isIn(['applied', 'shortlisted', 'accepted', 'rejected']).withMessage('Invalid status')],
  validate,
  a.updateStatus
);
router.delete('/:id', protect, authorize('student'), a.withdraw);

module.exports = router;
