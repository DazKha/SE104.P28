import React from 'react';

const ExpenseItem = ({ date, description, amount }) => {
  return (
    <div className="expense-item">
      <div className="expense-date">{date}</div>
      <div className="expense-description">{description}</div>
      <div className="expense-amount">${amount.toFixed(2)}</div>
    </div>
  );
};

export default ExpenseItem;