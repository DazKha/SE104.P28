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
    if (!req.files || !req.files.image) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    // Xử lý với express-fileupload format
    const imageFile = req.files.image;
    const imageBuffer = imageFile.data;
    const originalName = imageFile.name;
    const fileSize = imageFile.size;
    const mimeType = imageFile.mimetype;

    console.log('Receipt uploaded:', { originalName, fileSize, mimeType });

    // Validate image file
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(mimeType)) {
      return res.status(400).json({ 
        error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.' 
      });
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (fileSize > maxSize) {
      return res.status(400).json({ 
        error: 'File too large. Maximum size is 10MB.' 
      });
    }

    // Convert buffer thành base64
    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    // Prepare response data (without OCR processing)
    const responseData = {
      receiptImage: dataUrl,        // Base64 data URL for storage
      originalName: originalName,
      fileSize: fileSize,
      mimeType: mimeType,
      processedAt: new Date().toISOString(),
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      category: 'Uncategorized',
      items: [],
      confidence: 0,
      ocrSuccess: false,
      ocrError: 'OCR service not available'
    };

    // Success response
    res.json({
      message: 'Receipt uploaded successfully (OCR not available)',
      data: responseData,
      warnings: ['OCR processing is not available in this version']
    });

  } catch (err) {
    console.error('Receipt processing error:', err);
    res.status(500).json({ 
      message: 'Processing failed', 
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Health check endpoint (simplified without OCR)
exports.checkOcrHealth = async (req, res) => {
  try {
    res.json({
      message: 'Receipt service status',
      status: 'healthy',
      config: {
        serviceUrl: 'N/A',
        timeout: 'N/A',
        isConfigured: false
      },
      timestamp: new Date().toISOString(),
      note: 'OCR service is not available in this version'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to check service health',
      error: error.message,
      status: 'error'
    });
  }
};