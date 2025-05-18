import React, { useState } from 'react';
import PropTypes from 'prop-types';
import TransactionList from './TransactionList.jsx';

const TransactionSection = ({ transactions }) => {
  // State và logic cho TransactionSection
  const [filter, setFilter] = useState('all'); // all, income, expense
  
  // Lọc giao dịch theo loại (nếu cần)
  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(transaction => transaction.type === filter);

  return (
    <div className="transaction-section">
      {/* Header của section có thể thêm filter, sort, search nếu cần */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white text-xl font-medium">Transactions</h2>
        {/* Có thể thêm các nút lọc hoặc dropdown tại đây */}
      </div>
      
      {/* Truyền dữ liệu đã lọc xuống TransactionList */}
      <TransactionList transactions={filteredTransactions} />
      
      {/* Có thể thêm phân trang hoặc nút "Xem thêm" tại đây */}
    </div>
  );
};

TransactionSection.propTypes = {
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

export default TransactionSection;