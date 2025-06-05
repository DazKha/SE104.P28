const db = require('../database/db');

class Loan {
  static create({ user_id, amount, person, due_date, type }) {
    const query = `
      INSERT INTO loans_debts (user_id, amount, person, due_date, type, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `;
    const stmt = db.prepare(query);
    const result = stmt.run(user_id, amount, person, due_date, type);
    return result.lastInsertRowid;
  }

  static findByUser(userId, status = null) {
    let query = `
      SELECT * FROM loans_debts 
      WHERE user_id = ?
    `;
    const values = [userId];

    if (status) {
      query += ' AND status = ?';
      values.push(status);
    }

    query += ' ORDER BY due_date ASC';
    
    const stmt = db.prepare(query);
    return stmt.all(...values);
  }

  static update(id, userId, { amount, person, due_date, type, status }) {
    const query = `
      UPDATE loans_debts 
      SET amount = ?,
          person = ?,
          due_date = ?,
          type = ?,
          status = ?
      WHERE id = ? AND user_id = ?
    `;
    const stmt = db.prepare(query);
    const result = stmt.run(amount, person, due_date, type, status, id, userId);
    return result.changes > 0;
  }

  static updateStatus(id, userId, status) {
    const query = `
      UPDATE loans_debts 
      SET status = ?
      WHERE id = ? AND user_id = ?
    `;
    const stmt = db.prepare(query);
    const result = stmt.run(status, id, userId);
    return result.changes > 0;
  }

  static delete(id, userId) {
    const query = `
      DELETE FROM loans_debts 
      WHERE id = ? AND user_id = ?
    `;
    const stmt = db.prepare(query);
    const result = stmt.run(id, userId);
    return result.changes > 0;
  }
}

module.exports = Loan; 