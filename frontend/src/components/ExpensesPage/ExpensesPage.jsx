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
      console.log('Date received:', newTransaction.date, 'Type:', typeof newTransaction.date);
      
      // Validate amount
      const amount = parseFloat(newTransaction.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Amount must be a positive number');
      }
      
      // Validate date with better format handling
      if (!newTransaction.date) {
        throw new Error('Date is required');
      }
      
      let dateToValidate = newTransaction.date;
      
      // Convert DD/MM/YYYY to YYYY-MM-DD for Date.parse
      if (dateToValidate.includes('/')) {
        const parts = dateToValidate.split('/');
        if (parts.length === 3) {
          // Assuming DD/MM/YYYY format
          const [day, month, year] = parts;
          dateToValidate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }
      
      if (isNaN(Date.parse(dateToValidate))) {
        throw new Error('Invalid date format');
      }
      
      // Validate type
      if (!newTransaction.type || !['income', 'outcome'].includes(newTransaction.type)) {
        throw new Error('Invalid transaction type');
      }
      
      // Convert to YYYY-MM-DD format (ISO) for reliable parsing
      let formattedDate = newTransaction.date;
      if (newTransaction.date.includes('/')) {
        // Convert DD/MM/YYYY to YYYY-MM-DD
        const [day, month, year] = newTransaction.date.split('/');
        formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      // If already in YYYY-MM-DD format, keep as is
      
      console.log('After conversion:', formattedDate);
      
      // Chuẩn bị dữ liệu cho API
      const transactionForAPI = {
        amount: Math.abs(amount),
        date: formattedDate,
        category: newTransaction.category, // Pass the selected category name
        note: newTransaction.description || '',
        type: newTransaction.type,
        receipt_image: newTransaction.imagePath || null, // Base64 image data
        receipt_data: newTransaction.ocrData ? JSON.stringify(newTransaction.ocrData) : null // OCR data as JSON string
      };
      
      console.log('Transaction data with image:', {
        hasImagePath: !!newTransaction.imagePath,
        imagePathPreview: newTransaction.imagePath ? newTransaction.imagePath.substring(0, 50) + '...' : 'No image',
        ocrData: newTransaction.ocrData
      });

      // Log data being sent to API
      console.log('Data being sent to API:', transactionForAPI);
      console.log('Stringified data:', JSON.stringify(transactionForAPI, null, 2));
      
      // Test with minimal data to debug the issue
      const testData = {
        amount: 100,
        date: '2024-01-01',
        category: 'Salary',
        note: 'Test transaction',
        type: 'income'
      };
      console.log('Test data that should work (income - no budget update):', testData);
      
      // Save to API
      const savedTransaction = await transactionService.addTransaction(transactionForAPI);
      console.log('API response:', savedTransaction);
      
      // Update local state với functional update, ensure image data is preserved
      setTransactions(prevTransactions => {
        const transactionWithImage = {
          ...savedTransaction,
          // Preserve image data from original transaction if not returned by API
          imagePath: savedTransaction.receipt_image || savedTransaction.imagePath || newTransaction.imagePath,
          receipt_image: savedTransaction.receipt_image || newTransaction.imagePath
        };
        console.log('Adding transaction to state:', {
          id: transactionWithImage.id,
          hasImagePath: !!transactionWithImage.imagePath,
          hasReceiptImage: !!transactionWithImage.receipt_image
        });
        const newTransactions = [transactionWithImage, ...prevTransactions];
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
        amount: Math.abs(parseFloat(newTransaction.amount)),
        date: newTransaction.date || new Date().toISOString().split('T')[0],
        description: newTransaction.description || '',
        category: newTransaction.category || 'Uncategorized',
        type: newTransaction.type,
        imagePath: newTransaction.imagePath || null, // For TransactionItem compatibility
        receipt_image: newTransaction.imagePath || null, // For API compatibility
        receipt_data: newTransaction.ocrData ? JSON.stringify(newTransaction.ocrData) : null
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
            transactions={transactions}
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

