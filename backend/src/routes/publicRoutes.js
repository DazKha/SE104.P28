const express = require('express');
const router = express.Router();

// Mock data for public access (for testing purposes)
const mockTransactions = [
  {
    id: 1,
    amount: 50000,
    date: '2024-12-01',
    category_name: 'Food & Drinks',
    note: 'Breakfast at cafe',
    type: 'outcome'
  },
  {
    id: 2,
    amount: 2000000,
    date: '2024-12-01',
    category_name: 'Salary',
    note: 'Monthly salary',
    type: 'income'
  },
  {
    id: 3,
    amount: 30000,
    date: '2024-11-30',
    category_name: 'Transportation',
    note: 'Bus ticket',
    type: 'outcome'
  }
];

// Get all transactions (public)
router.get('/transactions', (req, res) => {
  try {
    console.log('Public API: Getting all transactions');
    res.json(mockTransactions);
  } catch (error) {
    console.error('Error in public transactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add transaction (public)
router.post('/transactions', (req, res) => {
  try {
    console.log('Public API: Adding transaction:', req.body);
    const newTransaction = {
      id: Date.now(),
      ...req.body,
      date: req.body.date || new Date().toISOString().split('T')[0]
    };
    
    mockTransactions.unshift(newTransaction);
    console.log('Transaction added to mock data');
    res.status(201).json(newTransaction);
  } catch (error) {
    console.error('Error adding transaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update transaction (public)
router.put('/transactions/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    console.log('Public API: Updating transaction:', id, req.body);
    
    const index = mockTransactions.findIndex(t => t.id === id);
    if (index === -1) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    mockTransactions[index] = { ...mockTransactions[index], ...req.body };
    console.log('Transaction updated in mock data');
    res.json(mockTransactions[index]);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete transaction (public)
router.delete('/transactions/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    console.log('Public API: Deleting transaction:', id);
    
    const index = mockTransactions.findIndex(t => t.id === id);
    if (index === -1) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    mockTransactions.splice(index, 1);
    console.log('Transaction deleted from mock data');
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 