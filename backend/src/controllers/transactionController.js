const Transaction = require('../models/transactionModel');
const db = require('../database/db');
const budgetController = require('./budgetController');

// Map English categories to English (no translation needed now)
const categoryMapping = {
  'Food & Drinks': 'Food & Drinks',
  'Transportation': 'Transportation',
  'Housing': 'Housing',
  'Bills': 'Bills',
  'Travel': 'Travel',
  'Health': 'Health',
  'Education': 'Education',
  'Shopping': 'Shopping',
  'Pets': 'Pets',
  'Sports': 'Sports',
  'Entertainment': 'Entertainment',
  'Investment': 'Investment',
  'Family': 'Family',
  'Salary': 'Salary',
  'Bonus': 'Bonus',
  'Business': 'Business',
  'Gifts': 'Gifts'
};

// Helper function to validate transaction data
const validateTransactionData = (data) => {
  const errors = [];
  
  if (!data.amount || isNaN(data.amount) || data.amount <= 0) {
    errors.push('Amount must be a positive number');
  }
  
  // Enhanced date validation to handle DD/MM/YYYY format
  if (!data.date) {
    errors.push('Date is required');
  } else {
    // Check if date is in DD/MM/YYYY format
    const ddmmyyyyRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (ddmmyyyyRegex.test(data.date)) {
      // Parse DD/MM/YYYY format
      const [day, month, year] = data.date.split('/');
      const dateObj = new Date(year, month - 1, day);
      
      // Validate that the date is actually valid (e.g., not 32/13/2023)
      if (dateObj.getDate() != day || dateObj.getMonth() != month - 1 || dateObj.getFullYear() != year) {
        errors.push('Date is invalid');
      }
    } else if (isNaN(Date.parse(data.date))) {
      // Fallback to standard Date.parse for other formats
      errors.push('Date is invalid');
    }
  }
  
  if (!data.type || !['income', 'outcome'].includes(data.type)) {
    errors.push("Transaction type must be 'income' or 'outcome'");
  }
  
  return errors;
};

// Hàm lấy ID của category "Uncategorized"
const getDefaultCategoryId = async () => {
  const stmt = db.prepare(`SELECT id FROM categories WHERE name = 'Uncategorized'`);
  const row = await stmt.get();
  return row?.id || null;
};

