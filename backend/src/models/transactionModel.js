const db = require('../database/db');

// tạo transaction
exports.createTransaction = (transactionData, callback) => {
  const { user_id, amount, date, category_id, note, type } = transactionData;

  const query = `
    INSERT INTO transactions (user_id, amount, date, category_id, note, type)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [user_id, amount, date, category_id, note, type], callback);
};

// READ ALL for user with optional month filter
exports.getTransactionsByUser = (userId, month, callback) => {
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
  
  db.all(query, params, callback);
};

// READ ONE
exports.getTransactionById = (id, callback) => {
  const query = `SELECT * FROM transactions WHERE id = ?`;
  db.get(query, [id], callback);
};

// UPDATE
exports.updateTransaction = (id, transactionData, callback) => {
  const {
    amount, date, category_id, note, type
  } = transactionData;

  const query = `
    UPDATE transactions
    SET amount = ?, date = ?, category_id = ?, note = ?, type = ?
    WHERE id = ?
  `;
  db.run(query, [amount, date, category_id, note, type, id], callback);
};

// DELETE
exports.deleteTransaction = (id, callback) => {
  const query = `DELETE FROM transactions WHERE id = ?`;
  db.run(query, [id], callback);
};

// Search transactions by note content
exports.searchTransactionsByNote = (userId, searchTerm, callback) => {
  const query = `
    SELECT t.*, c.name as category_name
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = ? AND t.note LIKE ?
    ORDER BY t.date DESC
  `;
  const searchPattern = `%${searchTerm}%`;
  db.all(query, [userId, searchPattern], callback);
};