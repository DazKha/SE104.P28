import React, { useState, useEffect, useRef } from 'react';
import TransactionItem from './TransactionItem.jsx';
import CurrencyInput from '../../common/CurrencyInput.jsx';
import { parseVietnameseAmount } from '../../../utils/parseVietnameseAmount.js';
import { outcomeCategories, incomeCategories } from '../../../constants/categories.js';
import { 
  PlusIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  CalendarIcon, 
  TrendingUpIcon, 
  TrendingDownIcon,
  InboxIcon,
  CameraIcon,
  ImageIcon
} from 'lucide-react';
import './TransactionSection.css';
import { getOCRUrl, OCR_CONFIG } from '../../../config/ocrConfig.js';

const TransactionSection = ({ transactions = [], onAddTransaction, onUpdateTransaction, onDeleteTransaction }) => {
  // Categories
  const expenseCategories = [...outcomeCategories, 'Uncategorized'];
  const incomeCategories_extended = [...incomeCategories, 'Uncategorized'];

  // Main state
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isEditingTransaction, setIsEditingTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [processingOCR, setProcessingOCR] = useState(false);
  const [error, setError] = useState(null);
  
  // Month/Year navigation state
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const categoryRef = useRef(null);
  const fileInputRef = useRef(null);
  
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

  // Months array
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Add state for OCR result
  const [ocrResult, setOcrResult] = useState(null);

  // Close category popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle input changes for new transaction
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log('=== HANDLE INPUT CHANGE ===');
    console.log('Input name:', name);
    console.log('Input value:', value);
    console.log('Current newTransaction before update:', newTransaction);
    
    const updatedTransaction = {
      ...newTransaction,
      [name]: name === 'amount' ? value : value
    };
    
    console.log('Updated newTransaction after update:', updatedTransaction);
    setNewTransaction(updatedTransaction);
  };

  // Handle transaction type change (income/expense)
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setNewTransaction(prev => ({
      ...prev,
      type: newType,
      category: newType === 'income' ? incomeCategories_extended[0] : expenseCategories[0]
    }));
  };

  // Handle category selection
  const handleCategorySelect = (selectedCategory) => {
    setNewTransaction({
      ...newTransaction,
      category: selectedCategory
    });
    setIsCategoryOpen(false);
  };

  // Compress image before setting
  const compressImage = (file, quality = 0.6, maxWidth = 800) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  // Handle image selection
  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setError(null); // Reset error when selecting new image
      console.log('Original file size:', file.size / 1024 / 1024, 'MB');
      
      // Compress image if it's larger than 1MB
      let processedFile = file;
      if (file.size > 1024 * 1024) {
        console.log('Compressing image...');
        processedFile = await compressImage(file);
        console.log('Compressed file size:', processedFile.size / 1024 / 1024, 'MB');
      }
      
      setSelectedImage(processedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(processedFile);
    }
  };

  // Handle add picture button click
  const handleAddPictureClick = () => {
    fileInputRef.current?.click();
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Note: OCR processing is now handled directly by the frontend
  // No backend upload needed for OCR functionality

  // Process OCR separately
  const processOCR = async (imageFile) => {
    try {
      setProcessingOCR(true);
      
      // Process OCR using the same method as OCR.jsx
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
      
      // Set OCR result to display
      setOcrResult(ocrResult);

      // If OCR data is available, fill the amount automatically
      if (ocrResult && ocrResult.response_message) {
        console.log('Full OCR Response:', JSON.stringify(ocrResult, null, 2));
        
        // Extract amount from response_message
        try {
          // Remove markdown code block and parse JSON
          const jsonStr = ocrResult.response_message
            .replace('```json\n', '')
            .replace('\n```', '');
          const parsedData = JSON.parse(jsonStr);
          console.log('Parsed OCR Data:', parsedData);
          
          // Handle both array and object format
          console.log('=== OCR AMOUNT PARSING ===');
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
          console.log('5. Type of amount:', typeof totalAmountStr);
          
          if (totalAmountStr !== null && totalAmountStr !== undefined) {
            // Parse Vietnamese format: remove dots (thousand separators)
            const cleanAmount = parseVietnameseAmount(totalAmountStr);
            console.log('6. Parsed amount:', cleanAmount);
            console.log('7. Setting newTransaction.amount to:', cleanAmount.toString());
            
            setNewTransaction(prev => ({
              ...prev,
              amount: cleanAmount.toString()
            }));
            console.log('8. Amount filled automatically:', cleanAmount);
          } else {
            console.log('6. No amount found in OCR data');
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

  // Handle adding/updating transaction
  const handleSubmitTransaction = async (e) => {
    e.preventDefault();
    
    console.log('Submit transaction called, selectedImage:', selectedImage ? `${selectedImage.name} (${selectedImage.size} bytes)` : 'No image selected');
    
    if (!newTransaction.category || !newTransaction.amount) {
      alert('Please fill in category and amount');
      return;
    }

    let receiptImage = null;

    try {
      if (selectedImage) {
        setUploadingImage(true);
        
        // Convert image to base64 for storage
        receiptImage = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve(e.target.result); // Return the base64 data URL
          };
          reader.onerror = () => {
            resolve(null);
          };
          reader.readAsDataURL(selectedImage);
        });
        
        console.log('Image converted to base64:', receiptImage ? 'Success' : 'Failed');
      }

      const transactionData = {
        amount: parseFloat(newTransaction.amount),
        date: newTransaction.date,
        category: newTransaction.category,
        note: newTransaction.description,
        type: newTransaction.type,
        receipt_image: receiptImage // Add base64 image data
      };
      
      console.log('=== TRANSACTION DATA CREATED ===');
      console.log('Raw transactionData object:', transactionData);
      console.log('transactionData.note value:', transactionData.note);
      console.log('transactionData.description value:', transactionData.description);

          console.log('=== TRANSACTION SECTION - PREPARING DATA ===');
    console.log('Current newTransaction state:', newTransaction);
    console.log('newTransaction.description:', newTransaction.description);
    console.log('transactionData.note:', transactionData.note);
    console.log('Full transactionData:', {
      ...transactionData,
      receipt_image: receiptImage ? 'Base64 data present' : 'No image data'
    });

      console.log('=== TRANSACTION SECTION - CALLING PARENT FUNCTION ===');
      console.log('About to call parent with transactionData:', transactionData);
      
      if (isEditingTransaction) {
        await onUpdateTransaction(editingTransaction.id, transactionData);
      } else {
        await onAddTransaction(transactionData);
      }

      // Reset form
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
      setIsAddingTransaction(false);
      setIsEditingTransaction(false);
      setEditingTransaction(null);
    } catch (error) {
      console.error('Error submitting transaction:', error);
      alert('Failed to submit transaction. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle delete transaction
  const handleDeleteTransaction = (id) => {
    if (onDeleteTransaction) {
      onDeleteTransaction(id);
    }
  };

  // Handle edit transaction
  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setNewTransaction({
      date: transaction.date,
      description: transaction.note || transaction.description || '',
      category: transaction.category_name || transaction.category || '',
      amount: transaction.amount.toString(),
      type: transaction.type === 'income' ? 'income' : 'outcome'
    });
    
    // Set existing image if available
    if (transaction.imagePath || transaction.receipt_path || transaction.receipt_image) {
      setImagePreview(transaction.receipt_image || `http://localhost:3000/${transaction.receipt_path}` || transaction.imagePath);
    }
    
    setIsAddingTransaction(false);
    setIsEditingTransaction(true);
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setIsEditingTransaction(false);
    setEditingTransaction(null);
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Navigate month
  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 11) {
        setSelectedMonth(0);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };

  // Generate year options (from 2020 to current year + 2)
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = 2020; year <= currentYear + 2; year++) {
      years.push(year);
    }
    return years;
  };

  // Handle month/year selection
  const handleMonthChange = (e) => {
    setSelectedMonth(parseInt(e.target.value));
  };

  const handleYearChange = (e) => {
    setSelectedYear(parseInt(e.target.value));
  };

  // Filter and process transactions
  const getProcessedTransactions = () => {
    // First filter by month/year
    let filtered = transactions.filter(transaction => {
      if (!transaction.date) return false;
      
      let transactionMonth, transactionYear;
      
      if (transaction.date.includes('/')) {
        const parts = transaction.date.split('/');
        transactionMonth = parseInt(parts[1]) - 1;
        transactionYear = parseInt(parts[2]);
      } else if (transaction.date.includes('-')) {
        const parts = transaction.date.split('-');
        transactionYear = parseInt(parts[0]);
        transactionMonth = parseInt(parts[1]) - 1;
      }
      
      return transactionMonth === selectedMonth && transactionYear === selectedYear;
    });
    
    // Then apply type filter
    if (activeFilter === 'Income') {
      filtered = filtered.filter(t => t.type === 'income');
    } else if (activeFilter === 'Expense') {
      filtered = filtered.filter(t => t.type === 'outcome');
    }
    
    // Then apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(transaction => 
        transaction.description?.toLowerCase().includes(searchLower) ||
        transaction.category?.toLowerCase().includes(searchLower) ||
        transaction.note?.toLowerCase().includes(searchLower) ||
        transaction.amount?.toString().includes(searchTerm)
      );
    }
    // Sort by date
    const sorted = filtered.sort((a, b) => {
      const getDateForSort = (dateStr) => {
        if (!dateStr) return '';
        
        if (dateStr.includes('/')) {
          const [day, month, year] = dateStr.split('/');
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        return dateStr;
      };
      
      const dateA = getDateForSort(a.date);
      const dateB = getDateForSort(b.date);
      return dateB.localeCompare(dateA);
    });

    return sorted;
  };
  //   // Sort by date
  //   const sorted = filtered.sort((a, b) => {
  //     const getDateForSort = (dateStr) => {
  //       if (!dateStr) return '';
        
  //       if (dateStr.includes('/')) {
  //         const [day, month, year] = dateStr.split('/');
  //         return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  //       }
  //       return dateStr;
  //     };
      
  //     const dateA = getDateForSort(a.date);
  //     const dateB = getDateForSort(b.date);
  //     return dateB.localeCompare(dateA);
  //   });

  //   return sorted;
  // };

  // Calculate monthly stats (for all transactions in the month, ignoring filters)
  const getMonthlyStats = () => {
    const monthTransactions = transactions.filter(transaction => {
      if (!transaction.date) return false;
      
      let transactionMonth, transactionYear;
      
      if (transaction.date.includes('/')) {
        const parts = transaction.date.split('/');
        transactionMonth = parseInt(parts[1]) - 1;
        transactionYear = parseInt(parts[2]);
      } else if (transaction.date.includes('-')) {
        const parts = transaction.date.split('-');
        transactionYear = parseInt(parts[0]);
        transactionMonth = parseInt(parts[1]) - 1;
      }
      
      return transactionMonth === selectedMonth && transactionYear === selectedYear;
    });

    const stats = monthTransactions.reduce((acc, transaction) => {
      const amount = Math.abs(transaction.amount);
      if (transaction.type === 'income') {
        acc.totalIncome += amount;
      } else {
        acc.totalExpense += amount;
      }
      acc.transactionCount++;
      return acc;
    }, { totalIncome: 0, totalExpense: 0, transactionCount: 0 });

    stats.netAmount = stats.totalIncome - stats.totalExpense;
    return stats;
  };

  // Format amount
  const formatAmount = (amount) => {
    if (amount === 0) return '0';
    return Math.abs(amount).toLocaleString('vi-VN');
  };

  const displayedTransactions = getProcessedTransactions();
  const monthlyStats = getMonthlyStats();

  return (
    <div className="transaction-section">
      {/* Main Header */}
      <div className="section-header">
        <div className="section-title-container">
          <h2 className="section-title">Transactions</h2>
          <p className="section-subtitle">Manage your income and expenses</p>
        </div>
        <button 
          onClick={() => {
            console.log('=== ADD TRANSACTION BUTTON CLICKED ===');
            console.log('Current isAddingTransaction:', isAddingTransaction);
            console.log('Current newTransaction state:', newTransaction);
            setIsAddingTransaction(!isAddingTransaction);
          }}
          className={`add-transaction-btn ${isAddingTransaction ? 'active' : ''}`}
        >
          <PlusIcon size={20} />
          {isAddingTransaction ? 'Cancel' : 'Add Transaction'}
        </button>
      </div>

      {/* Add/Edit Transaction Form */}
      {(isAddingTransaction || isEditingTransaction) && (
        <div className="transaction-form">
          <div className="form-header">
            <h3>{isEditingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</h3>
            {!isEditingTransaction && (
              <button 
                type="button" 
                onClick={() => setIsAddingTransaction(false)}
                className="close-form-btn"
              >
                ×
              </button>
            )}
          </div>
          <form onSubmit={handleSubmitTransaction}>
            <div className="form-grid">
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  name="date"
                  value={(() => {
                    // Chuyển DD/MM/YYYY -> YYYY-MM-DD để hiển thị đúng trên input type=date
                    const d = newTransaction.date;
                    if (d && d.includes('/')) {
                      const [day, month, year] = d.split('/');
                      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                    }
                    return d || '';
                  })()}
                  onChange={e => {
                    // Chuyển YYYY-MM-DD -> DD/MM/YYYY để lưu vào state
                    const v = e.target.value;
                    if (v && v.includes('-')) {
                      const [year, month, day] = v.split('-');
                      handleInputChange({
                        target: {
                          name: 'date',
                          value: `${day}/${month}/${year}`
                        }
                      });
                    } else {
                      handleInputChange(e);
                    }
                  }}

                  
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <input
                  type="text"
                  name="description"
                  value={newTransaction.description}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter transaction description"
                  required
                />
              </div>
              <div className="form-group" ref={categoryRef}>
                <label>Category *</label>
                <div className="category-select">
                  <button
                    type="button"
                    className="category-select-button"
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  >
                    {newTransaction.category || 'Select category'}
                    <span className="category-arrow">▼</span>
                  </button>
                  {isCategoryOpen && (
                    <div className="category-popup">
                      {(newTransaction.type === 'income' ? incomeCategories_extended : expenseCategories).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          className={`category-option ${newTransaction.category === cat ? 'selected' : ''}`}
                          onClick={() => handleCategorySelect(cat)}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Amount (VND) *</label>
                <CurrencyInput
                  placeholder="Enter amount"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Type *</label>
                <div className="transaction-type-buttons">
                  <button
                    type="button"
                    className={`type-btn ${newTransaction.type === 'income' ? 'active' : ''}`}
                    onClick={() => handleTypeChange({ target: { value: 'income' } })}
                  >
                    Income
                  </button>
                  <button
                    type="button"
                    className={`type-btn ${newTransaction.type === 'outcome' ? 'active' : ''}`}
                    onClick={() => handleTypeChange({ target: { value: 'outcome' } })}
                  >
                    Expense
                  </button>
                </div>
              </div>
            </div>

            {/* Image Upload Section */}
            {imagePreview && (
              <div className="image-preview-section">
                <label>Receipt Image</label>
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Receipt preview" className="image-preview" />
                  <button 
                    type="button" 
                    onClick={handleRemoveImage}
                    className="remove-image-btn"
                    title="Remove image"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSelect}
              accept="image/*"
              style={{ display: 'none' }}
            />

            <div className="form-actions">
              <div className="secondary-actions">
                <button 
                  type="button" 
                  onClick={handleAddPictureClick} 
                  className="secondary-btn"
                >
                  <CameraIcon size={16} />
                  Add Image
                </button>
                {selectedImage && (
                  <button 
                    type="button" 
                    onClick={() => processOCR(selectedImage)} 
                    className="secondary-btn"
                    disabled={processingOCR}
                  >
                    <ImageIcon size={16} />
                    {processingOCR ? 'Processing...' : 'OCR'}
                  </button>
                )}
              </div>
              <div className="primary-actions">
                <button 
                  type="button" 
                  onClick={isEditingTransaction ? handleCancelEdit : () => setIsAddingTransaction(false)} 
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="save-btn" 
                  disabled={uploadingImage || !newTransaction.amount || !newTransaction.description}
                >
                  {uploadingImage ? 'Uploading...' : (isEditingTransaction ? 'Update Transaction' : 'Save Transaction')}
                </button>
              </div>
            </div>

            {/* Error display */}
            {error && (
              <div className="error-message">
                <h4>Error:</h4>
                <p>{error}</p>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Unified Filter and Navigation Section */}
      <div className="unified-controls">
        {/* Filter Tabs */}
        <div className="main-filter-tabs">
          <button 
            className={`filter-tab ${activeFilter === 'All' ? 'active' : ''}`}
            onClick={() => setActiveFilter('All')}
          >
            All
          </button>
          <button 
            className={`filter-tab ${activeFilter === 'Income' ? 'active' : ''}`}
            onClick={() => setActiveFilter('Income')}
          >
            Income
          </button>
          <button 
            className={`filter-tab ${activeFilter === 'Expense' ? 'active' : ''}`}
            onClick={() => setActiveFilter('Expense')}
          >
            Expense
          </button>
        </div>

        {/* Search Bar */}
        <div className="main-search-container">
          <div className="search-icon" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="main-search-input"
          />
        </div>

        {/* Month Navigation */}
        <div className="month-navigation">
          <button onClick={() => navigateMonth('prev')} className="nav-button">
            <ChevronLeftIcon size={20} />
          </button>
          
          <div className="month-year-display">
            <CalendarIcon size={20} />
            <select 
              value={selectedMonth} 
              onChange={handleMonthChange}
              className="month-year-selector"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>
                  {month}
                </option>
              ))}
            </select>
            
            <select 
              value={selectedYear} 
              onChange={handleYearChange}
              className="month-year-selector"
            >
              {getYearOptions().map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          
          <button onClick={() => navigateMonth('next')} className="nav-button">
            <ChevronRightIcon size={20} />
          </button>
        </div>
      </div>

      {/* Monthly Stats */}
      <div className="monthly-stats">
        <div className="stat-card income">
          <div className="stat-icon">
            <TrendingUpIcon size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Total Income</div>
            <div className="stat-value">
              {formatAmount(monthlyStats.totalIncome)} VND
            </div>
          </div>
        </div>

        <div className="stat-card expense">
          <div className="stat-icon">
            <TrendingDownIcon size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Total Expense</div>
            <div className="stat-value">
              {formatAmount(monthlyStats.totalExpense)} VND
            </div>
          </div>
        </div>

        <div className={`stat-card net ${monthlyStats.netAmount >= 0 ? 'positive' : 'negative'}`}>
          <div className="stat-icon">
            {monthlyStats.netAmount >= 0 ? (
              <TrendingUpIcon size={24} />
            ) : (
              <TrendingDownIcon size={24} />
            )}
          </div>
          <div className="stat-info">
            <div className="stat-label">Net Amount</div>
            <div className="stat-value">
              {monthlyStats.netAmount >= 0 ? '+' : '-'}
              {formatAmount(monthlyStats.netAmount)} VND
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="transactions-section">
        <div className="section-header">
          <h3>
            {activeFilter === 'All' 
              ? 'All Transactions' 
              : activeFilter === 'Income' 
                ? 'Income Transactions' 
                : 'Expense Transactions'
            }
            {displayedTransactions.length > 0 && (
              <span style={{ 
                color: '#6b7280', 
                fontWeight: 'normal', 
                fontSize: '1rem',
                marginLeft: '0.5rem'
              }}>
                ({displayedTransactions.length})
              </span>
            )}
          </h3>
        </div>

        {displayedTransactions.length > 0 ? (
          <div className="transactions-list-container">
            <div className="transactions-list">
              {displayedTransactions.map((transaction, index) => (
                <TransactionItem 
                  key={transaction.id || index} 
                  transaction={transaction} 
                  onDelete={handleDeleteTransaction}
                  onEdit={handleEditTransaction}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <InboxIcon size={64} />
            </div>
            <div className="empty-title">
              {activeFilter === 'All' 
                ? searchTerm 
                  ? 'No transactions found'
                  : 'No transactions this month'
                : `No ${activeFilter.toLowerCase()} transactions this month`
              }
            </div>
            <div className="empty-subtitle">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : `Add some ${activeFilter === 'All' ? '' : activeFilter.toLowerCase() + ' '}transactions to get started`
              }
            </div>
          </div>
        )}
      </div>


    </div>
  );
};

export default TransactionSection;