// PUBLIC METHODS (No authentication required)
// Hàm lấy tất cả transactions (public)
exports.getPublicTransactions = async (req, res) => {
  const { month } = req.query;
  const userId = 1; // Default user for testing
  
  // Validate month format if provided
  if (month && !/^\d{4}-\d{2}$/.test(month)) {
    return res.status(400).json({ error: 'Invalid month format. Use YYYY-MM format' });
  }

  try {
    console.log('Fetching public transactions for user:', userId, 'month:', month);
    const rows = await Transaction.getTransactionsByUser(userId, month);
    console.log('Found public transactions:', rows.length);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching public transactions:', err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

// Hàm tạo transaction (public)
exports.createPublicTransaction = async (req, res) => {
  const data = { ...req.body, user_id: 1 }; // Default user for testing
  
  // Log received data for debugging
  console.log('=== BACKEND - CREATE PUBLIC TRANSACTION ===');
  console.log('Request body received:', req.body);
  console.log('req.body.note (description field):', req.body.note);
  console.log('req.body.description:', req.body.description);
  console.log('data.note after spread:', data.note);
  console.log('Full received transaction data:', {
    ...data,
    receipt_image: data.receipt_image ? 'Base64 data received' : 'No image data'
  });
  
  // Validate input
  const validationErrors = validateTransactionData(data);
  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  try {
    // Get category_id from category name if provided
    let category_id = data.category_id;
    
    // If category_id is provided, validate it exists
    if (category_id) {
      console.log('Validating provided category_id:', category_id);
      const categoryValidationStmt = db.prepare('SELECT id FROM categories WHERE id = ?');
      const categoryExists = await categoryValidationStmt.get(category_id);
      if (!categoryExists) {
        console.log('Category_id', category_id, 'does not exist, using default');
        category_id = await getDefaultCategoryId();
      } else {
        console.log('Category_id', category_id, 'is valid');
      }
    } else if (data.category && !category_id) {
      // Map category to database name if needed
      const mappedCategory = categoryMapping[data.category] || data.category;
      console.log('Looking up category:', mappedCategory);
      category_id = await Transaction.getCategoryIdByName(mappedCategory);
      console.log('Found category_id:', category_id);
    }
    
    if (!category_id) {
      console.log('No category_id found, using default category');
      category_id = await getDefaultCategoryId();
    }
    
    if (!category_id) {
      console.error('Failed to get category_id for transaction');
      return res.status(400).json({ error: 'Invalid category' });
    }

    const result = await Transaction.createTransaction({
      ...data,
      category_id
    });
    
    // Get category name from database
    const categoryQuery = `SELECT name FROM categories WHERE id = ?`;
    const categoryStmt = db.prepare(categoryQuery);
    const categoryRow = await categoryStmt.get(category_id);
    const categoryName = categoryRow ? categoryRow.name : 'Uncategorized';
    
    res.status(201).json({ 
      id: result.lastInsertRowid,
      user_id: data.user_id,
      amount: data.amount,
      date: data.date,
      category_id: category_id,
      note: data.note,
      type: data.type,
      description: data.note,
      category: categoryName,
      receipt_image: data.receipt_image,
      receipt_data: data.receipt_data
    });
  } catch (err) {
    console.error('Error creating transaction:', err);
    res.status(500).json({ error: 'Failed to create transaction', details: err.message });
  }
};

// Hàm tạo transaction
exports.create = async (req, res) => {
  const data = { ...req.body, user_id: req.userId };
  
  // Validate input
  const validationErrors = validateTransactionData(data);
  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  try {
    // Get category_id from category name if provided
    let category_id = data.category_id;
    
    // If category_id is provided, validate it exists
    if (category_id) {
      console.log('Validating provided category_id:', category_id);
      const categoryValidationStmt = db.prepare('SELECT id FROM categories WHERE id = ?');
      const categoryExists = await categoryValidationStmt.get(category_id);
      if (!categoryExists) {
        console.log('Category_id', category_id, 'does not exist, using default');
        category_id = await getDefaultCategoryId();
      } else {
        console.log('Category_id', category_id, 'is valid');
      }
    } else if (data.category && !category_id) {
      // Map category to database name if needed
      const mappedCategory = categoryMapping[data.category] || data.category;
      console.log('Looking up category:', mappedCategory);
      category_id = await Transaction.getCategoryIdByName(mappedCategory);
      console.log('Found category_id:', category_id);
    }
    
    if (!category_id) {
      console.log('No category_id found, using default category');
      category_id = await getDefaultCategoryId();
    }
    
    if (!category_id) {
      console.error('Failed to get category_id for transaction');
      return res.status(400).json({ error: 'Invalid category' });
    }

    const result = await Transaction.createTransaction({
      ...data,
      category_id
    });
    
    // Nếu là giao dịch chi tiêu, cập nhật cột 'used' trong budget
    if (data.type === 'outcome') {
      // Lấy month từ date dạng 'DD/MM/YYYY'
      const [day, monthStr, year] = data.date.split('/');
      const monthBudget = `${year}-${monthStr}`;
      budgetController.updateBudgetUsed({
        user: data.user_id,
        amount: data.amount,
        month: monthBudget,
        type: 'outcome'
      });
    }
    
    // Get category name from database
    const categoryQuery = `SELECT name FROM categories WHERE id = ?`;
    const categoryStmt = db.prepare(categoryQuery);
    const categoryRow = await categoryStmt.get(category_id);
    const categoryName = categoryRow ? categoryRow.name : 'Uncategorized';
    
    res.status(201).json({ 
      id: result.lastInsertRowid,
      user_id: data.user_id,
      amount: data.amount,
      date: data.date,
      category_id: category_id,
      note: data.note,
      type: data.type,
      description: data.note,
      category: categoryName
    });
  } catch (err) {
    console.error('Error creating transaction:', err);
    res.status(500).json({ error: 'Failed to create transaction', details: err.message });
  }
};

// Hàm lấy tất cả transactions của user
exports.getByUser = async (req, res) => {
  try {
    const { month } = req.query;
    const userId = req.userId; // Lấy userId từ token đã verify
    
    console.log('Getting transactions for user:', userId, 'month:', month);
    
    // Validate month format if provided
    if (month && !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ error: 'Invalid month format. Use YYYY-MM format.' });
    }

    const transactions = await Transaction.getTransactionsByUser(userId, month);
    console.log('Found transactions:', transactions.length);
    
    res.json(transactions);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ 
      error: 'Failed to fetch transactions',
      details: err.message 
    });
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

    // Nếu là giao dịch outcome, revert used cũ trước khi update
    if (existingTransaction.type === 'outcome') {
      const [day, monthStr, year] = existingTransaction.date.split('/');
      const monthBudget = `${year}-${monthStr}`;
      budgetController.updateBudgetUsed({
        user: existingTransaction.user_id,
        amount: -existingTransaction.amount,
        month: monthBudget,
        type: 'outcome'
      });
    }
    // Nếu giao dịch mới là outcome, cộng used mới
    if (updateData.type === 'outcome') {
      const [day, monthStr, year] = updateData.date.split('/');
      const monthBudget = `${year}-${monthStr}`;
      budgetController.updateBudgetUsed({
        user: userId,
        amount: updateData.amount,
        month: monthBudget,
        type: 'outcome'
      });
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

    // Nếu là giao dịch outcome, revert used
    if (transaction.type === 'outcome') {
      const [day, monthStr, year] = transaction.date.split('/');
      const monthBudget = `${year}-${monthStr}`;
      budgetController.updateBudgetUsed({
        user: transaction.user_id,
        amount: -transaction.amount,
        month: monthBudget,
        type: 'outcome'
      });
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

// Public update transaction (no authentication)
exports.updatePublicTransaction = async (req, res) => {
  try {
    const transactionId = req.params.id;
    const updateData = req.body;

    console.log('Updating public transaction:', transactionId, updateData);

    // Validate update data
    const validationErrors = validateTransactionData(updateData);
    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    // Get category_id from category name if needed
    let categoryId = updateData.category_id;
    if (!categoryId && updateData.category) {
      // Find category by name
      const categoryQuery = `SELECT id FROM categories WHERE name = ?`;
      const categoryStmt = db.prepare(categoryQuery);
      const category = await categoryStmt.get(updateData.category);
      categoryId = category ? category.id : await getDefaultCategoryId();
    }

    // Update the transaction (no user_id check for public API)
    const updateQuery = `
      UPDATE transactions
      SET amount = ?,
          date = ?,
          category_id = ?,
          note = ?,
          type = ?
      WHERE id = ?
    `;
    
    const updateStmt = db.prepare(updateQuery);
    const result = await updateStmt.run(
      updateData.amount,
      updateData.date,
      categoryId,
      updateData.description || updateData.note || '',
      updateData.type,
      transactionId
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Transaction not found or failed to update' });
    }

    // Get the updated transaction
    const getQuery = `
      SELECT t.*, c.name as category_name
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.id = ?
    `;
    const getStmt = db.prepare(getQuery);
    const updatedTransaction = await getStmt.get(transactionId);

    res.json(updatedTransaction);
  } catch (err) {
    console.error('Error updating public transaction:', err);
    res.status(500).json({ error: 'Failed to update transaction', details: err.message });
  }
};

// Public delete transaction (no authentication)
exports.deletePublicTransaction = async (req, res) => {
  try {
    const transactionId = req.params.id;

    console.log('Deleting public transaction:', transactionId);

    // Delete the transaction (no user_id check for public API)
    const deleteQuery = `DELETE FROM transactions WHERE id = ?`;
    const deleteStmt = db.prepare(deleteQuery);
    const result = await deleteStmt.run(transactionId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    console.error('Error deleting public transaction:', err);
    res.status(500).json({ error: 'Failed to delete transaction', details: err.message });
  }
};