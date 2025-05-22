import React, { useState, useEffect } from 'react';
import './AddTransaction.css';

const AddTransaction = ({ isOpen, onClose, onAddTransaction }) => {
  const [transactionType, setTransactionType] = useState('Income');
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState('Không xác định');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const categories = [
    'Ăn uống', 'Di chuyển', 'Thuê nhà', 'Hoá đơn', 'Du lịch', 'Sức khoẻ',
    'Giáo dục', 'Mua sắm', 'Vật nuôi', 'Thể dục thể thao', 'Giải trí',
    'Đầu tư', 'Người thân', 'Không xác định'
  ];

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
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
    setTransactionType('Expense');
    setAmount(0);
    setCategory('Không xác định');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Transaction</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="transactionType">Transaction Type</label>
            <select 
              id="transactionType" 
              value={transactionType} 
              onChange={(e) => setTransactionType(e.target.value)}
            >
              <option value="Expense">Expense</option>
              <option value="Income">Income</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <input 
              type="number" 
              id="amount" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select 
              id="category" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <input 
              type="text" 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input 
              type="date" 
              id="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          
          <div className="button-group">
            <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
            <button type="submit" className="submit-btn">Add Transaction</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransaction;
