const express = require('express');
const router = express.Router();
const savingController = require('../controllers/savingController');
const authMiddleware = require('../middlewares/authMiddleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Create a new saving goal
router.post('/', savingController.createSaving);

// Get all saving goals for a user
router.get('/', savingController.getSavings);

// Update saving goal progress
router.put('/:id', savingController.updateSaving);

// Delete a saving goal
router.delete('/:id', savingController.deleteSaving);

module.exports = router; 