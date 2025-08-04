const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');
const { validate } = require('../middlewares/validation');

// Routes publiques
router.post('/login', validate('login'), AuthController.login);

// Routes protégées (authentification requise)
router.get('/profile', authenticateToken, AuthController.getProfile);
router.put('/profile', authenticateToken, validate('updateProfile'), AuthController.updateProfile);
router.put('/change-password', authenticateToken, validate('changePassword'), AuthController.changePassword);
router.get('/verify', authenticateToken, AuthController.verifyToken);

// Routes admin seulement
router.post('/register', authenticateToken, requireAdmin, validate('register'), AuthController.register);

module.exports = router;
