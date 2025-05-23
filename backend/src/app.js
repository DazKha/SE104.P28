const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Configure CORS
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

console.log('hello world')
// Define the root route
app.get('/', (req, res) => {
    res.send('Welcome to the Expense Tracker API!');
});

// Import routes
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const savingRoutes = require('./routes/savingRoutes');
const loanRoutes = require('./routes/loanRoutes');


// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/savings', savingRoutes);
app.use('/api/loans_debts', loanRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));