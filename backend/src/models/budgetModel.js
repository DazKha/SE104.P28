const db = require('../database/db');

class Budget {
  static create({ user, month, amount }) {
    // Tính tổng outcome đã có trong tháng này
    const sumQuery = `
      SELECT COALESCE(SUM(amount), 0) as used
      FROM transactions
      WHERE user_id = ? AND type = 'outcome' AND substr(date, 4, 7) = ?
    `;
    // month: 'YYYY-MM' => 'MM/YYYY'
    const [y, m] = month.split('-');
    const monthYear = `${m}/${y}`;
    const sumStmt = db.prepare(sumQuery);
    const sumRow = sumStmt.get(user, monthYear);
    const used = sumRow.used;

    const query = `
      INSERT INTO budgets (user_id, month, amount, used)
      VALUES (?, ?, ?, ?)
    `;
    const stmt = db.prepare(query);
    const result = stmt.run(user, month, amount, used);
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
    if (transaction.type !== 'outcome') return;
  
    const query = `
      UPDATE budgets 
      SET used = used + ?
      WHERE user_id = ? 
      AND month = ?
    `;
    const stmt = db.prepare(query);
    stmt.run(transaction.amount, transaction.user, transaction.month);
  }

  static revertUsedAmount(transaction) {
    if (transaction.type !== 'outcome') return;

    const query = `
      UPDATE budgets
      SET used = used - ?
      WHERE user_id = ?
        AND month = ?
    `;
    const stmt = db.prepare(query);
    stmt.run(transaction.amount, transaction.user, transaction.month);
  }
}

module.exports = Budget; 