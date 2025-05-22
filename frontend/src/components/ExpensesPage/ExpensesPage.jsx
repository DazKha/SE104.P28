import React, { useState, useEffect } from 'react';
import TransactionSection from './TransactionSection/index.jsx';
import ReportSection from './ReportSection/ReportSection';
import CurrentBalance from './CurrentBalance/CurrentBalance';
import { expenseService } from '../../services/api';

const ExpensesPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load transactions from API
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await expenseService.getAll();
        setTransactions(data);
        // Calculate initial balance
        const totalBalance = data.reduce((sum, transaction) => {
          return sum + (transaction.type === 'Income' ? transaction.amount : -transaction.amount);
        }, 0);
        setBalance(totalBalance);
      } catch (err) {
        setError('Failed to fetch transactions');
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Handle adding new transaction
  const handleAddTransaction = async (newTransaction) => {
    try {
      const savedTransaction = await expenseService.create(newTransaction);
      setTransactions(prev => [...prev, savedTransaction]);
      setBalance(prev => prev + (savedTransaction.type === 'Income' ? savedTransaction.amount : -savedTransaction.amount));
    } catch (err) {
      setError('Failed to add transaction');
      console.error('Error adding transaction:', err);
    }
  };

  // Handle updating transaction
  const handleUpdateTransaction = async (id, updatedData) => {
    try {
      const updatedTransaction = await expenseService.update(id, updatedData);
      setTransactions(prev => prev.map(transaction => 
        transaction._id === id ? updatedTransaction : transaction
      ));
      // Recalculate balance
      const newBalance = transactions.reduce((sum, transaction) => {
        return sum + (transaction.type === 'Income' ? transaction.amount : -transaction.amount);
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
      setTransactions(prev => prev.filter(transaction => transaction._id !== id));
      // Recalculate balance
      const newBalance = transactions.reduce((sum, transaction) => {
        return sum + (transaction.type === 'Income' ? transaction.amount : -transaction.amount);
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

