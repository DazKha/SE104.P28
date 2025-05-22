const Transaction = require('../models/transaction.model');
const budgetController = require('./budget.controller');

// Create a new transaction
exports.createTransaction = async (req, res) => {
  try {
    const { type, amount, category, description, date } = req.body;
    const userId = req.user.id;

    const transaction = new Transaction({
      user: userId,
      type,
      amount,
      category,
      description,
      date: date || new Date()
    });

    await transaction.save();

    // Update budget used amount if it's an expense
    if (type === 'Expense') {
      await budgetController.updateBudgetUsed(transaction);
    }

    res.status(201).json({
      message: 'Tạo giao dịch thành công',
      transaction
    });
  } catch (error) {
    res.status(500).json({
      message: 'Lỗi tạo giao dịch',
      error: error.message
    });
  }
}; 