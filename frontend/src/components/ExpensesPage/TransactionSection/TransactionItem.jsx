import React, { useState } from 'react';
import { ArrowDownIcon, ArrowUpIcon, XIcon, ImageIcon, EditIcon } from 'lucide-react';
import './TransactionItem.css';

const TransactionItem = ({ transaction, onDelete, onEdit }) => {
  const [showImageModal, setShowImageModal] = useState(false);

  // Định dạng số tiền
  const formatAmount = (amount) => {
    const absAmount = Math.abs(amount);
    return new Intl.NumberFormat('vi-VN').format(absAmount);
  };

  // Xử lý xóa giao dịch
  const handleDelete = (e) => {
    e.stopPropagation(); // Prevent triggering transaction click
    if (onDelete && typeof onDelete === 'function') {
      onDelete(transaction.id);
    }
  };

  // Xử lý edit giao dịch
  const handleEdit = (e) => {
    e.stopPropagation(); // Prevent triggering transaction click
    if (onEdit && typeof onEdit === 'function') {
      onEdit(transaction);
    } else {
      console.error('onEdit is not a function:', onEdit);
    }
  };

  // Xử lý click vào transaction
  const handleTransactionClick = () => {
    if (hasImage) {
      setShowImageModal(true);
    }
  };

  // Kiểm tra xem giao dịch là thu nhập hay chi tiêu
  const isIncome = transaction.type === 'income';
  
  // Get description and category with fallbacks for API data
  const description = transaction.note || transaction.description || 'Transaction';
  const category = transaction.category_name || transaction.category || 'Undefined';
  
  // Check if transaction has image (support multiple formats)
  const hasImage = transaction.imagePath || transaction.receipt_path || transaction.receipt_image;

  return (
    <>
      <div 
        className={`transaction-item ${isIncome ? 'income' : 'expense'} ${hasImage ? 'has-receipt' : ''}`}
        onClick={handleTransactionClick}
        style={{ cursor: hasImage ? 'pointer' : 'default' }}
      >
        <div className="transaction-content">
        <div className="transaction-info">
          <div className={`transaction-icon ${isIncome ? 'income' : 'expense'}`}>
            {isIncome ? <ArrowUpIcon size={20} /> : <ArrowDownIcon size={20} />}
          </div>
          <div className="transaction-details">
            <div className="transaction-date">{transaction.date}</div>
            <div className="transaction-description">{description}</div>
            {hasImage && (
              <div className="transaction-image-indicator">
                <ImageIcon size={14} />
                <span>Receipt attached - Click to view</span>
              </div>
            )}
          </div>
        </div>

        <div className="transaction-actions">
          <div className="transaction-category">
            <span className="category-tag">{category}</span>
            <div className="action-buttons">
              <button 
                onClick={handleEdit} 
                className="edit-button"
                title="Edit transaction"
              >
                <EditIcon size={16} />
              </button>
              <button 
                onClick={handleDelete} 
                className="delete-button"
                title="Delete transaction"
              >
                <XIcon size={16} />
              </button>
            </div>
          </div>
          <div className={`transaction-amount ${isIncome ? 'income' : 'expense'}`}>
            {isIncome ? '+' : '-'}{formatAmount(transaction.amount)} đ
          </div>
        </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {hasImage && showImageModal && (
        <div className="receipt-modal-overlay" onClick={() => setShowImageModal(false)}>
          <div className="receipt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="receipt-modal-header">
              <h4>Receipt - {description}</h4>
              <button 
                onClick={() => setShowImageModal(false)}
                className="close-modal-btn"
              >
                ×
              </button>
            </div>
            <div className="receipt-modal-content">
              <img 
                src={
                  transaction.receipt_image || // Base64 data URL
                  transaction.imagePath || // Legacy format
                  `http://localhost:3000/${transaction.receipt_path}` // File path format
                } 
                alt="Receipt" 
                className="modal-receipt-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div className="image-error" style={{ display: 'none' }}>
                Receipt image not available
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TransactionItem;