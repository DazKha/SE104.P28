const Database = require('better-sqlite3');
const path = require('path');

// Tạo đường dẫn tuyệt đối đến .db
const dbPath = path.resolve(__dirname, '../../data/expenses.db');

// Kết nối đến SQLite
const db = new Database(dbPath, { verbose: console.log });

// Enable foreign key constraints
db.pragma('foreign_keys = ON');

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
    receipt_image TEXT,
    receipt_data TEXT,
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
  'Uncategorized', 'Food & Drinks', 'Transportation', 'Housing', 'Bills', 'Travel', 'Health',
  'Education', 'Shopping', 'Pets', 'Sports', 'Entertainment',
  'Investment', 'Family', 'Salary', 'Bonus', 'Business', 'Gifts'
];

// Function to reset categories with proper IDs
function resetCategories() {
  try {
    console.log('⚠️  Warning: Resetting categories will delete all existing transactions!');
    // First, delete all transactions to avoid foreign key constraints
    db.prepare('DELETE FROM transactions').run();
    // Delete all categories
    db.prepare('DELETE FROM categories').run();
    // Reset the auto-increment counter
    db.prepare("DELETE FROM sqlite_sequence WHERE name='categories'").run();
    
    // Insert categories with fresh IDs starting from 1
    const insertCategory = db.prepare('INSERT INTO categories (name) VALUES (?)');
    for (const category of categories) {
      insertCategory.run(category);
    }
    console.log('✅ Categories reset successfully with IDs 1-18');
  } catch (error) {
    console.error('❌ Error resetting categories:', error);
  }
}

// Kiểm tra xem bảng categories đã có dữ liệu chưa
const count = db.prepare('SELECT COUNT(*) as count FROM categories').get();
const maxId = db.prepare('SELECT MAX(id) as maxId FROM categories').get().maxId || 0;

if (count.count === 0) {
  // Nếu bảng trống, chèn dữ liệu mẫu
  const insertCategory = db.prepare('INSERT INTO categories (name) VALUES (?)');
  for (const category of categories) {
    insertCategory.run(category);
  }
  console.log('✅ Categories seeded successfully');
} else if (maxId > 50) {
  // If category IDs are too high (indicating previous deletion/recreation cycles), reset them
  console.log('🔧 Category IDs are too high (max: ' + maxId + '), resetting...');
  resetCategories();
} else {
  // Nếu bảng đã có dữ liệu và IDs reasonable, chỉ thêm những category chưa có
  const insertCategory = db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)');
  let newCategoriesCount = 0;
  for (const category of categories) {
    const result = insertCategory.run(category);
    if (result.changes > 0) {
      newCategoriesCount++;
    }
  }
  if (newCategoriesCount > 0) {
    console.log(`✅ Added ${newCategoriesCount} new categories`);
  } else {
    console.log('✅ All categories already exist');
  }
}

// Đóng kết nối khi server dừng
process.on('SIGINT', () => {
  db.close();
  console.log('SQLite connection closed');
  process.exit(0);
});

module.exports = db;
