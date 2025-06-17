const db = require('../database/db');

// tạo transaction
exports.createTransaction = async (transactionData) => {
  const { user_id, amount, date, category_id, note, type, receipt_image, receipt_data } = transactionData;

  console.log('=== TRANSACTION MODEL - CREATE TRANSACTION ===');
  console.log('transactionData received:', transactionData);
  console.log('note field value:', note);
  console.log('note type:', typeof note);

  const query = `
    INSERT INTO transactions (user_id, amount, date, category_id, note, type, receipt_image, receipt_data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const stmt = db.prepare(query);
  const result = await stmt.run(user_id, amount, date, category_id, note, type, receipt_image, receipt_data);
  
  console.log('Transaction inserted with ID:', result.lastInsertRowid);
  console.log('Note value inserted:', note);
  
  return result;
};

// READ ALL for user with optional month filter
exports.getTransactionsByUser = async (userId, month) => {
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
  return await stmt.all(...params);
};

// READ ONE
exports.getTransactionById = async (id) => {
  const query = `SELECT * FROM transactions WHERE id = ?`;
  const stmt = db.prepare(query);
  return await stmt.get(id);
};

// UPDATE
exports.updateTransaction = async (id, transactionData) => {
  const {
    amount, date, category_id, note, type
  } = transactionData;

  const query = `
    UPDATE transactions
    SET amount = ?, date = ?, category_id = ?, note = ?, type = ?
    WHERE id = ?
  `;
  const stmt = db.prepare(query);
  return await stmt.run(amount, date, category_id, note, type, id);
};

// DELETE
exports.deleteTransaction = async (id) => {
  const query = `DELETE FROM transactions WHERE id = ?`;
  const stmt = db.prepare(query);
  return await stmt.run(id);
};

// Search transactions by note content
exports.searchTransactionsByNote = async (userId, searchTerm) => {
  const query = `
    SELECT t.*, c.name as category_name
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = ? AND t.note LIKE ?
    ORDER BY t.date DESC
  `;
  const searchPattern = `%${searchTerm}%`;
  const stmt = db.prepare(query);
  return await stmt.all(userId, searchPattern);
};

// Get category ID by name
exports.getCategoryIdByName = async (categoryName) => {
  try {
    console.log('Getting category ID for:', categoryName);
    const query = `
      SELECT id FROM categories 
      WHERE name = ? 
      LIMIT 1
    `;
    const stmt = db.prepare(query);
    const result = await stmt.get(categoryName);
    console.log('Category lookup result:', result);
    return result ? result.id : null;
  } catch (err) {
    console.error('Error getting category ID:', err);
    return null;
  }
};