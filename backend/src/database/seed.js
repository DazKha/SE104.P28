const db = require('./db.js');

async function seedData() {
  try {
    console.log('Starting to seed data...');
    
    // Wait for database to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Insert sample user
    const userQuery = `INSERT OR IGNORE INTO users (id, name, email, password) VALUES (1, 'Test User', 'test@example.com', 'password')`;
    const userStmt = db.prepare(userQuery);
    await userStmt.run();
    console.log('✅ Sample user created');
    
    // Get Uncategorized category ID
    const categoryQuery = `SELECT id FROM categories WHERE name = 'Uncategorized'`;
    const categoryStmt = db.prepare(categoryQuery);
    const category = await categoryStmt.get();
    const categoryId = category ? category.id : 1;
    console.log('Using category ID:', categoryId);
    
    // Insert sample transactions
    const transactions = [
      {
        user_id: 1,
        amount: 50000,
        date: '2024-01-15',
        category_id: categoryId,
        note: 'Grocery shopping',
        type: 'outcome'
      },
      {
        user_id: 1,
        amount: 1000000,
        date: '2024-01-01',
        category_id: categoryId,
        note: 'Salary',
        type: 'income'
      },
      {
        user_id: 1,
        amount: 30000,
        date: '2024-01-10',
        category_id: categoryId,
        note: 'Coffee',
        type: 'outcome'
      }
    ];
    
    const transactionQuery = `INSERT OR IGNORE INTO transactions (user_id, amount, date, category_id, note, type) VALUES (?, ?, ?, ?, ?, ?)`;
    const transactionStmt = db.prepare(transactionQuery);
    
    for (const tx of transactions) {
      const result = await transactionStmt.run(tx.user_id, tx.amount, tx.date, tx.category_id, tx.note, tx.type);
      console.log('Inserted transaction:', tx.note, 'ID:', result.lastInsertRowid);
    }
    
    console.log('✅ Sample transactions created');
    console.log('✅ Seeding completed successfully!');
    
    // Verify data
    const allTransactions = await db.prepare('SELECT COUNT(*) as count FROM transactions').get();
    console.log('Total transactions in database:', allTransactions.count);
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedData();
}

module.exports = seedData; 