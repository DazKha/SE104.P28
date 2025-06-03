import React, {useState} from 'react';
import './BalanceCard.css';
import AddTransactionModal from './AddTransaction/AddTransactionModal.jsx';

const BalanceCard = ({ balance, onAddTransaction }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    console.log('Opening modal...');
    setIsModalOpen(true);
    console.log('Modal state after opening:', isModalOpen);
  };
  
  const closeModal = () => {
    console.log('Closing modal...');
    setIsModalOpen(false);
    console.log('Modal state after closing:', isModalOpen);
  };

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

  console.log('Current modal state:', isModalOpen);

  return (
    <div className="balance-card">
      <div className="card-header">
        <h2>Current Balance</h2>
        <button className="add-btn" onClick={openModal}>➕ Add Transactions</button> 
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