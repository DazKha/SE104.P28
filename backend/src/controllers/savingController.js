const db = require('../database/db');

// Create a new saving goal
const createSaving = async (req, res) => {
  try {
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
    const result = stmt.run(user_id, goal_name, target_amount);

    res.status(201).json({
      id: result.lastInsertRowid,
      user_id,
      goal_name,
      target_amount,
      current_amount: 0,
      completion_percentage: 0
    });
  } catch (error) {
    console.error('Error in createSaving:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all saving goals for a user
const getSavings = async (req, res) => {
  try {
    const user_id = req.userId;

    const sql = `
      SELECT 
        id,
        goal_name,
        target_amount,
        current_amount,
        ROUND((current_amount / target_amount) * 100, 2) as completion_percentage
      FROM savings 
      WHERE user_id = ?
    `;

    const stmt = db.prepare(sql);
    const rows = stmt.all(user_id);
    res.json(rows);
  } catch (error) {
    console.error('Error in getSavings:', error);
    res.status(500).json({ message: 'Internal server error' });
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
    const row = stmt.get(id, user_id);

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

    const result = updateStmt.run(current_amount, id, user_id);

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
    const result = stmt.run(id, user_id);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Saving goal not found' });
    }

    res.json({ message: 'Saving goal deleted successfully' });
  } catch (error) {
    console.error('Error in deleteSaving:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createSaving,
  getSavings,
  updateSaving,
  deleteSaving
}; 