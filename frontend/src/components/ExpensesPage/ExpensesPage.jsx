import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useDataReset } from '../../hooks/useDataReset.js';
import TransactionSection from './TransactionSection/index.jsx';
import ReportSection from './ReportSection/ReportSection';
import CurrentBalance from './CurrentBalance/CurrentBalance';
import transactionService from '../../services/transactionService';
import './ExpensesPage.css';

const ExpensesPage = () => {
  const { isLoggedIn } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debug log for re-renders
  console.log('ExpensesPage render - transactions count:', transactions.length, 'balance:', balance);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await transactionService.getAllTransactions();
      const transactionsArray = Array.isArray(data) ? data : [];
      setTransactions(transactionsArray);
      
      // Calculate balance from API data
      const totalBalance = transactionsArray.reduce((sum, transaction) => {
        return sum + (transaction.type === 'income' ? transaction.amount : -transaction.amount);
      }, 0);
      
      setBalance(totalBalance);
    } catch (err) {
      setError('Failed to fetch transactions');
      console.error('Error fetching transactions:', err);
      // Fallback to localStorage if API fails
      const savedTransactions = localStorage.getItem('transactions');
      if (savedTransactions) {
        const parsed = JSON.parse(savedTransactions);
        setTransactions(Array.isArray(parsed) ? parsed : []);
      } else {
        setTransactions([]);
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
      console.log('=== HANDLE ADD TRANSACTION START ===');
      console.log('Adding transaction in ExpensesPage:', newTransaction);
      console.log('Date received:', newTransaction.date, 'Type:', typeof newTransaction.date);
      console.log('Current transactions count:', transactions.length);
      
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
      console.log('=== EXPENSES PAGE - CHECKING DESCRIPTION/NOTE ===');
      console.log('newTransaction.description:', newTransaction.description);
      console.log('newTransaction.note:', newTransaction.note);
      
      const transactionForAPI = {
        amount: Math.abs(amount),
        date: formattedDate,
        category: newTransaction.category, 
        note: newTransaction.note || '', 
        type: newTransaction.type,
        receipt_image: newTransaction.receipt_image || null, // Use base64 image data from frontend
        receipt_data: newTransaction.ocrData ? JSON.stringify(newTransaction.ocrData) : null // OCR data as JSON string
      };
      
      console.log('=== EXPENSES PAGE - FINAL API DATA ===');
      console.log('transactionForAPI.note:', transactionForAPI.note);
      
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
          imagePath: savedTransaction.receipt_image || savedTransaction.imagePath || newTransaction.receipt_image,
          receipt_image: savedTransaction.receipt_image || newTransaction.receipt_image,
          // Ensure consistent field mapping
          description: savedTransaction.description || savedTransaction.note || newTransaction.description,
          category_name: savedTransaction.category || savedTransaction.category_name, // For display compatibility
        };
        console.log('Adding transaction to state:', {
          id: transactionWithImage.id,
          hasImagePath: !!transactionWithImage.imagePath,
          hasReceiptImage: !!transactionWithImage.receipt_image,
          category: transactionWithImage.category,
          description: transactionWithImage.description
        });
        const newTransactions = [transactionWithImage, ...prevTransactions];
        console.log('Updated transactions count:', newTransactions.length);
        return newTransactions;
      });
      
      // Update balance
      setBalance(prev => {
        const newBalance = prev + (savedTransaction.type === 'income' ? savedTransaction.amount : -savedTransaction.amount);
        console.log('Balance updated from', prev, 'to', newBalance, 'for transaction type:', savedTransaction.type, 'amount:', savedTransaction.amount);
        return newBalance;
      });
      
      setError(null);
      console.log('=== HANDLE ADD TRANSACTION SUCCESS ===');
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
        imagePath: newTransaction.receipt_image || null, // For TransactionItem compatibility
        receipt_image: newTransaction.receipt_image || null, // For API compatibility
        receipt_data: newTransaction.ocrData ? JSON.stringify(newTransaction.ocrData) : null
      };
      
      setTransactions(prev => [fallbackTransaction, ...prev]);
      setBalance(prev => prev + (fallbackTransaction.type === 'income' ? fallbackTransaction.amount : -fallbackTransaction.amount));
    }
  };

  // Handle updating transaction
  const handleUpdateTransaction = async (id, updatedData) => {
    try {
      console.log('=== HANDLE UPDATE TRANSACTION ===');
      console.log('Transaction ID:', id);
      console.log('Updated data from TransactionSection:', updatedData);
      
      // Store original transaction for balance calculation
      const originalTransaction = transactions.find(t => t.id == id); // Use == for loose comparison
      console.log('Original transaction:', originalTransaction);
      
      const updatedTransaction = await transactionService.updateTransaction(id, updatedData);
      console.log('Updated transaction response:', updatedTransaction);
      
      // Ensure the response has the right structure
      const formattedUpdatedTransaction = {
        id: updatedTransaction.id || parseInt(id), // Keep original ID format
        amount: updatedTransaction.amount,
        date: updatedTransaction.date,
        note: updatedTransaction.note,
        description: updatedTransaction.note, // For compatibility
        category: updatedTransaction.category_name || updatedTransaction.category,
        category_name: updatedTransaction.category_name,
        type: updatedTransaction.type,
        imagePath: updatedTransaction.imagePath || updatedTransaction.receipt_image,
        receipt_image: updatedTransaction.receipt_image,
        receipt_path: updatedTransaction.receipt_path
      };
      
      console.log('Formatted updated transaction:', formattedUpdatedTransaction);
      
      // Update local state
      setTransactions(prev => {
        const newTransactions = prev.map(transaction => 
          transaction.id == id ? formattedUpdatedTransaction : transaction // Use == for loose comparison
        );
        console.log('Updated transactions array:', newTransactions.length);
        return newTransactions;
      });
      
      // Recalculate balance properly
      if (originalTransaction) {
        const originalBalanceEffect = originalTransaction.type === 'income' 
          ? originalTransaction.amount 
          : -originalTransaction.amount;
        
        const newBalanceEffect = formattedUpdatedTransaction.type === 'income' 
          ? formattedUpdatedTransaction.amount 
          : -formattedUpdatedTransaction.amount;
        
        const balanceDifference = newBalanceEffect - originalBalanceEffect;
        
        console.log('Balance calculation:', {
          originalAmount: originalTransaction.amount,
          originalType: originalTransaction.type,
          originalEffect: originalBalanceEffect,
          newAmount: formattedUpdatedTransaction.amount,
          newType: formattedUpdatedTransaction.type,
          newEffect: newBalanceEffect,
          difference: balanceDifference
        });
        
        setBalance(prev => {
          const newBalance = prev + balanceDifference;
          console.log('Balance updated from', prev, 'to', newBalance);
          return newBalance;
        });
      }
      
      setError(null);
      console.log('Transaction update completed successfully');
      
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
    <div className="expenses-page">
      <div className="expenses-container">
        <div className="section-wrapper">
          <CurrentBalance />
        </div>
        <div className="section-wrapper">
          <TransactionSection 
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        </div>
        <div className="section-wrapper">
          <ReportSection transactions={transactions} />
        </div>
      </div>
    </div>
  );
};

export default ExpensesPage;

