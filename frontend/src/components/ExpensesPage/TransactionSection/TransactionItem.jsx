import React from 'react';
import PropTypes from 'prop-types';

// Component này chỉ nhận và hiển thị một giao dịch duy nhất
const TransactionItem = ({ transaction }) => {
  // Format date from YYYY-MM-DD to DD/MM/YYYY
  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  // Format currency with dot separator for thousands
  const formatCurrency = (amount) => {
    return Math.abs(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Determine if transaction is income or expense for styling
  const isIncome = transaction.type === 'income';
  
  return (
    <div className={`transaction-item rounded-lg p-4 ${isIncome ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'} bg-gray-800`}>
      <div className="flex justify-between items-start">
        <div className="flex items-start">
          <div className={`arrow-icon mr-3 ${isIncome ? 'text-green-500' : 'text-red-500'}`}>
            {isIncome ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div>
            <div className="text-gray-400 text-xs">{formatDate(transaction.date)}</div>
            <div className="text-white font-medium">{transaction.description}</div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          {transaction.category && (
            <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded mb-1">
              {transaction.categoryLabel || transaction.category}
            </span>
          )}
          <div className={`font-bold ${isIncome ? 'text-green-500' : 'text-red-500'}`}>
            {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)} đ
          </div>
        </div>
      </div>
    </div>
  );
};

TransactionItem.propTypes = {
  transaction: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    date: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    type: PropTypes.oneOf(['income', 'expense']).isRequired,
    category: PropTypes.string,
    categoryLabel: PropTypes.string
  }).isRequired
};

export default TransactionItem;