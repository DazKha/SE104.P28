const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
require('dotenv').config();

app.use(cors());
app.use(express.json());

console.log('hello world')
// Define the root route
app.get('/', (req, res) => {
    res.send('Welcome to the Expense Tracker API!');
});

// Import routes
const authRoutes = require('./routes/authRoutes');

// Mount routes
app.use('/api/auth', authRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));