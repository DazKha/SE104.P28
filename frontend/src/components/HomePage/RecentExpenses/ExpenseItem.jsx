import React from 'react';

const ExpenseItem = ({ date, description, amount }) => {
  
   // Format balance to currency
  const formattedBalance = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(balance);

  return (
    <div className="expense-item">
      <div className="expense-date">{date}</div>
      <div className="expense-description">{description}</div>
      <div className="expense-amount">
        {formattedBalance}
      </div>
    </div>
  );
};

export default ExpenseItem;