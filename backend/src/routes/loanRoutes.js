const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const authMiddleware = require('../middlewares/authMiddleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Create a new loan/debt
router.post('/', loanController.createLoan);

// Get all loans/debts for a user (optionally filtered by status)
router.get('/', loanController.getLoans);

// Update a loan/debt
router.put('/:id', loanController.updateLoan);

// Update loan/debt status
router.patch('/:id/status', loanController.updateStatus);

// Delete a loan/debt
router.delete('/:id', loanController.deleteLoan);

module.exports = router; 