import React, { useState, useEffect } from 'react';
import './HomePage.css';
import BalanceCard from './BalanceCard';
import RecentExpenses from './RecentExpenses';
import IncomeExpensesChart from './IncomeExpensesChart/index.jsx';
import AddTransactionModal from './BalanceCard/AddTransaction/AddTransactionModal';

const HomePage = () => {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Calculate balance whenever transactions change
  useEffect(() => {
    const newBalance = transactions.reduce((total, transaction) => {
      if (transaction.type === 'Income') {
        return total + transaction.amount;
      } else {
        return total - transaction.amount;
      }
    }, 0);
    
    setBalance(newBalance);
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

    if (newTransaction.type === 'Income') {
      setBalance(balance + parseFloat(newTransaction.amount));
    } else {
      setBalance(balance - parseFloat(newTransaction.amount));
    }

    setIsModalOpen(false);
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
        
        <AddTransactionModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onAddTransaction={handleAddTransaction}
        />
      </div>
    </div>
  );
};

export default HomePage;