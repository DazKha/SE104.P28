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

    // Xử lý memory buffer trực tiếp (không cần file system)
    const imageBuffer = req.file.buffer;
    const originalName = req.file.originalname;
    const fileSize = req.file.size;
    const mimeType = req.file.mimetype;

    console.log('Receipt uploaded:', { originalName, fileSize, mimeType });

    // Convert buffer thành base64
    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    // TODO: Implement actual receipt scanning logic here
    // For now, return base64 data + mock OCR data
    res.json({
      message: 'Receipt processed successfully',
      data: {
        receiptImage: dataUrl,        // ← Base64 data URL
        originalName: originalName,
        fileSize: fileSize,
        // Mock OCR data
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        category: 'Food & Drinks',
        items: [],
        confidence: 0.8
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Processing failed', error: err.message });
  }
};