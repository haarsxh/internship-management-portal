const router = require('express').Router();
const { body } = require('express-validator');
const c = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['student', 'company']).withMessage('Role must be student or company'),
    body('companyName').if(body('role').equals('company')).trim().notEmpty().withMessage('Company name is required'),
  ],
  validate,
  c.register
);
router.post(
  '/login',
  [body('email').isEmail().withMessage('Valid email is required').normalizeEmail(), body('password').notEmpty().withMessage('Password is required')],
  validate,
  c.login
);
router.get('/me', protect, c.getMe);
router.put('/me', protect, c.updateMe);
router.post('/me/resume', protect, upload.single('resume'), c.uploadResume);

module.exports = router;
