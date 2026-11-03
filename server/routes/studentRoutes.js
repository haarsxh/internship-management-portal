const router = require('express').Router();
const c = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('student'));
router.get('/saved', c.saved);
router.post('/saved/:id', c.save);
router.delete('/saved/:id', c.unsave);
router.get('/recommendations', c.recommendations);
router.get('/alerts', c.alerts);

module.exports = router;
