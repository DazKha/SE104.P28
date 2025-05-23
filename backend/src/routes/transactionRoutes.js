const express = require('express');
const router = express.Router();
const transactionsController = require('../controllers/transactionsController');
const authMiddleware = require('../middlewares/authMiddleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Create a new transaction
router.post('/', transactionsController.create);

// Get all transactions for a user
router.get('/', transactionsController.getByUser);

// Get a specific transaction
router.get('/:id', transactionsController.getById);

// Update a transaction
router.put('/:id', transactionsController.update);

// Delete a transaction
router.delete('/:id', transactionsController.delete);

module.exports = router; 