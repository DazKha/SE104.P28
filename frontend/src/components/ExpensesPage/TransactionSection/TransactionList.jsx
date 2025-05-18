import React from 'react';
import PropTypes from 'prop-types';
import TransactionItem from './TransactionItem';

// Component này chỉ tập trung vào việc render danh sách
const TransactionList = ({ transactions }) => {
  // Kiểm tra nếu không có giao dịch
  if (transactions.length === 0) {
    return (
      <div className="text-center py-6 text-gray-400">
        Không có giao dịch nào
      </div>
    );
  }

  return (
    <div className="transaction-list space-y-3">
      {transactions.map((transaction) => (
        <TransactionItem 
          key={transaction.id} 
          transaction={transaction} 
        />
      ))}
    </div>
  );
};

TransactionList.propTypes = {
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      date: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      amount: PropTypes.number.isRequired,
      type: PropTypes.oneOf(['income', 'expense']).isRequired,
      category: PropTypes.string,
      categoryLabel: PropTypes.string
    })
  ).isRequired
};

export default TransactionList;