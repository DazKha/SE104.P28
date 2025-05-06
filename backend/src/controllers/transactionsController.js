const Transaction = require('../models/transactionsModel');
const db = require('../database/db');

// Hàm lấy ID của category "Không xác định"
const getDefaultCategoryId = (callback) => {
  db.get(`SELECT id FROM categories WHERE name = 'Không xác định'`, (err, row) => {
    if (err) return callback(err);
    callback(null, row?.id || null);
  });
};

// Hàm tạo transaction
exports.create = (req, res) => {
    const data = req.body;
    const validTypes = ['income', 'outcome'];
  
    if (!validTypes.includes(data.type)) {
      return res.status(400).json({ error: "Type must be either 'income' or 'outcome'" });
    }
  
    if (!data.category_id) {
      getDefaultCategoryId((err, defaultId) => {
        if (err) return res.status(500).json({ error: err.message });
        data.category_id = defaultId;
        Transaction.createTransaction(data, (err) => {
          if (err) return res.status(400).json({ error: err.message });
          res.status(201).json({ message: 'Transaction created' });
        });
      });
    } else {
      Transaction.createTransaction(data, (err) => {
        if (err) return res.status(400).json({ error: err.message });
        res.status(201).json({ message: 'Transaction created' });
      });
    }
};

// Hàm lấy tất cả transactions của user
exports.getByUser = (req, res) => {
  Transaction.getTransactionsByUser(req.params.userId, (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json(rows);
  });
};


// Hàm lấy transaction theo ID
exports.getById = (req, res) => {
  Transaction.getTransactionById(req.params.id, (err, row) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json(row);
  });
};

// Hàm cập nhật transaction
exports.update = (req, res) => {
  Transaction.updateTransaction(req.params.id, req.body, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: 'Transaction updated' });
  });
};

// Hàm xóa transaction
exports.delete = (req, res) => {
  Transaction.deleteTransaction(req.params.id, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: 'Transaction deleted' });
  });
};