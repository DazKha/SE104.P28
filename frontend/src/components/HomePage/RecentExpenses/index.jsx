import React from 'react';
import { Link } from 'react-router-dom';
import ExpenseItem from './ExpenseItem';
import './RecentExpenses.css';

const RecentExpenses = ({ expenses }) => {
  return (
    <div className="card expenses-card">
      <div className="card-header">
        <h2>Recent Expenses</h2>
      </div>
      <div className="expense-list">
        {expenses && expenses.length > 0 ? (
          expenses.map((expense) => (
            <ExpenseItem 
              key={expense.id}
              date={expense.date}
              description={expense.description}
              amount={expense.amount}
              category={expense.category}
              type={expense.type}
            />
          ))
        ) : (
          <div className="no-expenses">
            <p>No recent transactions</p>
          </div>
        )}
      </div>
      <div className="view-all">
        <Link to="/all-transactions" className="view-all-button">View All</Link>
      </div>
    </div>
  );
};

export default RecentExpenses;