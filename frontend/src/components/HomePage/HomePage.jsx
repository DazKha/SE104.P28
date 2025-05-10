import React, { useState } from 'react';
import './HomePage.css';
import Navbar from './Navbar';
import BalanceCard from './BalanceCard';
import RecentExpenses from './RecentExpenses';
import IncomeExpensesChart from './IncomeExpensesChart';

const HomePage = () => {
  // State và dữ liệu mẫu
  const [currentBalance] = useState(5000.00);
  
  // Dữ liệu mẫu cho chi tiêu gần đây
  const recentExpenses = [
    { id: 1, date: '07/16/2024', description: 'Coffee Shop', amount: 50.00 },
    { id: 2, date: '07/14/2024', description: 'Online Store', amount: 100.00 },
    { id: 3, date: '07/13/2024', description: 'Gas Station', amount: 75.00 },
  ];

  // Dữ liệu mẫu cho biểu đồ thu nhập và chi tiêu
  const chartData = [
    { name: 'Week 1', income: 800, expenses: 650 },
    { name: 'Week 2', income: 900, expenses: 700 },
    { name: 'Week 3', income: 950, expenses: 720 },
    { name: 'Week 4', income: 1020, expenses: 750 },
  ];

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  

  return (
    <div className="homepage-container">
      {/* Thanh điều hướng */}
      <Navbar />

      <main className="dashboard-content">
        {/* Card hiển thị số dư */}
        <BalanceCard balance={currentBalance} />

        <div className="dashboard-grid">
          {/* Card chi tiêu gần đây */}
          <RecentExpenses expenses={recentExpenses} />

          {/* Card biểu đồ thu nhập và chi tiêu */}
          <IncomeExpensesChart data={chartData} />
        </div>
      </main>
    </div>
  );
};

export default HomePage;