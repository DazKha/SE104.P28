import React, { useState, useEffect, useRef } from 'react';
import TransactionList from './TransactionList.jsx';
import CurrencyInput from '../../common/CurrencyInput.jsx';
import { PlusIcon } from 'lucide-react';
import './TransactionSection.css';

const TransactionSection = ({ transactions = [], onAddTransaction, onUpdateTransaction, onDeleteTransaction }) => {
  const expenseCategories = [
    'Food & Drinks',
    'Transportation',
    'Housing',
    'Bills',
    'Travel',
    'Health',
    'Education',
    'Shopping',
    'Pets',
    'Sports',
    'Entertainment',
    'Investment',
    'Family',
    'Others'
  ];

  const incomeCategories = [
    'Salary',
    'Bonus',
    'Investment',
    'Business',
    'Gifts',
    'Others'
  ];

  // State for transaction form
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
      category: newType === 'income' ? incomeCategories[0] : expenseCategories[0]
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

  // Handle adding new transaction
  const handleAddTransaction = (e) => {
    e.preventDefault();
    
    // Validate input data
    if (!newTransaction.description || !newTransaction.category || !newTransaction.amount) {
      alert('Please fill in all transaction details');
      return;
    }

    // Call onAddTransaction from parent component
    if (onAddTransaction) {
      onAddTransaction(newTransaction);
    }
    
    // Reset form
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
    
    // Close add form
    setIsAddingTransaction(false);
  };

  // Handle delete transaction
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