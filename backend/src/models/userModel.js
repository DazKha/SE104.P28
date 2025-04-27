const db = require('../database/db');

const User = {
  create: (user, callback) => {
    const { name, email, password } = user;
    db.run(
      `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
      [name, email, password],
      callback
    );
  },

  findByEmail: (email, callback) => {
    db.get(`SELECT * FROM users WHERE email = ?`, [email], callback);
  }
};

module.exports = User;