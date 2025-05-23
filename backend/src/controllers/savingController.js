const db = require('../database/db');

// Create a new saving goal
const createSaving = async (req, res) => {
  try {
    const { goal_name, target_amount } = req.body;
    const user_id = req.user.id;

    if (!goal_name || !target_amount) {
      return res.status(400).json({ message: 'Goal name and target amount are required' });
    }

    const sql = `
      INSERT INTO savings (user_id, goal_name, target_amount, current_amount)
      VALUES (?, ?, ?, 0)
    `;

    db.run(sql, [user_id, goal_name, target_amount], function(err) {
      if (err) {
        console.error('Error creating saving goal:', err);
        return res.status(500).json({ message: 'Error creating saving goal' });
      }

      res.status(201).json({
        id: this.lastID,
        user_id,
        goal_name,
        target_amount,
        current_amount: 0,
        completion_percentage: 0
      });
    });
  } catch (error) {
    console.error('Error in createSaving:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all saving goals for a user
const getSavings = async (req, res) => {
  try {
    const user_id = req.user.id;

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

    db.all(sql, [user_id], (err, rows) => {
      if (err) {
        console.error('Error getting saving goals:', err);
        return res.status(500).json({ message: 'Error getting saving goals' });
      }

      res.json(rows);
    });
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
    const user_id = req.user.id;

    if (!current_amount) {
      return res.status(400).json({ message: 'Current amount is required' });
    }

    // First get the target amount to calculate completion percentage
    db.get('SELECT target_amount FROM savings WHERE id = ? AND user_id = ?', 
      [id, user_id], 
      (err, row) => {
        if (err) {
          console.error('Error getting saving goal:', err);
          return res.status(500).json({ message: 'Error getting saving goal' });
        }

        if (!row) {
          return res.status(404).json({ message: 'Saving goal not found' });
        }

        const completion_percentage = Math.min(
          Math.round((current_amount / row.target_amount) * 100 * 100) / 100,
          100
        );

        const sql = `
          UPDATE savings 
          SET current_amount = ?
          WHERE id = ? AND user_id = ?
        `;

        db.run(sql, [current_amount, id, user_id], function(err) {
          if (err) {
            console.error('Error updating saving goal:', err);
            return res.status(500).json({ message: 'Error updating saving goal' });
          }

          if (this.changes === 0) {
            return res.status(404).json({ message: 'Saving goal not found' });
          }

          res.json({
            id,
            current_amount,
            completion_percentage,
            is_completed: completion_percentage >= 100
          });
        });
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
    const user_id = req.user.id;

    const sql = 'DELETE FROM savings WHERE id = ? AND user_id = ?';

    db.run(sql, [id, user_id], function(err) {
      if (err) {
        console.error('Error deleting saving goal:', err);
        return res.status(500).json({ message: 'Error deleting saving goal' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ message: 'Saving goal not found' });
      }

      res.json({ message: 'Saving goal deleted successfully' });
    });
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