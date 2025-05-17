import React from 'react';
import { Link } from 'react-router-dom';
import ExpenseItem from './ExpenseItem';
import './RecentExpenses.css';

const RecentExpenses = ({ expenses }) => {
  return (
    <div className="card expenses-card">
      <h2>Recent Expenses</h2>
      <div className="expense-list">
        {expenses.map((expense) => (
          <ExpenseItem 
            key={expense.id}
            date={expense.date}
            description={expense.description}
            amount={expense.amount}
          />
        ))}
      </div>
      <div className="view-all">
        <a href="/all-transactions" className="view-all-button">View All</a>
      </div>
    </div>
  );
};

export default RecentExpenses;