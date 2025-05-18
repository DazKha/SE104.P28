import React from 'react';
import PropTypes from 'prop-types';

const BalanceCard = ({ balance, onAddClick }) => {
  // Hàm format số tiền với dấu chấm phân cách hàng nghìn
  const formatCurrency = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <div className="balance-card bg-gray-800 rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center">
        <h2 className="text-white text-xl font-medium">Current Balance</h2>
        <button 
          onClick={onAddClick}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-1 rounded"
        >
          Add
        </button>
      </div>
      <div className="mt-4">
        <h1 className="text-white text-4xl font-bold">
          {formatCurrency(balance)} đ
        </h1>
      </div>
    </div>
  );
};

BalanceCard.propTypes = {
  balance: PropTypes.number.isRequired,
  onAddClick: PropTypes.func.isRequired
};

export default BalanceCard;