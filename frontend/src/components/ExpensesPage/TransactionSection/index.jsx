import React, { useState, useEffect, useRef } from 'react';
import TransactionList from './TransactionList.jsx';
import CurrencyInput from '../../common/CurrencyInput.jsx';
import { PlusIcon } from 'lucide-react';
import './TransactionSection.css';

const TransactionSection = ({ transactions = [], onAddTransaction, onUpdateTransaction, onDeleteTransaction }) => {
  const expenseCategories = [
    'Ăn uống',
    'Di chuyển',
    'Thuê nhà',
    'Hoá đơn',
    'Du lịch',
    'Sức khoẻ',
    'Giáo dục',
    'Mua sắm',
    'Vật nuôi',
    'Thể dục thể thao',
    'Giải trí',
    'Đầu tư',
    'Người thân',
    'Khác'
  ];

  const incomeCategories = [
    'Lương',
    'Thưởng',
    'Đầu tư',
    'Kinh doanh',
    'Quà tặng',
    'Khác'
  ];

  // Trạng thái cho biểu mẫu thêm giao dịch
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryRef = useRef(null);
  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '/'),
    description: '',
    category: expenseCategories[0], // Set default category
    amount: '',
    type: 'outcome'
  });

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

  // Xử lý thay đổi input cho giao dịch mới
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction({
      ...newTransaction,
      [name]: name === 'amount' ? value : value
    });
  };

  // Xử lý thay đổi loại giao dịch (thu nhập/chi tiêu)
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setNewTransaction(prev => ({
      ...prev,
      type: newType,
      category: newType === 'income' ? incomeCategories[0] : expenseCategories[0]
    }));
  };

  // Xử lý chọn category
  const handleCategorySelect = (selectedCategory) => {
    setNewTransaction({
      ...newTransaction,
      category: selectedCategory
    });
    setIsCategoryOpen(false);
  };

  // Xử lý thêm giao dịch mới
  const handleAddTransaction = (e) => {
    e.preventDefault();
    
    // Kiểm tra dữ liệu đầu vào
    if (!newTransaction.description || !newTransaction.category || !newTransaction.amount) {
      alert('Vui lòng điền đầy đủ thông tin giao dịch');
      return;
    }

    // Gọi hàm onAddTransaction từ parent component
    if (onAddTransaction) {
      onAddTransaction(newTransaction);
    }
    
    // Đặt lại biểu mẫu
    setNewTransaction({
      date: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).replace(/\//g, '/'),
      description: '',
      category: newTransaction.type === 'income' ? incomeCategories[0] : expenseCategories[0],
      amount: '',
      type: 'outcome'
    });
    
    // Đóng biểu mẫu thêm
    setIsAddingTransaction(false);
  };

  // Xử lý xóa giao dịch
  const handleDeleteTransaction = (id) => {
    if (onDeleteTransaction) {
      onDeleteTransaction(id);
    }
  };

  return (
    <div className="transaction-section">
      <div className="section-header">
        <h2 className="section-title">Transaction</h2>
        <button 
          onClick={() => setIsAddingTransaction(!isAddingTransaction)}
          className="add-btn"
        >
          ➕ Add Transaction
        </button>
      </div>

      {isAddingTransaction && (
        <div className="transaction-form">
          <form onSubmit={handleAddTransaction}>
            <div className="form-grid">
              <div className="form-group">
                <label>Ngày</label>
                <input
                  type="text"
                  name="date"
                  value={newTransaction.date}
                  onChange={handleInputChange}
                  className="search-input"
                  placeholder="DD/MM/YYYY"
                />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <input
                  type="text"
                  name="description"
                  value={newTransaction.description}
                  onChange={handleInputChange}
                  className="search-input"
                  placeholder="Mô tả giao dịch"
                />
              </div>
              <div className="form-group" ref={categoryRef}>
                <label>Danh mục</label>
                <div className="category-select">
                  <button
                    type="button"
                    className="category-select-button"
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  >
                    {newTransaction.category || 'Chọn danh mục'}
                  </button>
                  {isCategoryOpen && (
                    <div className="category-popup">
                      {(newTransaction.type === 'income' ? incomeCategories : expenseCategories).map((cat) => (
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
                <label>Số tiền (đ)</label>
                <CurrencyInput
                  placeholder="Số tiền"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                  className="search-input"
                />
              </div>
              <div className="form-group">
                <label>Loại</label>
                <select
                  name="type"
                  value={newTransaction.type}
                  onChange={handleTypeChange}
                  className="search-input"
                >
                  <option value="outcome">Chi tiêu</option>
                  <option value="income">Thu nhập</option>
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => setIsAddingTransaction(false)}
                className="filter-btn"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="filter-btn active"
              >
                Lưu giao dịch
              </button>
            </div>
          </form>
        </div>
      )}

      <TransactionList 
        transactions={transactions} 
        onDelete={handleDeleteTransaction} 
      />
    </div>
  );
};

export default TransactionSection;