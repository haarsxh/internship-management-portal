const router = require('express').Router();
const { body } = require('express-validator');
const c = require('../controllers/internshipController');
const a = require('../controllers/applicationController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');

const rules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('deadline').isISO8601().withMessage('Valid deadline is required'),
  body('stipend').optional().isFloat({ min: 0 }).withMessage('Stipend must be 0 or more'),
  body('durationMonths').optional().isInt({ min: 1 }).withMessage('Duration must be at least 1 month'),
];

router.get('/', c.list);
router.get('/mine', protect, authorize('company'), c.mine); // must precede /:id
router.post('/', protect, authorize('company'), rules, validate, c.create);
router.get('/:id', optionalAuth, c.getOne);
router.put('/:id', protect, authorize('company', 'admin'), c.update);
router.delete('/:id', protect, authorize('company', 'admin'), c.remove);

router.post('/:id/apply', protect, authorize('student'), upload.single('resume'), a.apply);
router.get('/:id/applications', protect, authorize('company', 'admin'), a.forInternship);

module.exports = router;
