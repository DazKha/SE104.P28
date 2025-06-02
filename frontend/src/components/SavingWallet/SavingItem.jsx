import React from 'react';
import styles from './SavingWallet.css';

function SavingItem({ saving, onEdit, onDelete }) {
  const progressPercentage = saving.target_amount > 0 
    ? (saving.current_amount / saving.target_amount) * 100 
    : 0;
  const remaining = Math.max(0, saving.target_amount - saving.current_amount);
  const isComplete = progressPercentage >= 100;

  const formatCurrency = (value) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div>
          <h3>{saving.goal_name}</h3>
          <div className={styles.target}>
            🎯 Target: {formatCurrency(saving.target_amount)}
          </div>
        </div>
        <div className={styles.actions}>
          <button onClick={() => onEdit(saving.id)} title="Edit">
            ✏️
          </button>
          <button onClick={() => onDelete(saving.id)} title="Delete">
            🗑️
          </button>
        </div>
      </div>
      
      <div className={styles.cardContent}>
        <div className={styles.amountSection}>
          <div className={styles.amount}>
            🐷 {formatCurrency(saving.current_amount)}
          </div>
          
          <div className={styles.progressBar}>
            <div
              className={isComplete ? `${styles.progress} ${styles.complete}` : styles.progress}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          
          <div className={styles.progressInfo}>
            <span className={styles.percent}>{progressPercentage.toFixed(0)}% Complete</span>
            {!isComplete && <span className={styles.left}>{formatCurrency(remaining)} Left</span>}
            {isComplete && <span className={styles.achieved}>Goal Achieved! 🎉</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SavingItem; 