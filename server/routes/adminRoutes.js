const router = require('express').Router();
const c = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));
router.get('/stats', c.stats);
router.get('/users', c.listUsers);
router.put('/users/:id/approve', c.approve);
router.delete('/users/:id', c.removeUser);

module.exports = router;
