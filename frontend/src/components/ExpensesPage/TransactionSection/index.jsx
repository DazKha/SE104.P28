import React, { useState, useEffect, useRef } from 'react';
import TransactionItem from './TransactionItem.jsx';
import CurrencyInput from '../../common/CurrencyInput.jsx';
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
    setNewTransaction({
      ...newTransaction,
      [name]: name === 'amount' ? value : value
    });
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

  // Upload image to backend only
  const uploadImage = async (imageFile) => {
    try {
      // Upload to backend
      const backendFormData = new FormData();
      backendFormData.append('image', imageFile);

      const backendResponse = await fetch('http://localhost:3000/api/receipts/ocr', {
        method: 'POST',
        body: backendFormData,
      });

      if (!backendResponse.ok) {
        throw new Error('Failed to upload image to backend');
      }

      const backendResult = await backendResponse.json();
      console.log('Backend upload result:', backendResult);

      return backendResult;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // Process OCR separately
  const processOCR = async (imageFile) => {
    try {
      setProcessingOCR(true);
      
      // Process OCR using the same method as OCR.jsx
      const ocrFormData = new FormData();
      ocrFormData.append('file', imageFile);

      const ocrResponse = await fetch('https://616a-35-233-197-150.ngrok-free.app/ocr', {
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
          
          // Get total amount
          const totalAmount = parsedData["Tổng số tiền"];
          console.log('Total Amount:', totalAmount);
          
          if (totalAmount) {
            setNewTransaction(prev => ({
              ...prev,
              amount: totalAmount.toString()
            }));
            console.log('Amount filled automatically:', totalAmount);
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
    
    if (!newTransaction.category || !newTransaction.amount) {
      alert('Please fill in category and amount');
      return;
    }

    let imagePath = null;
    let ocrData = null;

    try {
      if (selectedImage) {
        setUploadingImage(true);
        const uploadResult = await uploadImage(selectedImage);
        imagePath = uploadResult.data?.filePath;
        // OCR processing is now manual via OCR button
      }

      const transactionData = {
        ...newTransaction,
        imagePath,
        ocrData
      };

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
        <h2 className="section-title">Transaction</h2>
        <button 
          onClick={() => setIsAddingTransaction(!isAddingTransaction)}
          className="add-btn"
        >
          <PlusIcon size={20} />
          Add Transaction
        </button>
      </div>

      {/* Add/Edit Transaction Form */}
      {(isAddingTransaction || isEditingTransaction) && (
        <div className="transaction-form">
          <div className="form-header">
            <h3>{isEditingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</h3>
          </div>
          <form onSubmit={handleSubmitTransaction}>
            <div className="form-grid">
              <div className="form-group">
                <label>Date</label>
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
                  className="search-input"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  name="description"
                  value={newTransaction.description}
                  onChange={handleInputChange}
                  className="search-input"
                  placeholder="Transaction description"
                />
              </div>
              <div className="form-group" ref={categoryRef}>
                <label>Category</label>
                <div className="category-select">
                  <button
                    type="button"
                    className="category-select-button"
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  >
                    {newTransaction.category || 'Select category'}
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
                <label>Amount (VND)</label>
                <CurrencyInput
                  placeholder="Amount"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                  className="search-input"
                />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select
                  name="type"
                  value={newTransaction.type}
                  onChange={handleTypeChange}
                  className="search-input"
                >
                  <option value="outcome">Expense</option>
                  <option value="income">Income</option>
                </select>
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
              <button 
                type="button" 
                onClick={handleAddPictureClick} 
                className="picture-btn"
              >
                <CameraIcon size={16} />
                Add Image
              </button>
              {selectedImage && (
                <button 
                  type="button" 
                  onClick={() => processOCR(selectedImage)} 
                  className="ocr-btn"
                  disabled={processingOCR}
                >
                  <ImageIcon size={16} />
                  {processingOCR ? 'Processing OCR...' : 'OCR'}
                </button>
              )}
              <button type="button" onClick={isEditingTransaction ? handleCancelEdit : () => setIsAddingTransaction(false)} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" className="save-btn" disabled={uploadingImage}>
                {uploadingImage ? 'Uploading...' : (isEditingTransaction ? 'Update Transaction' : 'Save Transaction')}
              </button>
            </div>

            {/* Error display */}
            {error && (
              <div className="error-message" style={{ 
                backgroundColor: '#fef2f2', 
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '12px',
                color: '#dc2626',
                marginTop: '1rem'
              }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '14px', fontWeight: '600' }}>Error:</h4>
                <p style={{ margin: '0', fontSize: '14px' }}>{error}</p>
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

      {/* Display OCR Result */}
      {ocrResult && (
        <div className="ocr-result">
          <h3>Complete Server Response:</h3>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '10px', 
            borderRadius: '5px',
            overflow: 'auto',
            maxHeight: '400px',
            whiteSpace: 'pre-wrap'
          }}>
            {JSON.stringify(ocrResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default TransactionSection;