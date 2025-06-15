const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receiptController');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// OCR server URL - Update this when the ngrok URL changes
const OCR_SERVER_URL = 'https://616a-35-233-197-150.ngrok-free.app/ocr';

router.post('/scan', receiptController.scanReceipt);
router.post('/confirm', receiptController.confirmReceipt);
router.get('/ocr-health', receiptController.checkOcrHealth);

// Test OCR server connectivity
router.get('/test-ocr', async (req, res) => {
    try {
        console.log('Testing OCR server connectivity...');
        console.log('OCR server URL:', OCR_SERVER_URL);
        
        // Try to ping the OCR server
        const response = await axios.get(OCR_SERVER_URL.replace('/ocr', '/'), {
            timeout: 10000
        });
        
        console.log('OCR server response:', response.status, response.data);
        res.json({
            status: 'success',
            message: 'OCR server is reachable',
            serverResponse: response.data,
            serverStatus: response.status
        });
    } catch (error) {
        console.error('OCR server test failed:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'OCR server is not reachable',
            error: error.message,
            details: error.response?.data
        });
    }
});

// OCR endpoint
router.post('/ocr', async (req, res) => {
    console.log('=== OCR REQUEST START ===');
    
    try {
        console.log('1. Received OCR request');
        console.log('2. Request files:', req.files);
        console.log('3. Request body:', req.body);

        if (!req.files || !req.files.image) {
            console.log('4. ERROR: No image file found in request');
            return res.status(400).json({ error: 'No image uploaded' });
        }

        const imageFile = req.files.image;
        console.log('4. Image file details:', {
            name: imageFile.name,
            size: imageFile.size,
            mimetype: imageFile.mimetype
        });

        console.log('5. Creating FormData...');
        // Create form data
        const formData = new FormData();
        formData.append('image', imageFile.data, {
            filename: imageFile.name,
            contentType: imageFile.mimetype
        });
        console.log('6. FormData created successfully');

        console.log('7. Sending request to OCR server...');
        console.log('8. OCR server URL:', OCR_SERVER_URL);
        
        // Try to call OCR API with fallback
        let ocrResponse;
        try {
            const response = await axios.post(OCR_SERVER_URL, formData, {
                headers: {
                    ...formData.getHeaders(),
                    'Accept': 'application/json'
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
                timeout: 10000 // 10 seconds timeout
            });
            
            console.log('9. OCR server responded successfully');
            console.log('10. OCR Response:', response.data);
            ocrResponse = response.data;
        } catch (ocrError) {
            console.log('9. OCR server failed, using fallback');
            console.log('10. OCR Error:', ocrError.message);
            
            // Fallback response when OCR fails
            ocrResponse = {
                success: false,
                message: 'Image uploaded successfully (OCR unavailable)',
                data: {
                    receiptImage: `data:${imageFile.mimetype};base64,${imageFile.data.toString('base64')}`,
                    originalName: imageFile.name,
                    fileSize: imageFile.size,
                    amount: 0,
                    date: new Date().toISOString().split('T')[0],
                    category: 'Uncategorized',
                    ocrError: 'OCR service unavailable'
                }
            };
        }
        
        console.log('=== OCR REQUEST SUCCESS ===');
        res.json(ocrResponse);
        
    } catch (error) {
        console.error('=== OCR REQUEST ERROR ===');
        console.error('Error step: During OCR processing');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        if (error.response) {
            console.error('OCR server response error:', {
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers
            });
        }

        // Send more detailed error response
        res.status(500).json({ 
            error: 'Failed to process OCR request',
            details: error.response?.data || error.message,
            status: error.response?.status,
            step: 'OCR processing'
        });
        console.log('=== OCR REQUEST ERROR END ===');
    }
});

module.exports = router;
