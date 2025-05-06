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

// READ ALL for user
exports.getTransactionsByUser = (userId, callback) => {
  const query = `
    SELECT t.*, c.name as category_name
    FROM transactions t
    LEFT JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = ?
    ORDER BY t.date DESC
  `;
  db.all(query, [userId], callback);
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