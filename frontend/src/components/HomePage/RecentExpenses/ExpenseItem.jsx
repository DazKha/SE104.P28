import React from 'react';
import './ExpenseItem.css';

const ExpenseItem = ({ date, description, amount, category, type }) => {
  // Format date
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short'
  });

  // Format amount to currency
  const formattedAmount = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);

  return (
    <div className="expense-item">
      <div className="expense-info">
        <div className="expense-date">{formattedDate}</div>
        <div className="expense-description">
          <span className="expense-category">{category}</span>
          <span className="expense-title">{description}</span>
        </div>
      </div>
      <div className={`expense-amount ${type.toLowerCase()}`}>
        {type === 'Income' ? '+' : '-'}{formattedAmount}
      </div>
    </div>
  );
};

export default ExpenseItem;