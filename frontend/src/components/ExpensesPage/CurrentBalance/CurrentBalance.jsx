import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './CurrentBalance.css';
import { useAuth } from '../../../contexts/AuthContext.jsx';

const CurrentBalance = () => {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalOutcome, setTotalOutcome] = useState(0);
  
  const { isLoggedIn } = useAuth();

  // Gọi API lấy transactions
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!isLoggedIn || !token) return;

    fetch('http://localhost:3000/api/transactions', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) {
          if (res.status === 401) {
            console.error('Unauthorized request. Please log in.');
          }
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => setTransactions(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error('Error fetching transactions:', err);
        setTransactions([]);
      });
  }, [isLoggedIn]);

  // Tính balance, income, outcome mỗi khi transactions thay đổi
  useEffect(() => {
    if (!Array.isArray(transactions)) {
      setTotalIncome(0);
      setTotalOutcome(0);
      setBalance(0);
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
    setBalance(income - outcome);
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

CurrentBalance.propTypes = {};

export default CurrentBalance;
