const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const authController = require('../controllers/authController');

// Đăng ký tài khoản
router.post('/register', authController.register);

// Đăng nhập tài khoản
router.post('/login', authController.login);

// New route to list all users (for testing purposes)
router.get('/users', async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

module.exports = router;