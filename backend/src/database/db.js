const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Tạo đường dẫn tuyệt đối đến .db
const dbPath = path.resolve(__dirname, '../../data/expenses.db');

// Kết nối đến SQLite
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Enable foreign key constraints
db.run('PRAGMA foreign_keys = ON');

// Tạo schema và chèn dữ liệu mẫu
const createTablesSQL = `
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
`;

// Execute schema creation
db.exec(createTablesSQL, (err) => {
  if (err) {
    console.error('Error creating tables:', err.message);
  } else {
    console.log('Tables created successfully');
    initializeCategories();
  }
});

// Chèn dữ liệu mẫu cho bảng categories
const categories = [
  'Uncategorized', 'Food & Drinks', 'Transportation', 'Housing', 'Bills', 'Travel', 'Health',
  'Education', 'Shopping', 'Pets', 'Sports', 'Entertainment',
  'Investment', 'Family', 'Salary', 'Bonus', 'Business', 'Gifts'
];

// Function to initialize categories
function initializeCategories() {
  // Check if categories exist
  db.get('SELECT COUNT(*) as count FROM categories', (err, row) => {
    if (err) {
      console.error('Error checking categories:', err.message);
      return;
    }
    
    if (row.count === 0) {
      // Insert categories
      const stmt = db.prepare('INSERT INTO categories (name) VALUES (?)');
      categories.forEach(category => {
        stmt.run(category, (err) => {
          if (err) {
            console.error('Error inserting category:', err.message);
          }
        });
      });
      stmt.finalize(() => {
        console.log('Categories seeded successfully');
      });
    } else {
      console.log('✅ Categories already exist');
    }
  });
}

// Helper functions to make sqlite3 work similar to better-sqlite3
const dbWrapper = {
  prepare: (sql) => {
    const stmt = db.prepare(sql);
    return {
      run: (...params) => {
        return new Promise((resolve, reject) => {
          stmt.run(params, function(err) {
            if (err) reject(err);
            else resolve({ changes: this.changes, lastInsertRowid: this.lastID });
          });
        });
      },
      get: (...params) => {
        return new Promise((resolve, reject) => {
          stmt.get(params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
          });
        });
      },
      all: (...params) => {
        return new Promise((resolve, reject) => {
          stmt.all(params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
          });
        });
      },
      finalize: () => stmt.finalize()
    };
  },
  exec: (sql) => {
    return new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  },
  close: () => {
    return new Promise((resolve, reject) => {
      db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
};

// Đóng kết nối khi server dừng
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('SQLite connection closed');
    }
    process.exit(0);
  });
});

module.exports = dbWrapper;
