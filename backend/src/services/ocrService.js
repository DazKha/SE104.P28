const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

// OCR service configuration
const OCR_SERVICE_URL = process.env.OCR_SERVICE_URL || 'http://localhost:8000/ocr';
const OCR_TIMEOUT = process.env.OCR_TIMEOUT || 30000; // 30 seconds

/**
 * Recognize text from image using OCR service
 * @param {string|Buffer} imageInput - File path or image buffer
 * @param {string} originalName - Original filename (for buffer input)
 * @param {string} mimeType - MIME type (for buffer input)
 * @returns {Promise<Object>} OCR result containing amount, date, category, items, etc.
 */
exports.recognize = async (imageInput, originalName = null, mimeType = null) => {
  try {
    const formData = new FormData();
    
    // Handle different input types
    if (Buffer.isBuffer(imageInput)) {
      // Input is a buffer (from multer memory storage)
      formData.append('image', imageInput, {
        filename: originalName || 'receipt.jpg',
        contentType: mimeType || 'image/jpeg'
      });
    } else if (typeof imageInput === 'string') {
      // Input is a file path
      if (!fs.existsSync(imageInput)) {
        throw new Error(`Image file not found: ${imageInput}`);
      }
      formData.append('image', fs.createReadStream(imageInput));
    } else {
      throw new Error('Invalid image input type. Expected Buffer or string path.');
    }

    console.log('Calling OCR service at:', OCR_SERVICE_URL);
    
    const response = await axios.post(OCR_SERVICE_URL, formData, {
      headers: {
        ...formData.getHeaders(),
        'Accept': 'application/json'
      },
      timeout: OCR_TIMEOUT,
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    console.log('OCR service response:', response.data);
    
    // Validate response structure
    if (!response.data) {
      throw new Error('Empty response from OCR service');
    }

    // Return standardized OCR result
    return {
      amount: response.data.amount || 0,
      date: response.data.date || new Date().toISOString().split('T')[0],
      category: response.data.category || 'Uncategorized',
      items: response.data.items || [],
      confidence: response.data.confidence || 0,
      rawData: response.data // Keep original response for debugging
    };

  } catch (error) {
    console.error('OCR service error:', error.message);
    
    // Handle specific error types
    if (error.code === 'ECONNREFUSED') {
      throw new Error('OCR service is not available. Please check if the service is running.');
    } else if (error.code === 'ENOTFOUND') {
      throw new Error('OCR service URL is not reachable. Please check the configuration.');
    } else if (error.response) {
      // OCR service returned an error response
      const statusCode = error.response.status;
      const errorMessage = error.response.data?.message || error.response.statusText;
      throw new Error(`OCR service error (${statusCode}): ${errorMessage}`);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('OCR service did not respond. Please try again.');
    } else {
      // Something else happened
      throw new Error(`OCR processing failed: ${error.message}`);
    }
  }
};

/**
 * Check if OCR service is available
 * @returns {Promise<boolean>} True if service is available
 */
exports.healthCheck = async () => {
  try {
    const response = await axios.get(`${OCR_SERVICE_URL}/health`, {
      timeout: 5000
    });
    return response.status === 200;
  } catch (error) {
    console.warn('OCR service health check failed:', error.message);
    return false;
  }
};

/**
 * Get OCR service configuration
 * @returns {Object} Configuration object
 */
exports.getConfig = () => {
  return {
    serviceUrl: OCR_SERVICE_URL,
    timeout: OCR_TIMEOUT,
    isConfigured: OCR_SERVICE_URL !== 'http://localhost:8000/ocr'
  };
};