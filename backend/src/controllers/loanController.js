const Loan = require('../models/loanModel');

// Create a new loan/debt
exports.createLoan = async (req, res) => {
  try {
    const { amount, person, due_date, type } = req.body;
    const userId = req.userId;

    // Validate type
    if (!['loan', 'debt'].includes(type)) {
      return res.status(400).json({
        message: 'Type must be either "loan" or "debt"'
      });
    }

    const loanId = await Loan.create({
      user_id: userId,
      amount,
      person,
      due_date,
      type
    });

    res.status(201).json({
      message: 'Loan/Debt created successfully',
      loanId
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error creating loan/debt',
      error: error.message
    });
  }
};

// Get all loans/debts for a user
exports.getLoans = async (req, res) => {
  try {
    const userId = req.userId;
    const { status } = req.query;

    const loans = await Loan.findByUser(userId, status);

    res.status(200).json(loans);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching loans/debts',
      error: error.message
    });
  }
};

// Update a loan/debt
exports.updateLoan = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, person, due_date, type, status } = req.body;
    const userId = req.userId;

    console.log(`🔄 UPDATE LOAN - ID: ${id}, UserId: ${userId}, Data:`, req.body);

    // Validate type if provided
    if (type && !['loan', 'debt'].includes(type)) {
      return res.status(400).json({
        message: 'Type must be either "loan" or "debt"'
      });
    }

    // Validate status if provided
    if (status && !['pending', 'paid'].includes(status)) {
      return res.status(400).json({
        message: 'Status must be either "pending" or "paid"'
      });
    }

    const updated = await Loan.update(id, userId, {
      amount,
      person,
      due_date,
      type,
      status
    });

    if (!updated) {
      console.log(`❌ LOAN NOT FOUND - ID: ${id}, UserId: ${userId}`);
      return res.status(404).json({
        message: 'Loan/Debt not found'
      });
    }

    console.log(`✅ LOAN UPDATED SUCCESSFULLY - ID: ${id}`);
    res.status(200).json({
      message: 'Loan/Debt updated successfully'
    });
  } catch (error) {
    console.error(`💥 ERROR UPDATING LOAN - ID: ${id}:`, error);
    res.status(500).json({
      message: 'Error updating loan/debt',
      error: error.message
    });
  }
};

// Update loan/debt status
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.userId;

    // Validate status
    if (!['pending', 'paid'].includes(status)) {
      return res.status(400).json({
        message: 'Status must be either "pending" or "paid"'
      });
    }

    const updated = await Loan.updateStatus(id, userId, status);

    if (!updated) {
      return res.status(404).json({
        message: 'Loan/Debt not found'
      });
    }

    res.status(200).json({
      message: 'Status updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating status',
      error: error.message
    });
  }
};

// Delete a loan/debt
exports.deleteLoan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const deleted = await Loan.delete(id, userId);

    if (!deleted) {
      return res.status(404).json({
        message: 'Loan/Debt not found'
      });
    }

    res.status(200).json({
      message: 'Loan/Debt deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting loan/debt',
      error: error.message
    });
  }
}; 