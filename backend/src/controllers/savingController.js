const db = require('../database/db');
const jwt = require('jsonwebtoken');

// Create a new saving goal
const createSaving = async (req, res) => {
  try {
    console.log('=== CREATE SAVING DEBUG ===');
    console.log('req.body:', req.body);
    console.log('req.userId:', req.userId);
    
    const { goal_name, target_amount } = req.body;
    const user_id = req.userId;

    if (!goal_name || !target_amount) {
      return res.status(400).json({ message: 'Goal name and target amount are required' });
    }

    const sql = `
      INSERT INTO savings (user_id, goal_name, target_amount, current_amount)
      VALUES (?, ?, ?, 0)
    `;

    const stmt = db.prepare(sql);
    const result = await stmt.run(user_id, goal_name, target_amount);

    console.log('Insert result:', result);

    const response = {
      id: result.lastInsertRowid,
      user_id,
      goal_name,
      target_amount,
      current_amount: 0,
      completion_percentage: 0
    };

    console.log('Sending response:', response);
    res.status(201).json(response);
  } catch (error) {
    console.error('Error in createSaving:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all saving goals for a user
const getSavings = async (req, res) => {
  try {
    console.log('=== GET SAVINGS DEBUG - WITH AWAIT ===');
    console.log('req.userId:', req.userId);
    
    const user_id = req.userId;

    if (!user_id) {
      console.log('No user_id found, returning empty array');
      return res.json([]);
    }

    // Check if table exists
    const checkTableSql = `SELECT name FROM sqlite_master WHERE type='table' AND name='savings'`;
    const checkStmt = db.prepare(checkTableSql);
    const tableExists = await checkStmt.get();
    console.log('Savings table exists:', !!tableExists);

    // Check all data in savings table
    const allDataSql = `SELECT * FROM savings`;
    const allDataStmt = db.prepare(allDataSql);
    const allData = await allDataStmt.all();
    console.log('All data in savings table:', allData);

    const sql = `
      SELECT 
        id,
        goal_name,
        target_amount,
        current_amount,
        CASE 
          WHEN target_amount > 0 THEN ROUND((current_amount * 1.0 / target_amount) * 100, 2)
          ELSE 0
        END as completion_percentage
      FROM savings 
      WHERE user_id = ?
      ORDER BY id DESC
    `;

    console.log('Executing SQL:', sql);
    console.log('With user_id:', user_id);

    const stmt = db.prepare(sql);
    const rows = await stmt.all(user_id);
    
    console.log('SQL result rows AFTER AWAIT:', rows);
    console.log('Type of rows:', typeof rows);
    console.log('Is array:', Array.isArray(rows));
    console.log('Rows length:', rows.length);
    
    res.json(rows);
  } catch (error) {
    console.error('Error in getSavings:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Update saving goal progress
const updateSaving = async (req, res) => {
  try {
    const { id } = req.params;
    const { current_amount } = req.body;
    const user_id = req.userId;

    if (!current_amount) {
      return res.status(400).json({ message: 'Current amount is required' });
    }

    // First get the target amount to calculate completion percentage
    const stmt = db.prepare('SELECT target_amount FROM savings WHERE id = ? AND user_id = ?');
    const row = await stmt.get(id, user_id);

    if (!row) {
      return res.status(404).json({ message: 'Saving goal not found' });
    }

    const completion_percentage = Math.min(
      Math.round((current_amount / row.target_amount) * 100 * 100) / 100,
      100
    );

    const updateStmt = db.prepare(`
      UPDATE savings 
      SET current_amount = ?
      WHERE id = ? AND user_id = ?
    `);

    const result = await updateStmt.run(current_amount, id, user_id);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Saving goal not found' });
    }

    res.json({
      id,
      current_amount,
      completion_percentage,
      is_completed: completion_percentage >= 100
    });
  } catch (error) {
    console.error('Error in updateSaving:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete a saving goal
const deleteSaving = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.userId;

    const stmt = db.prepare('DELETE FROM savings WHERE id = ? AND user_id = ?');
    const result = await stmt.run(id, user_id);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Saving goal not found' });
    }

    res.json({ message: 'Saving goal deleted successfully' });
  } catch (error) {
    console.error('Error in deleteSaving:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const authMiddleware = (req, res, next) => {
    console.log('=== AUTH MIDDLEWARE DEBUG ===');
    console.log('Request path:', req.path);
    console.log('Request method:', req.method);
    
    const authHeader = req.headers['authorization'];
    console.log('Auth header:', authHeader);
    
    if (!authHeader) {
        console.log('No auth header found');
        return res.status(401).json({ message: 'No token provided' });
    }

    // Check if the token starts with 'Bearer '
    if (!authHeader.startsWith('Bearer ')) {
        console.log('Invalid token format');
        return res.status(401).json({ message: 'Invalid token format' });
    }

    // Extract the token by removing 'Bearer ' prefix
    const token = authHeader.split(' ')[1];
    console.log('Extracted token:', token.substring(0, 20) + '...');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);
        req.userId = decoded.id;
        console.log('Set req.userId to:', req.userId);
        next();
    } catch (error) {
        console.log('Token verification failed:', error.message);
        res.status(401).json({ message: 'Invalid token' });
    }
}

module.exports = {
  createSaving,
  getSavings,
  updateSaving,
  deleteSaving,
  authMiddleware
}; 