const express = require('express');
const router = express.Router();
const multer = require('multer');
const receiptController = require('../controllers/receiptController');

const upload = multer({ dest: 'uploads/' });

router.post('/scan', upload.single('image'), receiptController.scanReceipt);
router.post('/confirm', receiptController.confirmReceipt);

module.exports = router;
