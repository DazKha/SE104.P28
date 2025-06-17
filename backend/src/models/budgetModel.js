const db = require('../database/db');

class Budget {
  static async create({ user, month, amount }) {
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
    const sumRow = await sumStmt.get(user, monthYear);
    const used = sumRow ? sumRow.used : 0;

    const query = `
      INSERT INTO budgets (user_id, month, amount, used)
      VALUES (?, ?, ?, ?)
    `;
    const stmt = db.prepare(query);
    const result = await stmt.run(user, month, amount, used);
    return result.lastInsertRowid;
  }

  static async findByUserAndMonth(userId, month) {
    const query = `
      SELECT * FROM budgets 
      WHERE user_id = ? 
      AND month = ?
    `;
    const stmt = db.prepare(query);
    return await stmt.all(userId, month);
  }

  static async update(id, userId, amount) {
    const query = `
      UPDATE budgets 
      SET amount = ?
      WHERE id = ? AND user_id = ?
    `;
    const stmt = db.prepare(query);
    const result = await stmt.run(amount, id, userId);
    return result.changes > 0;
  }

  static async delete(id, userId) {
    const query = `
      DELETE FROM budgets 
      WHERE id = ? AND user_id = ?
    `;
    const stmt = db.prepare(query);
    const result = await stmt.run(id, userId);
    return result.changes > 0;
  }

  static async updateUsedAmount(transaction) {
    if (transaction.type !== 'outcome') return;
  
    const query = `
      UPDATE budgets 
      SET used = used + ?
      WHERE user_id = ? 
      AND month = ?
    `;
    const stmt = db.prepare(query);
    await stmt.run(transaction.amount, transaction.user, transaction.month);
  }

  static async revertUsedAmount(transaction) {
    if (transaction.type !== 'outcome') return;

    const query = `
      UPDATE budgets
      SET used = used - ?
      WHERE user_id = ?
        AND month = ?
    `;
    const stmt = db.prepare(query);
    await stmt.run(transaction.amount, transaction.user, transaction.month);
  }
}

module.exports = Budget; 