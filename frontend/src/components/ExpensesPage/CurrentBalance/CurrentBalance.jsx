import React, { useState } from 'react';
import PropTypes from 'prop-types';
import AddTransaction from './AddTransaction/AddTransaction.jsx';
import './CurrentBalance.css';

const BalanceCard = ({ balance = 0, onAddTransaction }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Format balance to currency
  const formatBalance = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleAddTransaction = (transaction) => {
    if (onAddTransaction) {
      onAddTransaction(transaction);
    }
    handleCloseModal();
  };

  return (
    <div className="current-balance__card">
      <div className="current-balance__header">
        <div>
          <h2> Số dư hiện tại </h2>
          <p> Cập nhật theo thời gian thực</p>
        </div>
      </div>

      <div className="current-balance__amount">
        <span>
          {formatBalance(balance)}
        </span>
      </div>

      {/* Thêm thông tin chi tiết */}
      <div className="current-balance__detail">
        <div className="current-balance__stat-card">
          <p>Thu nhập</p>
          <p>{formatBalance(Math.max(balance, 0))}</p>
        </div>
        <div className="current-balance__stat-card">
          <p>Chi tiêu</p>
          <p>{formatBalance(Math.abs(Math.min(balance, 0)))}</p>
        </div>
      </div>

      <AddTransaction
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddTransaction={handleAddTransaction}
      />
    </div>
  );
};

BalanceCard.propTypes = {
  balance: PropTypes.number,
  onAddTransaction: PropTypes.func
};

export default BalanceCard;

