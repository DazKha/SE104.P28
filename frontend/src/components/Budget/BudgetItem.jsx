import React, { useState } from 'react';
import styles from './Budget.module.css';
import BudgetHistory from './BudgetHistory';

function BudgetItem({ budget, onEdit, onDelete }) {
  const [showHistory, setShowHistory] = useState(false);
  const spentPercentage = budget.amount > 0 ? (budget.used / budget.amount) * 100 : 0;
  const remaining = budget.amount - budget.used;
  const isOverBudget = remaining < 0;

  const formatCurrency = (value) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);

  const formatMonth = (monthString) => {
    // Convert "2024-07" to "Tháng 7/2024"
    const [year, month] = monthString.split('-');
    return `Month ${parseInt(month)}/${year}`;
  };

  return (
    <>
      <div 
        className={`${styles.card} ${isOverBudget ? styles.cardOverBudget : ''}`}
        onClick={() => setShowHistory(true)}
        style={{ cursor: 'pointer' }}
      >
        <div className={styles.cardContent}>
          <div className={styles.budgetHeader}>
            <h3 className={styles.monthTitle}>{formatMonth(budget.month)}</h3>
            <div className={styles.actions}>
              <button 
                className={styles.viewBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHistory(true);
                }}
                title="View details"
              >
                👁️
              </button>
              <button 
                className={styles.editBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(budget.id);
                }}
                title="Edit"
              >
                ✏️
              </button>
              <button 
                className={styles.deleteBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(budget.id);
                }}
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </div>

          <div className={styles.budgetInfo}>
            <div className={styles.spentRow}>
              <span className={styles.label}>Spent:</span>
              <span className={isOverBudget ? styles.overBudgetText : styles.normalText}>
                {formatCurrency(budget.used)} / {formatCurrency(budget.amount)}
              </span>
            </div>
            
            <div className={styles.progressBar}>
              <div
                className={isOverBudget ? `${styles.progress} ${styles.progressOver}` : styles.progress}
                style={{ width: `${Math.min(spentPercentage, 100)}%` }}
              />
            </div>
            
            <div className={styles.progressInfo}>
              <span className={styles.percentage}>{spentPercentage.toFixed(0)}% Used</span>
              <span className={isOverBudget ? styles.overBudgetText : styles.remainingText}>
                {isOverBudget
                  ? `Over ${formatCurrency(Math.abs(remaining))}`
                  : `Remaining ${formatCurrency(remaining)}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {showHistory && (
        <BudgetHistory 
          budget={budget} 
          onClose={() => setShowHistory(false)} 
        />
      )}
    </>
  );
}

export default BudgetItem; 