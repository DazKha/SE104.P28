const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/transactionsController');
const authMiddleware = require('../middlewares/authMiddleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Create transaction
router.post('/', transactionsController.create);

// Get all transactions for user
router.get('/', transactionsController.getByUser);

// Get transaction by ID
router.get('/:id', transactionsController.getById);

// Update transaction
router.put('/:id', transactionsController.update);

// Delete transaction
router.delete('/:id', transactionsController.delete);

module.exports = router; 