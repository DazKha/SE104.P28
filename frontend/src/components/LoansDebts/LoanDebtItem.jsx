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

  // Check if due date is approaching (within 7 days)
  const isDueSoon = () => {
    const dueDate = new Date(item.due_date);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0 && !isPaid;
  };

  // Check if overdue
  const isOverdue = () => {
    const dueDate = new Date(item.due_date);
    const today = new Date();
    return dueDate < today && !isPaid;
  };

  return (
    <div className={`${styles.card} ${isPaid ? styles.cardPaid : ''} ${isDueSoon() ? styles.cardDueSoon : ''} ${isOverdue() ? styles.cardOverdue : ''}`}>
      <div className={styles.cardContent}>
        {/* Left side - Main info */}
        <div className={styles.itemMainInfo}>
          <div className={styles.amountSection}>
            <div className={styles.amountWithIcon}>
              <span className={styles.currencyIcon}>
                {isDebt ? '💸' : '💰'}
              </span>
              <span className={isDebt ? styles.debtAmount : styles.loanAmount}>
                {formatCurrency(item.amount)}
              </span>
            </div>
            <span className={isDebt ? styles.debtBadge : styles.loanBadge}>
              {isDebt ? 'You Owe' : 'Owed to You'}
            </span>
          </div>
          
          <div className={styles.detailsSection}>
            <div className={styles.personInfo}>
              <div className={styles.personAvatar}>
                {item.person.charAt(0).toUpperCase()}
              </div>
              <div className={styles.personDetails}>
                <span className={styles.personName}>{item.person}</span>
                <span className={styles.personLabel}>
                  {isDebt ? 'Creditor' : 'Debtor'}
                </span>
              </div>
            </div>
            
            <div className={styles.dateInfo}>
              <div className={`${styles.dateContainer} ${isOverdue() ? styles.overdue : isDueSoon() ? styles.dueSoon : ''}`}>
                <span className={styles.dateIcon}>
                  {isOverdue() ? '⚠️' : isDueSoon() ? '⏰' : '📅'}
                </span>
                <div className={styles.dateDetails}>
                  <span className={styles.dueLabel}>Due Date</span>
                  <span className={styles.dueDate}>{formatDate(item.due_date)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Status and Actions */}
        <div className={styles.itemActions}>
          <div className={styles.statusSection}>
            <span className={`${styles.statusBadge} ${isPaid ? styles.statusPaid : isOverdue() ? styles.statusOverdue : isDueSoon() ? styles.statusDueSoon : styles.statusPending}`}>
              <span className={styles.statusIcon}>
                {isPaid ? '✅' : isOverdue() ? '❌' : isDueSoon() ? '⚡' : '⏳'}
              </span>
              <span className={styles.statusText}>
                {isPaid ? 'Paid' : isOverdue() ? 'Overdue' : isDueSoon() ? 'Due Soon' : 'Pending'}
              </span>
            </span>
          </div>
          
          <div className={styles.actionButtons}>
            {!isPaid && (
              <button 
                className={`${styles.markPaidBtn} ${isDebt ? styles.markPaidDebt : styles.markPaidLoan}`}
                onClick={() => onMarkPaid(item.id)}
                title="Mark as Paid"
              >
                <span className={styles.btnIcon}>✨</span>
                <span className={styles.btnText}>Mark Paid</span>
              </button>
            )}
            <div className={styles.secondaryActions}>
              <button 
                className={styles.editBtn}
                onClick={() => onEdit(item.id)}
                title="Edit"
              >
                <span className={styles.actionIcon}>✏️</span>
              </button>
              <button 
                className={styles.deleteBtn}
                onClick={() => onDelete(item.id)}
                title="Delete"
              >
                <span className={styles.actionIcon}>🗑️</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoanDebtItem; 