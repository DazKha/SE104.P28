const db = require('../database/db');

class Budget {
  static create({ user, month, amount }) {
    const query = `
      INSERT INTO budgets (user_id, month, amount, used)
      VALUES (?, ?, ?, 0)
    `;
    const stmt = db.prepare(query);
    const result = stmt.run(user, month, amount);
    return result.lastInsertRowid;
  }

  static findByUserAndMonth(userId, month) {
    const query = `
      SELECT * FROM budgets 
      WHERE user_id = ? 
      AND month = ?
    `;
    const stmt = db.prepare(query);
    return stmt.all(userId, month);
  }

  static update(id, userId, amount) {
    const query = `
      UPDATE budgets 
      SET amount = ?
      WHERE id = ? AND user_id = ?
    `;
    const stmt = db.prepare(query);
    const result = stmt.run(amount, id, userId);
    return result.changes > 0;
  }

  static delete(id, userId) {
    const query = `
      DELETE FROM budgets 
      WHERE id = ? AND user_id = ?
    `;
    const stmt = db.prepare(query);
    const result = stmt.run(id, userId);
    return result.changes > 0;
  }

  static updateUsedAmount(transaction) {
    if (transaction.type !== 'Expense') return;

    const query = `
      UPDATE budgets 
      SET used = used + ?
      WHERE user_id = ? 
      AND month = ?
    `;
    const stmt = db.prepare(query);
    stmt.run(transaction.amount, transaction.user, transaction.month);
  }
}

module.exports = Budget; 