const db = require('../database/db');

class Loan {
  static async create({ user_id, amount, person, due_date, type }) {
    const query = `
      INSERT INTO loans_debts (user_id, amount, person, due_date, type, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `;
    const values = [user_id, amount, person, due_date, type];
    
    return new Promise((resolve, reject) => {
      db.run(query, values, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  }

  static async findByUser(userId, status = null) {
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
    
    return new Promise((resolve, reject) => {
      db.all(query, values, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static async update(id, userId, { amount, person, due_date, type, status }) {
    const query = `
      UPDATE loans_debts 
      SET amount = ?,
          person = ?,
          due_date = ?,
          type = ?,
          status = ?
      WHERE id = ? AND user_id = ?
    `;
    const values = [amount, person, due_date, type, status, id, userId];
    
    return new Promise((resolve, reject) => {
      db.run(query, values, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  static async updateStatus(id, userId, status) {
    const query = `
      UPDATE loans_debts 
      SET status = ?
      WHERE id = ? AND user_id = ?
    `;
    const values = [status, id, userId];
    
    return new Promise((resolve, reject) => {
      db.run(query, values, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  static async delete(id, userId) {
    const query = `
      DELETE FROM loans_debts 
      WHERE id = ? AND user_id = ?
    `;
    const values = [id, userId];
    
    return new Promise((resolve, reject) => {
      db.run(query, values, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }
}

module.exports = Loan; 