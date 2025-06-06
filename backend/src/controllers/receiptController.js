const Transaction = require('../models/transactionModel');

exports.confirmReceipt = async (req, res) => {
  try {
    const { amount, date, category_id, category, note, type } = req.body;
    const user_id = req.userId; // Lấy từ middleware xác thực

    // Nếu chỉ có category name, cần lấy category_id
    let finalCategoryId = category_id;
    if (!finalCategoryId && category) {
      finalCategoryId = Transaction.getCategoryIdByName(category);
      if (!finalCategoryId) return res.status(400).json({ error: 'Invalid category' });
    }

    // Validate dữ liệu (có thể dùng lại hàm validateTransactionData từ transactionController)
    if (!amount || !date || !finalCategoryId || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = Transaction.createTransaction({
      user_id,
      amount,
      date,
      category_id: finalCategoryId,
      note,
      type
    });

    res.json({ message: 'Transaction saved', id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ message: 'Save failed', error: err.message });
  }
};

exports.scanReceipt = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    // TODO: Implement actual receipt scanning logic here
    // For now, return a mock response
    res.json({
      message: 'Receipt scanned successfully',
      data: {
        amount: 0,
        date: new Date().toISOString(),
        category: 'Uncategorized',
        items: []
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Scan failed', error: err.message });
  }
};