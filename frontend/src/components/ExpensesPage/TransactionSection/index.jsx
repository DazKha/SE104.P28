import React, { useState, useEffect } from 'react';
import TransactionList from './TransactionList.jsx';
import CurrencyInput from '../../common/CurrencyInput.jsx';
import { PlusIcon } from 'lucide-react';
import './TransactionSection.css';

const TransactionSection = () => {
  // Trạng thái cho danh sách các giao dịch
  const [transactions, setTransactions] = useState(() => {
    // Kiểm tra xem có dữ liệu trong localStorage không
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
      return JSON.parse(savedTransactions);
    }
    // Dữ liệu mặc định nếu không có dữ liệu lưu trữ
    return [
      {
        id: 1,
        date: '25/07/2024',
        description: 'July Salary',
        category: 'Lương',
        amount: 25000000,
        type: 'income'
      },
      {
        id: 2,
        date: '26/07/2024',
        description: 'Gas refill',
        category: 'Di chuyển',
        amount: -500000,
        type: 'expense'
      },
      {
        id: 3,
        date: '27/07/2024',
        description: 'Monthly rent',
        category: 'Thuê nhà',
        amount: -5000000,
        type: 'expense'
      },
      {
        id: 4,
        date: '29/07/2024',
        description: 'Lunch with colleagues',
        category: 'Ăn uống',
        amount: -1200000,
        type: 'expense'
      }
    ];
  });

  // Trạng thái cho biểu mẫu thêm giao dịch
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '/'),
    description: '',
    category: '',
    amount: '',
    type: 'expense'
  });

  // Lưu giao dịch vào localStorage mỗi khi danh sách thay đổi
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

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
    setNewTransaction({
      ...newTransaction,
      type: e.target.value
    });
  };

  // Xử lý thêm giao dịch mới
  const handleAddTransaction = (e) => {
    e.preventDefault();
    
    // Kiểm tra dữ liệu đầu vào
    if (!newTransaction.description || !newTransaction.category || !newTransaction.amount) {
      alert('Vui lòng điền đầy đủ thông tin giao dịch');
      return;
    }

    // Tạo giao dịch mới với ID duy nhất
    const amount = Number(newTransaction.amount);
    const finalAmount = newTransaction.type === 'expense' ? -Math.abs(amount) : Math.abs(amount);
    
    const transaction = {
      id: Date.now(),
      date: newTransaction.date,
      description: newTransaction.description,
      category: newTransaction.category,
      amount: finalAmount,
      type: newTransaction.type
    };

    // Thêm giao dịch mới vào đầu danh sách
    setTransactions([transaction, ...transactions]);
    
    // Đặt lại biểu mẫu
    setNewTransaction({
      date: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).replace(/\//g, '/'),
      description: '',
      category: '',
      amount: '',
      type: 'expense'
    });
    
    // Đóng biểu mẫu thêm
    setIsAddingTransaction(false);
  };

  // Xử lý xóa giao dịch
  const handleDeleteTransaction = (id) => {
    const updatedTransactions = transactions.filter(transaction => transaction.id !== id);
    setTransactions(updatedTransactions);
  };

  return (
    <div className="transaction-section">
      <div className="section-header">
        <h2 className="section-title">Transactions</h2>
        <button 
          onClick={() => setIsAddingTransaction(!isAddingTransaction)}
          className="filter-btn"
        >
          <PlusIcon size={16} />
          Add Transaction
        </button>
      </div>

      {isAddingTransaction && (
        <div className="transaction-form">
          <form onSubmit={handleAddTransaction}>
            <div className="form-grid">
              <div className="form-group">
                <label>Date</label>
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
              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  value={newTransaction.category}
                  onChange={handleInputChange}
                  className="search-input"
                  placeholder="Category"
                />
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Amount (đ)</label>
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
                  <option value="expense">Chi tiêu</option>
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
                Cancel
              </button>
              <button
                type="submit"
                className="filter-btn active"
              >
                Save Transaction
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