import React, { useState, useEffect } from 'react';
import './HomePage.css';
import BalanceCard from './BalanceCard';
import RecentExpenses from './RecentExpenses';
import IncomeExpensesChart from './IncomeExpensesChart/index.jsx';

const HomePage = () => {
  const [transactions, setTransactions] = useState(() => {
    const savedTransactions = localStorage.getItem('transactions');
    return savedTransactions ? JSON.parse(savedTransactions) : [];
  });
  const [balance, setBalance] = useState(0);

  // Calculate balance whenever transactions change
  useEffect(() => {
    const newBalance = transactions.reduce((total, transaction) => {
      const amount = parseFloat(transaction.amount);
      if (transaction.type === 'income') {
        return total + amount;
      } else {
        return total - amount;
      }
    }, 0);
    
    setBalance(newBalance);
  }, [transactions]);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Lấy tất cả giao dịch gần đây (cả thu nhập và chi tiêu)
  const recentTransactions = transactions
    .map(transaction => ({
      id: transaction.id,
      date: transaction.date,
      description: transaction.description,
      category: transaction.category,
      amount: transaction.amount,
      type: transaction.type
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5); // Chỉ lấy 5 giao dịch gần nhất

  // Xử lý thêm giao dịch mới
  const handleAddTransaction = (newTransaction) => {
    // Thêm id cho giao dịch mới
    const transactionWithId = {
      ...newTransaction,
      id: Date.now(), // Sử dụng timestamp làm id
      date: new Date().toISOString() // Thêm ngày hiện tại nếu chưa có
    };

    setTransactions([transactionWithId, ...transactions]);
  };

  return (
    <div className="homepage-container">
      <div className="dashboard-content">
        {/* Card hiển thị số dư */}
        <BalanceCard balance={balance} 
        onAddTransaction={handleAddTransaction} 
        />
      
        <div className="dashboard-grid">
          {/* Card giao dịch gần đây */}
          <RecentExpenses expenses={recentTransactions} />

          {/* Card biểu đồ thu nhập và chi tiêu */}
          <IncomeExpensesChart transactions={transactions} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;