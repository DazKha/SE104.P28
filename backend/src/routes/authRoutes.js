const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Đăng ký tài khoản
router.post('/register', authController.register);

// Đăng nhập tài khoản
router.post('/login', authController.login);

module.exports = router;