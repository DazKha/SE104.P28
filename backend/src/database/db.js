const Database = require('better-sqlite3');
const path = require('path');

// Tạo đường dẫn tuyệt đối đến .db
const dbPath = path.resolve(__dirname, '../../data/expenses.db');

// Kết nối đến SQLite
const db = new Database(dbPath, { verbose: console.log });

console.log('Connected to SQLite database');

// Tạo schema và chèn dữ liệu mẫu
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL
  );

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
  );

  CREATE TABLE IF NOT EXISTS savings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    goal_name TEXT NOT NULL,
    target_amount REAL NOT NULL,
    current_amount REAL NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS loans_debts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    person TEXT NOT NULL,
    due_date DATETIME NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    month TEXT NOT NULL,
    amount REAL NOT NULL,
    used REAL NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Chèn dữ liệu mẫu cho bảng categories
const categories = [
  'Ăn uống', 'Di chuyển', 'Thuê nhà', 'Hoá đơn', 'Du lịch', 'Sức khoẻ',
  'Giáo dục', 'Mua sắm', 'Vật nuôi', 'Thể dục thể thao', 'Giải trí',
  'Đầu tư', 'Người thân', 'Không xác định', 'Lương', 'Thưởng', 'Kinh doanh'
];

// Kiểm tra xem bảng categories đã có dữ liệu chưa
const count = db.prepare('SELECT COUNT(*) as count FROM categories').get();
if (count.count === 0) {
  // Nếu bảng trống, chèn dữ liệu mẫu
  const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)');
  for (const category of categories) {
    insertCategory.run(category);
  }
  console.log('Categories seeded successfully');
} else {
  console.log('Categories already seeded');
}

// Đóng kết nối khi server dừng
process.on('SIGINT', () => {
  db.close();
  console.log('SQLite connection closed');
  process.exit(0);
});

module.exports = db;
