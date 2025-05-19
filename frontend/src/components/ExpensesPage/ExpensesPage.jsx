import React, { useState, useEffect } from 'react';
import TransactionSection from './TransactionSection/index.jsx';
import ReportSection from './ReportSection/ReportSection';
import CurrentBalance from './CurrentBalance/CurrentBalance';

const ExpensesPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);

  // Load transactions from localStorage
  useEffect(() => {
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
      const parsedTransactions = JSON.parse(savedTransactions);
      setTransactions(parsedTransactions);
      // Calculate initial balance
      const totalBalance = parsedTransactions.reduce((sum, transaction) => sum + transaction.amount, 0);
      setBalance(totalBalance);
    }
  }, []);

  // Handle adding new transaction
  const handleAddTransaction = (newTransaction) => {
    const updatedTransactions = [...transactions, newTransaction];
    setTransactions(updatedTransactions);
    setBalance(balance + newTransaction.amount);
    // Save to localStorage
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
  };

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
            onTransactionUpdate={setTransactions}
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

