import React, { useState, useEffect, useRef } from 'react';
import { outcomeCategories, incomeCategories } from '../../../../constants/categories';
import CurrencyInput from '../../../common/CurrencyInput.jsx';
import './AddTransactionModal.css';

const AddTransactionModal = ({ isOpen, onClose, onAddTransaction }) => {
  console.log('Modal render - isOpen:', isOpen); // Debug log

  const [transactionType, setTransactionType] = useState('outcome');
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState(outcomeCategories[0]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryRef = useRef(null);

  // Update category when transaction type changes
  useEffect(() => {
    const newCategory = transactionType === 'income' ? incomeCategories[0] : outcomeCategories[0];
    setCategory(newCategory);
  }, [transactionType]);

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

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      console.log('Modal opened - body overflow hidden');
    } else {
      document.body.style.overflow = 'unset';
      console.log('Modal closed - body overflow reset');
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newTransaction = {
      type: transactionType,
      amount: parseFloat(amount),
      category,
      description,
      date,
      id: Date.now() 
    };
    
    onAddTransaction(newTransaction);
    resetForm();
  };

  const resetForm = () => {
    setTransactionType('outcome');
    setAmount(0);
    setCategory(outcomeCategories[0]);
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const handleCategorySelect = (selectedCategory) => {
    setCategory(selectedCategory);
    setIsCategoryOpen(false);
  };

  // Get current categories based on transaction type
  const currentCategories = transactionType === 'income' ? incomeCategories : outcomeCategories;

  if (!isOpen) {
    console.log('Modal not rendered - isOpen is false'); // Debug log
    return null;
  }

  console.log('Rendering modal content'); // Debug log

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Thêm giao dịch mới</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Loại giao dịch</label>
            <div className="transaction-type-buttons">
              <button
                type="button"
                className={`type-btn ${transactionType === 'income' ? 'active' : ''}`}
                onClick={() => setTransactionType('income')}
              >
                Thu nhập
              </button>
              <button
                type="button"
                className={`type-btn ${transactionType === 'outcome' ? 'active' : ''}`}
                onClick={() => setTransactionType('outcome')}
              >
                Chi tiêu
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="amount">Số tiền</label>
            <CurrencyInput
              id="amount" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="form-group" ref={categoryRef}>
            <label htmlFor="category">Danh mục</label>
            <div className="category-select">
              <button
                type="button"
                className="category-select-button"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              >
                {category}
                <span className="category-arrow">▼</span>
              </button>
              {isCategoryOpen && (
                <div className="category-popup">
                  {currentCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`category-option ${category === cat ? 'selected' : ''}`}
                      onClick={() => handleCategorySelect(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Mô tả</label>
            <input
              type="text"
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Ngày</label>
            <input
              type="date"
              id="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="button-group">
            <button type="button" onClick={onClose} className="cancel-btn">Hủy</button>
            <button type="submit" className="submit-btn">Thêm giao dịch</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;