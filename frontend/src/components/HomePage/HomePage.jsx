import React, { useState, useEffect } from 'react';
import './HomePage.css';
import BalanceCard from './BalanceCard';
import RecentExpenses from './RecentExpenses';
import IncomeExpensesChart from './IncomeExpensesChart/index.jsx';
import transactionService from '../../services/transactionService';

const HomePage = () => {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch transactions from API when component mounts
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const data = await transactionService.getAllTransactions();
        setTransactions(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transactions');
        // Fallback to localStorage if API fails
        const savedTransactions = localStorage.getItem('transactions');
        if (savedTransactions) {
          setTransactions(JSON.parse(savedTransactions));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Calculate balance whenever transactions change
  useEffect(() => {
    const newBalance = transactions.reduce((total, transaction) => {
      const amount = parseFloat(transaction.amount);
      if (transaction.type === 'income') {
        return total + amount; // Cộng thêm số tiền thu nhập
      } else if (transaction.type === 'outcome') {
        return total - amount; // Trừ đi số tiền chi tiêu
      }
      return total;
    }, 0);
    
    setBalance(newBalance);
  }, [transactions]);

  // Lấy tất cả giao dịch gần đây (cả thu nhập và chi tiêu)
  const recentTransactions = transactions
    .map(transaction => ({
      id: transaction.id,
      date: transaction.date,
      description: transaction.note || transaction.description || '',
      category: transaction.category_name || transaction.category || '',
      amount: transaction.amount,
      type: transaction.type
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5); // Chỉ lấy 5 giao dịch gần nhất

  // Xử lý thêm giao dịch mới
  const handleAddTransaction = async (newTransaction) => {
    console.log('Adding new transaction:', newTransaction);
    
    try {
      // Chuẩn bị dữ liệu giao dịch cho API
      const transactionForAPI = {
        amount: Math.abs(parseFloat(newTransaction.amount)),
        date: newTransaction.date || new Date().toISOString().split('T')[0],
        category_id: 1, // Temporary category ID
        note: newTransaction.description || '',
        type: newTransaction.type
      };

      console.log('Sending to API:', transactionForAPI);

      // Gọi API để thêm giao dịch mới
      const addedTransaction = await transactionService.addTransaction(transactionForAPI);
      console.log('API response:', addedTransaction);
      
      // Cập nhật state với functional update để tránh stale closure
      setTransactions(prevTransactions => {
        const newTransactions = [addedTransaction, ...prevTransactions];
        console.log('Updated transactions:', newTransactions);
        return newTransactions;
      });
      
      setError(null);
      console.log('Transaction added successfully');
      
    } catch (err) {
      console.error('Error adding transaction:', err);
      setError('Failed to add transaction: ' + err.message);
      
      // Fallback: thêm vào state và localStorage
      const fallbackTransaction = {
        id: Date.now(),
        amount: Math.abs(parseFloat(newTransaction.amount)),
        date: newTransaction.date || new Date().toISOString().split('T')[0],
        description: newTransaction.description || '',
        category: newTransaction.category || 'Không xác định',
        type: newTransaction.type
      };
      
      console.log('Using fallback transaction:', fallbackTransaction);
      
      setTransactions(prevTransactions => {
        const newTransactions = [fallbackTransaction, ...prevTransactions];
        localStorage.setItem('transactions', JSON.stringify(newTransactions));
        return newTransactions;
      });
    }
  };

  if (isLoading) {
    return <div className="homepage-container">
      <div className="dashboard-content">
        <div className="loading">Loading transactions...</div>
      </div>
    </div>;
  }

  return (
    <div className="homepage-container">
      <div className="dashboard-content">
        {error && (
          <div className="error-message" style={{
            backgroundColor: '#ff4444',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}
        
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