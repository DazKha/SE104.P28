const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middlewares/authMiddleware');

// Tất cả routes đều yêu cầu xác thực
router.use(authMiddleware);

// CRUD routes
// Create transaction
router.post('/', transactionController.create);

// Get all transactions for user
router.get('/', transactionController.getByUser);

// Search route - phải đặt trước route /:id để tránh conflict
router.get('/search', transactionController.search);

// Get transaction by ID
router.get('/:id', transactionController.getById);

// Update transaction
router.put('/:id', transactionController.update);

// Delete transaction
router.delete('/:id', transactionController.delete);

module.exports = router; 