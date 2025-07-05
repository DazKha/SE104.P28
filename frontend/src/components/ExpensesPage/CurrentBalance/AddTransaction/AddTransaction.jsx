import React, { useState } from 'react';
import { expenseCategories, incomeCategories } from '../../../../constants/categories';
import { parseVietnameseAmount } from '../../../../utils/parseVietnameseAmount.js';
import { getOCRUrl } from '../../../../config/ocrConfig.js';
import './AddTransaction.css';

const AddTransaction = ({ isOpen, onClose, onAddTransaction }) => {
  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '/'),
    description: '',
    category: expenseCategories[0],
    amount: '',
    type: 'outcome'
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [processingOCR, setProcessingOCR] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [error, setError] = useState('');

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction(prev => ({ ...prev, [name]: value }));
  };

  // Handle type change
  const handleTypeChange = (e) => {
    const type = e.target.value;
    setNewTransaction(prev => ({
      ...prev,
      type,
      category: type === 'outcome' ? expenseCategories[0] : incomeCategories[0]
    }));
  };

  // Compress image
  const compressImage = (file, quality = 0.6, maxWidth = 800) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Handle image selection
  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        // Compress the image
        const compressedFile = await compressImage(file);
        setSelectedImage(compressedFile);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(compressedFile);
        
        // Automatically process OCR
        await processOCR(compressedFile);
      } catch (error) {
        console.error('Error processing image:', error);
        setError('Failed to process image. Please try again.');
      }
    }
  };

  // Note: OCR processing is now handled directly by the frontend
  // No backend upload needed for OCR functionality

  // Process OCR
  const processOCR = async (imageFile) => {
    try {
      setProcessingOCR(true);
      setError('');
      
      const ocrFormData = new FormData();
      ocrFormData.append('file', imageFile);

      const ocrResponse = await fetch(getOCRUrl(), {
        method: 'POST',
        body: ocrFormData,
        headers: {
          'Accept': 'application/json',
        }
      });

      if (!ocrResponse.ok) {
        const errorData = await ocrResponse.json().catch(() => null);
        throw new Error(errorData?.error || `HTTP error! status: ${ocrResponse.status}`);
      }

      const ocrResult = await ocrResponse.json();
      console.log('OCR result:', ocrResult);
      
      if (ocrResult.error) {
        throw new Error(ocrResult.error);
      }
      
      setOcrResult(ocrResult);

      // Auto-fill amount from OCR
      if (ocrResult && ocrResult.response_message) {
        try {
          const jsonStr = ocrResult.response_message
            .replace('```json\n', '')
            .replace('\n```', '');
          const parsedData = JSON.parse(jsonStr);
          
          console.log('=== OCR AMOUNT PARSING (AddTransaction) ===');
          console.log('1. Parsed data type:', Array.isArray(parsedData) ? 'Array' : 'Object');
          console.log('2. Parsed data structure:', parsedData);
          
          let totalAmountStr = null;
          
          if (Array.isArray(parsedData)) {
            // Handle array format: search through all objects
            for (const item of parsedData) {
              if (item["Tổng số tiền"] !== undefined) {
                totalAmountStr = item["Tổng số tiền"];
                console.log('3. Found "Tổng số tiền" in array item:', totalAmountStr);
                break;
              }
              // Alternative: look for "Tiền khách trả" if "Tổng số tiền" not found
              if (item["Tiền khách trả"] !== undefined && !totalAmountStr) {
                totalAmountStr = item["Tiền khách trả"];
                console.log('3. Found "Tiền khách trả" as fallback:', totalAmountStr);
              }
            }
          } else {
            // Handle object format
            totalAmountStr = parsedData["Tổng số tiền"] || parsedData["Tiền khách trả"];
            console.log('3. Found amount in object:', totalAmountStr);
          }
          
          console.log('4. Final amount string:', totalAmountStr);
          
          if (totalAmountStr !== null && totalAmountStr !== undefined) {
            // Parse Vietnamese format: remove dots (thousand separators)
            const cleanAmount = parseVietnameseAmount(totalAmountStr);
            console.log('5. Parsed amount:', cleanAmount);
            
            setNewTransaction(prev => ({
              ...prev,
              amount: cleanAmount.toString()
            }));
            console.log('6. Amount filled automatically:', cleanAmount);
          } else {
            console.log('5. No amount found in OCR data');
          }
        } catch (e) {
          console.error('Failed to parse OCR data:', e);
        }
      }

      return ocrResult;
    } catch (error) {
      console.error('Error processing OCR:', error);
      setError(`OCR processing failed: ${error.message}`);
      throw error;
    } finally {
      setProcessingOCR(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newTransaction.category || !newTransaction.amount) {
      setError('Please fill in category and amount');
      return;
    }

    let receiptImage = null;

    try {
      if (selectedImage) {
        setUploadingImage(true);
        
        // Convert image to base64 for storage
        receiptImage = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(selectedImage);
        });
      }

      const transactionData = {
        amount: parseFloat(newTransaction.amount),
        date: newTransaction.date,
        category: newTransaction.category,
        note: newTransaction.description,
        type: newTransaction.type,
        receipt_image: receiptImage,
        ocrData: ocrResult
      };

      await onAddTransaction(transactionData);
      
      // Reset form and close modal
      setNewTransaction({
        date: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }).replace(/\//g, '/'),
        description: '',
        category: expenseCategories[0],
        amount: '',
        type: 'outcome'
      });
      setSelectedImage(null);
      setImagePreview(null);
      setOcrResult(null);
      setError('');
      onClose();
    } catch (error) {
      console.error('Error submitting transaction:', error);
      setError('Failed to submit transaction. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle close modal
  const handleClose = () => {
    setNewTransaction({
      date: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).replace(/\//g, '/'),
      description: '',
      category: expenseCategories[0],
      amount: '',
      type: 'outcome'
    });
    setSelectedImage(null);
    setImagePreview(null);
    setOcrResult(null);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  const currentCategories = newTransaction.type === 'outcome' ? expenseCategories : incomeCategories;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Transaction</h2>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="transaction-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Type:</label>
            <select
              name="type"
              value={newTransaction.type}
              onChange={handleTypeChange}
              className="form-select"
            >
              <option value="outcome">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div className="form-group">
            <label>Date:</label>
            <input
              type="text"
              name="date"
              value={newTransaction.date}
              onChange={handleInputChange}
              placeholder="DD/MM/YYYY"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Category:</label>
            <select
              name="category"
              value={newTransaction.category}
              onChange={handleInputChange}
              className="form-select"
            >
              {currentCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Amount:</label>
            <input
              type="number"
              name="amount"
              value={newTransaction.amount}
              onChange={handleInputChange}
              placeholder="Enter amount"
              className="form-input"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label>Description:</label>
            <input
              type="text"
              name="description"
              value={newTransaction.description}
              onChange={handleInputChange}
              placeholder="Optional description"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Receipt Image:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="form-input"
            />
            {processingOCR && (
              <div className="processing-indicator">
                Processing OCR... Please wait...
              </div>
            )}
          </div>

          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Receipt preview" />
            </div>
          )}

          {ocrResult && (
            <div className="ocr-result">
              <h4>OCR Processing Result:</h4>
              <pre>{JSON.stringify(ocrResult, null, 2)}</pre>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={handleClose}
              className="cancel-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadingImage || processingOCR}
              className="submit-button"
            >
              {uploadingImage ? 'Uploading...' : processingOCR ? 'Processing...' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransaction; 