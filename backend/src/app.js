const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Configure CORS
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL (Vite default port)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Authorization']
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
const receiptRoutes = require('./routes/receiptRoutes');

// Import controllers for public routes
const transactionController = require('./controllers/transactionController');

// Public routes (no authentication required)
app.get('/api/public/transactions', transactionController.getPublicTransactions);
app.post('/api/public/transactions', transactionController.createPublicTransaction);

// Protected routes (require authentication)
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/savings', savingRoutes);
app.use('/api/loans_debts', loanRoutes);
app.use('/api/receipts', receiptRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));