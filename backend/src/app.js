const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
require('dotenv').config();

// Configure CORS
const app = express();
app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL (Vite default port)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Authorization']
}));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  console.log('Headers:', req.headers);
  next();
});

// Increase payload size limits for image uploads (base64 storage)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(fileUpload());

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
app.put('/api/public/transactions/:id', transactionController.updatePublicTransaction);
app.delete('/api/public/transactions/:id', transactionController.deletePublicTransaction);

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