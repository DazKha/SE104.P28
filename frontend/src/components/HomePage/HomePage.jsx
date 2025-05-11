import React, { useState, useEffect } from 'react';
import './HomePage.css';
import Navbar from './NavBar';
import BalanceCard from './BalanceCard';
import RecentExpenses from './RecentExpenses';
import IncomeExpensesChart from './IncomeExpensesChart';
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

  // Lọc chỉ lấy các giao dịch chi tiêu cho RecentExpenses
  const expenses = transactions
    .filter(transaction => transaction.type === 'Expense')
    .map(expense => ({
      id: expense.id,
      date: expense.date,
      description: expense.description,
      category: expense.category,
      amount: expense.amount
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sắp xếp theo ngày mới nhất

  // Xử lý thêm giao dịch mới
  const handleAddTransaction = (newTransaction) => {
    setTransactions([...transactions, newTransaction]);

    console.log('Transaction added:', newTransaction);
  };
  
  return (
    <div className="homepage-container">
      {/* Thanh điều hướng */}
      <Navbar />

      <div className="dashboard-content">
        {/* Card hiển thị số dư */}
        <BalanceCard balance={balance} 
        onAddTransaction={handleAddTransaction} 
        />

        <div className="dashboard-grid">
          {/* Card chi tiêu gần đây */}
          <RecentExpenses expenses={expenses} />

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