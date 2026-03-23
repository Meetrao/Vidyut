const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.get('/me', authenticate, ctrl.me);
router.get('/users', authenticate, requireAdmin, ctrl.listUsers);
router.patch('/users/:id/role', authenticate, requireAdmin, ctrl.updateRole);
router.delete('/users/:id', authenticate, requireAdmin, ctrl.deleteUser);

module.exports = router;
