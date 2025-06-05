const Transaction = require('../models/transactionModel');
const db = require('../database/db');
const budgetController = require('./budgetController');

// Helper function to validate transaction data
const validateTransactionData = (data) => {
  const errors = [];
  
  if (!data.amount || isNaN(data.amount) || data.amount <= 0) {
    errors.push('Số tiền phải là số dương');
  }
  
  if (!data.date || isNaN(Date.parse(data.date))) {
    errors.push('Ngày không hợp lệ');
  }
  
  if (!data.type || !['income', 'outcome'].includes(data.type)) {
    errors.push("Loại giao dịch phải là 'thu' hoặc 'chi'");
  }
  
  return errors;
};

// Hàm lấy ID của category "Không xác định"
const getDefaultCategoryId = () => {
  const stmt = db.prepare(`SELECT id FROM categories WHERE name = 'Không xác định'`);
  const row = stmt.get();
  return row?.id || null;
};

// PUBLIC METHODS (No authentication required)
// Hàm lấy tất cả transactions (public)
exports.getPublicTransactions = (req, res) => {
  const { month } = req.query;
  const userId = 1; // Default user for testing
  
  // Validate month format if provided
  if (month && !/^\d{4}-\d{2}$/.test(month)) {
    return res.status(400).json({ error: 'Invalid month format. Use YYYY-MM format' });
  }

  try {
    const rows = Transaction.getTransactionsByUser(userId, month);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

// Hàm tạo transaction (public)
exports.createPublicTransaction = (req, res) => {
  const data = { ...req.body, user_id: 1 }; // Default user for testing
  
  // Validate input
  const validationErrors = validateTransactionData(data);
  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  try {
    if (!data.category_id) {
      data.category_id = getDefaultCategoryId();
    }
    
    const result = Transaction.createTransaction(data);
    
    res.status(201).json({ 
      message: 'Transaction created successfully',
      ...data,
      id: result.lastInsertRowid 
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};

// Hàm tạo transaction
exports.create = (req, res) => {
  const data = { ...req.body, user_id: req.userId };
  
  // Validate input
  const validationErrors = validateTransactionData(data);
  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  try {
    if (!data.category_id) {
      data.category_id = getDefaultCategoryId();
    }
    
    const result = Transaction.createTransaction(data);
    
    // Nếu là giao dịch chi tiêu, cập nhật cột 'used' trong budget
    if (data.type === 'outcome') {
      budgetController.updateBudgetUsed({
        user: data.user_id,
        amount: data.amount,
        month: new Date(data.date).toISOString().slice(0, 7) // Extract YYYY-MM from date
      });
    }
    
    res.status(201).json({ 
      id: result.lastInsertRowid,
      user_id: data.user_id,
      amount: data.amount,
      date: data.date,
      category_id: data.category_id,
      note: data.note,
      type: data.type,
      description: data.note, // For frontend compatibility
      category: 'Không xác định' // Default category name
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};

// Hàm lấy tất cả transactions của user
exports.getByUser = (req, res) => {
  try {
    const { month } = req.query;
    const userId = req.userId; // Lấy userId từ token đã verify
    
    // Validate month format if provided
    if (month && !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ error: 'Invalid month format. Use YYYY-MM format' });
    }

    // Build query with proper month filtering
    let query = `
      SELECT t.*, c.name as category_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ?
    `;
    
    const params = [userId];

    if (month) {
      query += ` AND strftime('%Y-%m', t.date) = ?`;
      params.push(month);
    }

    query += ` ORDER BY t.date DESC`;
    
    const stmt = db.prepare(query);
    const rows = stmt.all(...params);
    
    res.json(rows);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

// Hàm lấy transaction theo ID
exports.getById = (req, res) => {
  try {
    const transactionId = req.params.id;
    const userId = req.userId; // Lấy userId từ token đã verify

    // Query with user_id check for authorization
    const query = `
      SELECT t.*, c.name as category_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = ? AND t.user_id = ?
    `;
    
    const stmt = db.prepare(query);
    const transaction = stmt.get(transactionId, userId);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found or unauthorized' });
    }
    
    res.json(transaction);
  } catch (err) {
    console.error('Error fetching transaction:', err);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
};

// Hàm cập nhật transaction
exports.update = (req, res) => {
  try {
    const transactionId = req.params.id;
    const userId = req.userId; // Lấy userId từ token đã verify
    const updateData = req.body;

    // Validate update data
    const validationErrors = validateTransactionData(updateData);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    // First check if transaction exists and belongs to user
    const checkQuery = `
      SELECT * FROM transactions 
      WHERE id = ? AND user_id = ?
    `;
    const checkStmt = db.prepare(checkQuery);
    const existingTransaction = checkStmt.get(transactionId, userId);

    if (!existingTransaction) {
      return res.status(404).json({ error: 'Transaction not found or unauthorized' });
    }

    // Update the transaction
    const updateQuery = `
      UPDATE transactions
      SET amount = ?,
          date = ?,
          category_id = ?,
          note = ?,
          type = ?
      WHERE id = ? AND user_id = ?
    `;
    
    const updateStmt = db.prepare(updateQuery);
    const result = updateStmt.run(
      updateData.amount,
      updateData.date,
      updateData.category_id,
      updateData.note,
      updateData.type,
      transactionId,
      userId
    );

    if (result.changes === 0) {
      return res.status(400).json({ error: 'Failed to update transaction' });
    }

    // Get the updated transaction
    const getQuery = `
      SELECT t.*, c.name as category_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = ? AND t.user_id = ?
    `;
    const getStmt = db.prepare(getQuery);
    const updatedTransaction = getStmt.get(transactionId, userId);

    res.json({
      message: 'Transaction updated successfully',
      transaction: updatedTransaction
    });
  } catch (err) {
    console.error('Error updating transaction:', err);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
};

// Hàm xóa transaction
exports.delete = (req, res) => {
  try {
    // First check if transaction exists and belongs to user
    const transaction = Transaction.getTransactionById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    if (transaction.user_id !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized access to transaction' });
    }

    Transaction.deleteTransaction(req.params.id);
    res.json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
};

// Hàm tìm kiếm giao dịch theo note
exports.search = (req, res) => {
  const { searchTerm } = req.query;

  if (!searchTerm) {
    return res.status(400).json({ error: 'Vui lòng nhập từ khóa tìm kiếm' });
  }

  try {
    const transactions = Transaction.searchTransactionsByNote(req.userId, searchTerm);
    res.json(transactions);
  } catch (err) {
    console.error('Lỗi khi tìm kiếm giao dịch:', err);
    res.status(500).json({ error: 'Lỗi server khi tìm kiếm giao dịch' });
  }
};