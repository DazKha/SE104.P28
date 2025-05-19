import React, {useState} from 'react';
import './BalanceCard.css';
import AddTransactionModal from './AddTransaction/AddTransactionModal.jsx';

const BalanceCard = ({ balance, onAddTransaction }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => 
    setIsModalOpen(true);
  const closeModal = () => 
    setIsModalOpen(false);

  const handleAddTransaction = (transaction) => {
    if (onAddTransaction) {
      onAddTransaction(transaction);
    }
    closeModal();
  };

   // Format balance to currency
  const formattedBalance = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(balance);

  return (
    <div className="balance-card">
      <div className="card-header">
        <h2>Current Balance</h2>
        <button className="add-btn" onClick={openModal}>+</button>
      </div>
      <div className="balance-amount">
        {formattedBalance}
      </div>

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onAddTransaction={handleAddTransaction}
      />
    </div>
  );
};

export default BalanceCard;