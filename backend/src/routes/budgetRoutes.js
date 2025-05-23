const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const authMiddleware = require('../middleware/auth.middleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Create a new budget
router.post('/', budgetController.createBudget);

// Get budgets for a user (optionally filtered by month)
router.get('/', budgetController.getBudgets);

// Update a budget
router.put('/:id', budgetController.updateBudget);

// Delete a budget
router.delete('/:id', budgetController.deleteBudget);

module.exports = router; 