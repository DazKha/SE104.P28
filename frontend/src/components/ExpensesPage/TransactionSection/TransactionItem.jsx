import React from 'react';
import { ArrowDownIcon, ArrowUpIcon, XIcon } from 'lucide-react';
import './TransactionItem.css';

const TransactionItem = ({ transaction, onDelete }) => {
  // Định dạng số tiền
  const formatAmount = (amount) => {
    const absAmount = Math.abs(amount);
    return new Intl.NumberFormat('vi-VN').format(absAmount);
  };

  // Xử lý xóa giao dịch
  const handleDelete = () => {
    onDelete(transaction.id);
  };

  // Kiểm tra xem giao dịch là thu nhập hay chi tiêu
  const isIncome = transaction.amount > 0;

  return (
    <div className={`transaction-item ${isIncome ? 'income' : 'expense'}`}>
      <div className="transaction-content">
        <div className="transaction-info">
          <div className={`transaction-icon ${isIncome ? 'income' : 'expense'}`}>
            {isIncome ? <ArrowUpIcon size={20} /> : <ArrowDownIcon size={20} />}
          </div>
          <div className="transaction-details">
            <div className="transaction-date">{transaction.date}</div>
            <div className="transaction-description">{transaction.description}</div>
          </div>
        </div>

        <div className="transaction-actions">
          <div className="transaction-category">
            <span className="category-tag">{transaction.category}</span>
            <button 
              onClick={handleDelete} 
              className="delete-button"
              title="Xóa giao dịch"
            >
              <XIcon size={16} />
            </button>
          </div>
          <div className={`transaction-amount ${isIncome ? 'income' : 'expense'}`}>
            {isIncome ? '+' : '-'}{formatAmount(transaction.amount)} đ
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionItem;