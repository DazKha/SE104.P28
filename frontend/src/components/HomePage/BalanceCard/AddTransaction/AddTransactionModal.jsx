import React, { useState } from 'react';
import CurrencyInput from '../../../common/CurrencyInput.jsx';
import './AddTransactionModal.css';

const AddTransactionModal = ({ isOpen, onClose, onAddTransaction }) => {
  const [transactionType, setTransactionType] = useState('income');
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newTransaction = {
      type: transactionType,
      amount: parseFloat(amount),
      category,
      description,
      date,
      id: Date.now() // Simple unique ID
    };
    
    onAddTransaction(newTransaction);
    resetForm();
  };

  const resetForm = () => {
    setTransactionType('outcome');
    setAmount(0);
    setCategory('Không xác định');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
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
              required
            >
              <option value="income">Income</option>
              <option value="outcome">Expense</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <CurrencyInput
              id="amount" 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)}
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

export default AddTransactionModal;