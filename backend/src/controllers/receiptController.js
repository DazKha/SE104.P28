const Transaction = require('../models/transactionModel');
const ocrService = require('../services/ocrService');

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

    let ocrData = null;
    let ocrError = null;

    // Try to process with OCR service (optional - fallback if fails)
    try {
      console.log('Starting OCR processing...');
      ocrData = await ocrService.recognize(imageBuffer, originalName, mimeType);
      console.log('OCR processing completed successfully:', ocrData);
    } catch (error) {
      console.error('OCR processing failed:', error.message);
      ocrError = error.message;
      
      // Continue with fallback (base64 storage without OCR data)
      console.log('Continuing without OCR data due to error - this is expected if OCR service is not running');
    }

    // Prepare response data
    const responseData = {
      receiptImage: dataUrl,        // Base64 data URL for storage
      originalName: originalName,
      fileSize: fileSize,
      mimeType: mimeType,
      processedAt: new Date().toISOString()
    };

    // Add OCR data if available
    if (ocrData) {
      responseData.amount = ocrData.amount || 0;
      responseData.date = ocrData.date || new Date().toISOString().split('T')[0];
      responseData.category = ocrData.category || 'Uncategorized';
      responseData.items = ocrData.items || [];
      responseData.confidence = ocrData.confidence || 0;
      responseData.ocrSuccess = true;
      responseData.ocrRawData = ocrData.rawData; // For debugging
    } else {
      // Fallback data when OCR fails
      responseData.amount = 0;
      responseData.date = new Date().toISOString().split('T')[0];
      responseData.category = 'Uncategorized';
      responseData.items = [];
      responseData.confidence = 0;
      responseData.ocrSuccess = false;
      responseData.ocrError = ocrError;
    }

    // Success response
    res.json({
      message: ocrData ? 'Receipt processed successfully with OCR' : 'Receipt uploaded successfully (OCR failed)',
      data: responseData,
      warnings: ocrError ? [`OCR processing failed: ${ocrError}`] : []
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

// Health check endpoint for OCR service
exports.checkOcrHealth = async (req, res) => {
  try {
    const config = ocrService.getConfig();
    const isHealthy = await ocrService.healthCheck();
    
    res.json({
      message: 'OCR service status',
      status: isHealthy ? 'healthy' : 'unhealthy',
      config: {
        serviceUrl: config.serviceUrl,
        timeout: config.timeout,
        isConfigured: config.isConfigured
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to check OCR service health',
      error: error.message,
      status: 'error'
    });
  }
};