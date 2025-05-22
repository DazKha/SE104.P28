const Transaction = require('../models/transactionsModel');
const db = require('../database/db');

// Helper function to validate transaction data
const validateTransactionData = (data) => {
  const errors = [];
  
  if (!data.amount || isNaN(data.amount) || data.amount <= 0) {
    errors.push('Amount must be a positive number');
  }
  
  if (!data.date || isNaN(Date.parse(data.date))) {
    errors.push('Invalid date format');
  }
  
  if (!data.type || !['income', 'outcome'].includes(data.type)) {
    errors.push("Type must be either 'income' or 'outcome'");
  }
  
  return errors;
};

// Hàm lấy ID của category "Không xác định"
const getDefaultCategoryId = (callback) => {
  db.get(`SELECT id FROM categories WHERE name = 'Không xác định'`, (err, row) => {
    if (err) return callback(err);
    callback(null, row?.id || null);
  });
};

// Hàm tạo transaction
exports.create = (req, res) => {
    const data = { ...req.body, user_id: req.userId };
    
    // Validate input
    const validationErrors = validateTransactionData(data);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }
  
    if (!data.category_id) {
      getDefaultCategoryId((err, defaultId) => {
        if (err) return res.status(500).json({ error: 'Failed to get default category' });
        data.category_id = defaultId;
        Transaction.createTransaction(data, (err) => {
          if (err) return res.status(500).json({ error: 'Failed to create transaction' });
          res.status(201).json({ message: 'Transaction created successfully' });
        });
      });
    } else {
      Transaction.createTransaction(data, (err) => {
        if (err) return res.status(500).json({ error: 'Failed to create transaction' });
        res.status(201).json({ message: 'Transaction created successfully' });
      });
    }
};

// Hàm lấy tất cả transactions của user
exports.getByUser = (req, res) => {
  Transaction.getTransactionsByUser(req.userId, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch transactions' });
    res.json(rows);
  });
};

// Hàm lấy transaction theo ID
exports.getById = (req, res) => {
  Transaction.getTransactionById(req.params.id, (err, transaction) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch transaction' });
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    
    // Check if transaction belongs to user
    if (transaction.user_id !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized access to transaction' });
    }
    
    res.json(transaction);
  });
};

// Hàm cập nhật transaction
exports.update = (req, res) => {
  // First check if transaction exists and belongs to user
  Transaction.getTransactionById(req.params.id, (err, transaction) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch transaction' });
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    if (transaction.user_id !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized access to transaction' });
    }

    // Validate update data
    const validationErrors = validateTransactionData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    Transaction.updateTransaction(req.params.id, req.body, (err) => {
      if (err) return res.status(500).json({ error: 'Failed to update transaction' });
      res.json({ message: 'Transaction updated successfully' });
    });
  });
};

// Hàm xóa transaction
exports.delete = (req, res) => {
  // First check if transaction exists and belongs to user
  Transaction.getTransactionById(req.params.id, (err, transaction) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch transaction' });
    if (!transaction) return res.status(404).json({ error: 'Transaction not found' });
    if (transaction.user_id !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized access to transaction' });
    }

    Transaction.deleteTransaction(req.params.id, (err) => {
      if (err) return res.status(500).json({ error: 'Failed to delete transaction' });
      res.json({ message: 'Transaction deleted successfully' });
    });
  });
};