const db = require('../database/db');

const User = {
  create: (user) => {
    const { name, email, password } = user;
    const stmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    return stmt.run(name, email, password);
  },

  findByEmail: (email) => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  },

  getAllUsers: async () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT id, name, email FROM users', [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
};

module.exports = User;