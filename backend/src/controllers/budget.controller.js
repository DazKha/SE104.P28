const Budget = require('../models/budget.model');

// Create a new budget
exports.createBudget = async (req, res) => {
  try {
    const { month, amount } = req.body;
    const userId = req.user.id;

    const budgetId = await Budget.create({
      user: userId,
      month,
      amount
    });

    res.status(201).json({
      message: 'Budget created successfully',
      budgetId
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating budget',
      error: error.message
    });
  }
};

// Get budgets for a user in a specific month
exports.getBudgets = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month } = req.query;

    const budgets = await Budget.findByUserAndMonth(userId, month || new Date().toISOString().slice(0, 7));

    res.status(200).json(budgets);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching budgets',
      error: error.message
    });
  }
};

// Update a budget
exports.updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const userId = req.user.id;

    const updated = await Budget.update(id, userId, amount);

    if (!updated) {
      return res.status(404).json({
        message: 'Budget not found'
      });
    }

    res.status(200).json({
      message: 'Budget updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating budget',
      error: error.message
    });
  }
};

// Delete a budget
exports.deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deleted = await Budget.delete(id, userId);

    if (!deleted) {
      return res.status(404).json({
        message: 'Budget not found'
      });
    }

    res.status(200).json({
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting budget',
      error: error.message
    });
  }
};

// Update budget used amount when a new transaction is created
exports.updateBudgetUsed = async (transaction) => {
  try {
    await Budget.updateUsedAmount(transaction);
  } catch (error) {
    console.error('Error updating budget used amount:', error);
  }
}; 