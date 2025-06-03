import React from 'react';
import { categoryLabels } from '../../../constants/categories';
import './ExpenseItem.css';

const ExpenseItem = ({ date, description, amount, category, type }) => {
  // Format date - handle multiple formats
  const formatDate = (dateStr) => {
    try {
      // Handle null, undefined, or empty string
      if (!dateStr || dateStr === '' || dateStr === null || dateStr === undefined) {
        return 'No Date';
      }
      
      let dateObj;
      
      // Convert to string if it's not already
      const dateString = String(dateStr);
      
      // Check if it's already a valid date string or ISO format
      if (dateString.includes('T') || dateString.includes('-')) {
        // ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss)
        dateObj = new Date(dateString);
      } else if (dateString.includes('/')) {
        // DD/MM/YYYY format
        const [day, month, year] = dateString.split('/');
        dateObj = new Date(year, month - 1, day);
      } else {
        // Try to parse as is
        dateObj = new Date(dateString);
      }
      
      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }
      
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  // Format amount to currency
  const formattedAmount = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(Math.abs(amount));

  // Determine if it's income or expense based on type
  const isIncome = type === 'income';

  // Get category label
  const categoryLabel = categoryLabels[category] || category;

  return (
    <div className="expense-item">
      <div className="expense-info">
        <div className="expense-date">{formatDate(date)}</div>
        <div className="expense-category">{categoryLabel}</div>
        <div className="expense-title">{description}</div>
      </div>
      <div className={`expense-amount ${isIncome ? 'income' : 'expense'}`}>
        {isIncome ? '+' : '-'}{formattedAmount}
      </div>
    </div>
  );
};

export default ExpenseItem;