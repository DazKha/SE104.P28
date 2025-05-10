import React from 'react';
import './BalanceCard.css';

const BalanceCard = ({ balance }) => {
  return (
    <div className="balance-card">
      <div className="card-header">
        <h2>Current Balance</h2>
        <button className="add-btn">+</button>
      </div>
      <div className="balance-amount">${balance.toFixed(2)}</div>
    </div>
  );
};

export default BalanceCard;