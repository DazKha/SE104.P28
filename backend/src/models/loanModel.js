const db = require('../database/db');

class Loan {
  static async create({ user_id, amount, person, due_date, type }) {
    const query = `
      INSERT INTO loans_debts (user_id, amount, person, due_date, type, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `;
    const stmt = db.prepare(query);
    const result = await stmt.run(user_id, amount, person, due_date, type);
    return result.lastInsertRowid;
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
    
    const stmt = db.prepare(query);
    return await stmt.all(...values);
  }

  static async findById(id, userId) {
    const query = `
      SELECT * FROM loans_debts 
      WHERE id = ? AND user_id = ?
    `;
    const stmt = db.prepare(query);
    return await stmt.get(id, userId);
  }

  static async update(id, userId, { amount, person, due_date, type, status }) {
    console.log(`📝 LOAN MODEL - update called with id: ${id}, userId: ${userId}`);
    console.log('📝 LOAN MODEL - update data:', { amount, person, due_date, type, status });
    
    const query = `
      UPDATE loans_debts 
      SET amount = ?,
          person = ?,
          due_date = ?,
          type = ?,
          status = ?
      WHERE id = ? AND user_id = ?
    `;
    const stmt = db.prepare(query);
    const result = await stmt.run(amount, person, due_date, type, status, id, userId);
    
    console.log(`📝 LOAN MODEL - update result:`, result);
    console.log(`📝 LOAN MODEL - changes: ${result.changes}`);
    
    return result.changes > 0;
  }

  static async updateStatus(id, userId, status) {
    console.log(`📝 LOAN MODEL - updateStatus called with id: ${id}, userId: ${userId}, status: ${status}`);
    
    try {
      // First check if the loan exists and belongs to the user
      const checkQuery = `
        SELECT id FROM loans_debts 
        WHERE id = ? AND user_id = ?
      `;
      const checkStmt = db.prepare(checkQuery);
      const loan = await checkStmt.get(id, userId);
      
      if (!loan) {
        console.log(`❌ LOAN NOT FOUND - ID: ${id}, UserId: ${userId}`);
        return false;
      }

      // Then update the status
      const updateQuery = `
        UPDATE loans_debts 
        SET status = ?
        WHERE id = ? AND user_id = ?
      `;
      const updateStmt = db.prepare(updateQuery);
      const result = await updateStmt.run(status, id, userId);
      
      console.log(`📝 LOAN MODEL - Update result:`, result);
      return result.changes > 0;
    } catch (error) {
      console.error('Error in updateStatus:', error);
      throw error;
    }
  }

  static async delete(id, userId) {
    const query = `
      DELETE FROM loans_debts 
      WHERE id = ? AND user_id = ?
    `;
    const stmt = db.prepare(query);
    const result = await stmt.run(id, userId);
    return result.changes > 0;
  }
}

module.exports = Loan; 