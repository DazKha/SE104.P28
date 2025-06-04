import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useDataReset } from '../../hooks/useDataReset.js';
import TransactionSection from './TransactionSection/index.jsx';
import ReportSection from './ReportSection/ReportSection';
import CurrentBalance from './CurrentBalance/CurrentBalance';
import transactionService from '../../services/transactionService';

const ExpensesPage = () => {
  const { isLoggedIn } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionService.getAllTransactions();
      setTransactions(data);
      
      // Calculate balance from API data
      const totalBalance = data.reduce((sum, transaction) => {
        return sum + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
      }, 0);
      
      setBalance(totalBalance);
    } catch (err) {
      setError('Failed to fetch transactions');
      console.error('Error fetching transactions:', err);
      // Fallback to localStorage if API fails
      const savedTransactions = localStorage.getItem('transactions');
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset data chỉ khi user thay đổi hoặc lần đầu đăng nhập
  const resetData = useCallback(() => {
    setTransactions([]);
    setBalance(0);
    setError(null);
    fetchTransactions();
  }, [fetchTransactions]);

  useDataReset(resetData);

  // Fetch data khi component mount
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Handle adding new transaction
  const handleAddTransaction = async (newTransaction) => {
    try {
      console.log('Adding transaction in ExpensesPage:', newTransaction);
      
      // Chuẩn bị dữ liệu cho API
      const transactionForAPI = {
        amount: Math.abs(parseFloat(newTransaction.amount)),
        date: newTransaction.date || new Date().toISOString().split('T')[0],
        category_id: 1, // Temporary category ID
        note: newTransaction.description || '',
        type: newTransaction.type
      };

      // Save to API
      const savedTransaction = await transactionService.addTransaction(transactionForAPI);
      console.log('API response:', savedTransaction);
      
      // Update local state với functional update
      setTransactions(prevTransactions => {
        const newTransactions = [savedTransaction, ...prevTransactions];
        return newTransactions;
      });
      
      // Update balance
      setBalance(prev => prev + (savedTransaction.type === 'income' ? savedTransaction.amount : -savedTransaction.amount));
      
      setError(null);
    } catch (err) {
      setError('Failed to add transaction: ' + err.message);
      console.error('Error adding transaction:', err);
      
      // Fallback: add to local state
      const fallbackTransaction = {
        id: Date.now(),
        amount: newTransaction.type === 'income' ? Math.abs(parseFloat(newTransaction.amount)) : -Math.abs(parseFloat(newTransaction.amount)),
        date: newTransaction.date || new Date().toISOString().split('T')[0],
        note: newTransaction.description || '',
        description: newTransaction.description || '',
        category: newTransaction.category || 'Không xác định',
        type: newTransaction.type
      };
      
      setTransactions(prev => [fallbackTransaction, ...prev]);
      setBalance(prev => prev + (fallbackTransaction.type === 'income' ? fallbackTransaction.amount : -fallbackTransaction.amount));
    }
  };

  // Handle updating transaction
  const handleUpdateTransaction = async (id, updatedData) => {
    try {
      const updatedTransaction = await transactionService.updateTransaction(id, updatedData);
      
      // Update local state
      setTransactions(prev => prev.map(transaction => 
        transaction.id === id ? updatedTransaction : transaction
      ));
      
      // Recalculate balance
      const newBalance = transactions.reduce((sum, transaction) => {
        return sum + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
      }, 0);
      
      setBalance(newBalance);
    } catch (err) {
      setError('Failed to update transaction');
      console.error('Error updating transaction:', err);
    }
  };

  // Handle deleting transaction
  const handleDeleteTransaction = async (id) => {
    try {
      await transactionService.deleteTransaction(id);
      
      // Update local state
      setTransactions(prev => prev.filter(transaction => transaction.id !== id));
      
      // Recalculate balance từ remaining transactions
      const remainingTransactions = transactions.filter(transaction => transaction.id !== id);
      const newBalance = remainingTransactions.reduce((sum, transaction) => {
        return sum + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
      }, 0);
      
      setBalance(newBalance);
    } catch (err) {
      setError('Failed to delete transaction');
      console.error('Error deleting transaction:', err);
    }
  };

  if (loading) return <div className="loading">Loading transactions...</div>;
  if (error) return (
    <div className="error-message" style={{
      backgroundColor: '#ff4444',
      color: 'white', 
      padding: '10px',
      borderRadius: '5px',
      margin: '20px'
    }}>
      {error}
    </div>
  );

  return (
    <div>
      <div>
        <div>
          <CurrentBalance 
            balance={balance}
            onAddTransaction={handleAddTransaction}
          />
        </div>
        <div>
          <TransactionSection 
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        </div>
        <div>
          <ReportSection transactions={transactions} />
        </div>
      </div>
    </div>
  );
};

export default ExpensesPage;

