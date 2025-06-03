import React from 'react';
import './ExpenseItem.css';

const ExpenseItem = ({ date, description, amount, category, type }) => {
  // Format date from DD/MM/YYYY to MMM D format
  const formatDate = (dateStr) => {
    const [day, month, year] = dateStr.split('/');
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Format amount to currency
  const formattedAmount = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(Math.abs(amount));

  // Determine if it's income or expense based on amount sign
  const isIncome = amount > 0;

  return (
    <div className="expense-item">
      <div className="expense-info">
        <div className="expense-date">{formatDate(date)}</div>
        <div className="expense-category">{category}</div>
        <div className="expense-title">{description}</div>
      </div>
      <div className={`expense-amount ${isIncome ? 'income' : 'expense'}`}>
        {isIncome ? '+' : '-'}{formattedAmount}
      </div>
    </div>
  );
};

export default ExpenseItem;