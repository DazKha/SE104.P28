import React from 'react';
import styles from './LoansDebts.module.css';

function LoanDebtItem({ item, onEdit, onDelete, onMarkPaid }) {
  const isDebt = item.type === 'debt';
  const isPaid = item.status === 'paid';

  const formatCurrency = (value) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`${styles.card} ${isPaid ? styles.cardPaid : ''}`}>
      <div className={styles.cardContent}>
        <div className={styles.itemInfo}>
          <div className={styles.amountRow}>
            <span className={isDebt ? styles.debtAmount : styles.loanAmount}>
              {formatCurrency(item.amount)}
            </span>
            <span className={isDebt ? styles.debtBadge : styles.loanBadge}>
              {isDebt ? '💸 You Owe' : '💰 Owed to You'}
            </span>
          </div>
          
          <div className={styles.personRow}>
            <span className={styles.icon}>👤</span>
            <span className={styles.personName}>{item.person}</span>
          </div>
          
          <div className={styles.dateRow}>
            <span className={styles.icon}>📅</span>
            <span className={styles.dueDate}>Due: {formatDate(item.due_date)}</span>
          </div>
        </div>

        <div className={styles.itemActions}>
          <span className={isPaid ? styles.statusPaid : styles.statusPending}>
            {isPaid ? '✅' : '⏳'} {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </span>
          
          <div className={styles.actionButtons}>
            {!isPaid && (
              <button 
                className={styles.markPaidBtn}
                onClick={() => onMarkPaid(item.id)}
                title="Mark as Paid"
              >
                🔄 Mark as Paid
              </button>
            )}
            <button 
              className={styles.editBtn}
              onClick={() => onEdit(item.id)}
              title="Edit"
            >
              ✏️
            </button>
            <button 
              className={styles.deleteBtn}
              onClick={() => onDelete(item.id)}
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoanDebtItem; 