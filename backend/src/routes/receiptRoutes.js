const express = require('express');
const router = express.Router();
const receiptController = require('../controllers/receiptController');

router.post('/scan', receiptController.scanReceipt);
router.post('/confirm', receiptController.confirmReceipt);
router.get('/ocr-health', receiptController.checkOcrHealth);

module.exports = router;
