import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './CurrentBalance.css';

const CurrentBalance = ({ balance = 0, transactions = [] }) => {
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalOutcome, setTotalOutcome] = useState(0);

  console.log('=== CURRENT BALANCE COMPONENT ===');
  console.log('Received balance:', balance);
  console.log('Received transactions count:', transactions.length);

  // Tính income, outcome mỗi khi transactions thay đổi
  useEffect(() => {
    if (!Array.isArray(transactions)) {
      setTotalIncome(0);
      setTotalOutcome(0);
      return;
    }

    let income = 0;
    let outcome = 0;

    transactions.forEach(tx => {
      if (tx.type === 'income') income += tx.amount;
      else if (tx.type === 'outcome') outcome += tx.amount;
    });

    setTotalIncome(income);
    setTotalOutcome(outcome);
  }, [transactions]);
  
  // Format balance to currency
  const formatBalance = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="current-balance__card">
      <div className="current-balance__header">
        <div>
          <h2>Current Balance</h2>
          <p>Update in real time</p>
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
          <p>Income</p>
          <p>{formatBalance(totalIncome)}</p>
        </div>
        <div className="current-balance__stat-card">
          <p>Expense</p>
          <p>{formatBalance(totalOutcome)}</p>
        </div>
      </div>
    </div>
  );
};

CurrentBalance.propTypes = {
  balance: PropTypes.number,
  transactions: PropTypes.array
};

export default CurrentBalance;
