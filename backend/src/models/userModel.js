const db = require('../database/db');

const User = {
  create: async (user) => {
    const { name, email, password } = user;
    const stmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    return await stmt.run(name, email, password);
  },

  findByEmail: async (email) => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return await stmt.get(email);
  },

  getAllUsers: async () => {
    const stmt = db.prepare('SELECT id, name, email FROM users');
    return await stmt.all();
  }
};

module.exports = User;