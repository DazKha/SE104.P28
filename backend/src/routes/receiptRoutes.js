const express = require('express');
const router = express.Router();
const multer = require('multer');
const receiptController = require('../controllers/receiptController');

// Use memory storage since we convert to base64 and don't need files
const upload = multer({ storage: multer.memoryStorage() });

router.post('/scan', upload.single('image'), receiptController.scanReceipt);
router.post('/confirm', receiptController.confirmReceipt);

module.exports = router;
