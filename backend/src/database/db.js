const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Tạo đường dẫn tuyệt đối đến finance.db
const dbPath = path.resolve(__dirname, '../../data/expenses.db');

// Kết nối đến SQLite
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});
// Tạo schema và chèn dữ liệu mẫu
db.serialize(() => {
  // 1. Tạo bảng users
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);

  // 2. Tạo bảng categories
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    )
  `);

  // 3. Tạo bảng transactions
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      date DATETIME NOT NULL,
      category_id INTEGER NOT NULL,
      note TEXT,
      type TEXT CHECK (type IN ('income', 'outcome')) NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

  // 4. Tạo bảng savings
  db.run(`
    CREATE TABLE IF NOT EXISTS savings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      goal_name TEXT NOT NULL,
      target_amount REAL NOT NULL,
      current_amount REAL NOT NULL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // 5. Tạo bảng loans_debts
  db.run(`
    CREATE TABLE IF NOT EXISTS loans_debts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      person TEXT NOT NULL,
      due_date DATETIME NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // 6. Tạo bảng budgets
  db.run(`
    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      month TEXT NOT NULL,
      amount REAL NOT NULL,
      used REAL NOT NULL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // 7. Chèn dữ liệu mẫu cho bảng categories
  const categories = [
    'Ăn uống', 'Di chuyển', 'Thuê nhà', 'Hoá đơn', 'Du lịch', 'Sức khoẻ',
    'Giáo dục', 'Mua sắm', 'Vật nuôi', 'Thể dục thể thao', 'Giải trí',
    'Đầu tư', 'Người thân', 'Không xác định'
  ];

  // Kiểm tra xem bảng categories đã có dữ liệu chưa
  db.get(`SELECT COUNT(*) as count FROM categories`, (err, row) => {
    if (err) {
      console.error('Error checking categories:', err);
      return;
    }
    if (row.count === 0) {
      // Nếu bảng trống, chèn dữ liệu mẫu
      const stmt = db.prepare(`INSERT OR IGNORE INTO categories (name) VALUES (?)`);
      categories.forEach(category => {
        stmt.run(category);
      });
      stmt.finalize();
      console.log('Categories seeded successfully');
    } else {
      console.log('Categories already seeded');
    }
  });
});

// Đóng kết nối khi server dừng (tuỳ chọn)
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing SQLite:', err);
    }
    console.log('SQLite connection closed');
    process.exit(0);
  });
});

module.exports = db;
