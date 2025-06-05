import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import transactionService from '../../services/transactionService';
import styles from './Budget.module.css';

function BudgetHistory({ budget, onClose }) {
  const { isLoggedIn } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!isLoggedIn || !budget) return;
      
      setLoading(true);
      try {
        // Lấy tất cả giao dịch trong tháng của budget
        const data = await transactionService.getByMonth(budget.month);
        setTransactions(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Cannot load transaction history. Please try again later.');
      }
      setLoading(false);
    };

    fetchTransactions();
  }, [isLoggedIn, budget]);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Food & Drinks': '🍽️',
      'Transportation': '🚗',
      'Housing': '🏠',
      'Bills': '📝',
      'Travel': '✈️',
      'Health': '💊',
      'Education': '📚',
      'Shopping': '🛍️',
      'Pets': '🐾',
      'Sports': '🏃',
      'Entertainment': '🎮',
      'Investment': '📈',
      'Family': '👨‍👩‍👧‍👦',
      'Undefined': '❓',
      'Salary': '💰',
      'Bonus': '🎁',
      'Business': '💼'
    };
    return icons[category] || '📌';
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Transaction History - {budget.month}</h2>
          <button onClick={onClose} className={styles.closeBtn}>✕</button>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading transaction history...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : transactions.length > 0 ? (
          <div className={styles.transactionList}>
            {transactions.map((transaction) => (
              <div key={transaction.id} className={styles.transactionItem}>
                <div className={styles.transactionIcon}>
                  {getCategoryIcon(transaction.category_name)}
                </div>
                <div className={styles.transactionInfo}>
                  <div className={styles.transactionHeader}>
                    <span className={styles.categoryName}>{transaction.category_name}</span>
                    <span className={styles.date}>{formatDate(transaction.date)}</span>
                  </div>
                  {transaction.note && (
                    <div className={styles.note}>{transaction.note}</div>
                  )}
                </div>
                <div className={`${styles.amount} ${transaction.type === 'outcome' ? styles.expense : styles.income}`}>
                  {transaction.type === 'outcome' ? '-' : '+'}
                  {formatCurrency(transaction.amount)}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>No transaction in this month.</p>
          </div>
        )}

        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span className={styles.label}>Total expense:</span>
            <span className={styles.expense}>{formatCurrency(budget.used)}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.label}>Budget:</span>
            <span className={styles.budget}>{formatCurrency(budget.amount)}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.label}>Remaining:</span>
            <span className={budget.amount - budget.used < 0 ? styles.overBudget : styles.remaining}>
              {formatCurrency(budget.amount - budget.used)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BudgetHistory;

