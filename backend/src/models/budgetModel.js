const db = require('../database/db');

class Budget {
  static async create({ user, month, amount }) {
    const query = `
      INSERT INTO budgets (user_id, month, amount, used)
      VALUES (?, ?, ?, 0)
    `;
    const values = [user, month, amount];
    
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

  static async findByUserAndMonth(userId, month) {
    const query = `
      SELECT * FROM budgets 
      WHERE user_id = ? 
      AND month = ?
    `;
    const values = [userId, month];
    
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

  static async update(id, userId, amount) {
    const query = `
      UPDATE budgets 
      SET amount = ?
      WHERE id = ? AND user_id = ?
    `;
    const values = [amount, id, userId];
    
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
      DELETE FROM budgets 
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

  static async updateUsedAmount(transaction) {
    if (transaction.type !== 'Expense') return;

    const query = `
      UPDATE budgets 
      SET used = used + ?
      WHERE user_id = ? 
      AND month = ?
    `;
    const values = [transaction.amount, transaction.user, transaction.month];
    
    return new Promise((resolve, reject) => {
      db.run(query, values, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

module.exports = Budget; 