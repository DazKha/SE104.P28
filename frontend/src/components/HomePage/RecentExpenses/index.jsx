import React from 'react';
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
          expenses.map((expense, index) => (
            <ExpenseItem 
              key={expense.id || `expense-${index}`}
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
    </div>
  );
};

export default RecentExpenses;