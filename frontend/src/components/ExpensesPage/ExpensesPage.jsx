import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useDataReset } from '../../hooks/useDataReset.js';
import TransactionSection from './TransactionSection/index.jsx';
import ReportSection from './ReportSection/ReportSection';
import CurrentBalance from './CurrentBalance/CurrentBalance';
import expenseService from '../../services/expenseService';

const ExpensesPage = () => {
  const { isLoggedIn } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async () => {
    if (!isLoggedIn) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await expenseService.getAll();
      setTransactions(data);
      
      // Calculate balance from API data
      const totalBalance = data.reduce((sum, transaction) => {
        return sum + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
      }, 0);
      
      setBalance(totalBalance);
    } catch (err) {
      setError('Failed to fetch transactions');
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn]);

  // Reset data chỉ khi user thay đổi hoặc lần đầu đăng nhập
  const resetData = useCallback(() => {
    setTransactions([]);
    setBalance(0);
    setError(null);
    fetchTransactions();
  }, [fetchTransactions]);

  useDataReset(resetData);

  // Fetch data khi component mount hoặc login status thay đổi
  useEffect(() => {
    if (isLoggedIn) {
      fetchTransactions();
    }
  }, [isLoggedIn, fetchTransactions]);

  // Handle adding new transaction
  const handleAddTransaction = async (newTransaction) => {
    try {
      // Save to API
      const savedTransaction = await expenseService.create(newTransaction);
      
      // Update local state
      setTransactions(prev => [...prev, savedTransaction]);
      
      // Update balance
      setBalance(prev => prev + (savedTransaction.type === 'income' ? savedTransaction.amount : -savedTransaction.amount));
    } catch (err) {
      setError('Failed to add transaction');
      console.error('Error adding transaction:', err);
    }
  };

  // Handle updating transaction
  const handleUpdateTransaction = async (id, updatedData) => {
    try {
      const updatedTransaction = await expenseService.update(id, updatedData);
      
      // Update local state
      setTransactions(prev => prev.map(transaction => 
        transaction._id === id ? updatedTransaction : transaction
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
      await expenseService.delete(id);
      
      // Update local state
      setTransactions(prev => prev.filter(transaction => transaction._id !== id));
      
      // Recalculate balance
      const newBalance = transactions.reduce((sum, transaction) => {
        return sum + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
      }, 0);
      
      setBalance(newBalance);
    } catch (err) {
      setError('Failed to delete transaction');
      console.error('Error deleting transaction:', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

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

