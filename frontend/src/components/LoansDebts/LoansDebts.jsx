import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useDataReset } from '../../hooks/useDataReset.js';
import CurrencyInput from '../common/CurrencyInput.jsx';
import loanService from '../../services/loanService';
import LoanDebtItem from './LoanDebtItem';
import styles from './LoansDebts.module.css';

function LoansDebts() {
  const { isLoggedIn } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    person: '',
    due_date: '',
    type: 'debt'
  });

  const fetchItems = useCallback(async () => {
    if (!isLoggedIn) return;
    
    setLoading(true);
    try {
      const data = await loanService.getAll();
      setItems(data);
    } catch (err) {
      console.error('Error fetching loans/debts:', err);
      // Fallback với mock data nếu lỗi
      setItems([
        {
          id: 1,
          amount: 12500000,
          person: 'John Doe',
          due_date: '2024-08-15',
          type: 'debt',
          status: 'pending',
        },
        {
          id: 2,
          amount: 50000000,
          person: 'Jane Smith',
          due_date: '2024-09-01',
          type: 'loan',
          status: 'pending',
        }
      ]);
    }
    setLoading(false);
  }, [isLoggedIn]);

  // Reset data chỉ khi user thay đổi hoặc lần đầu đăng nhập
  const resetData = useCallback(() => {
    setItems([]);
    setShowAddForm(false);
    setEditingItem(null);
    setFormData({ amount: '', person: '', due_date: '', type: 'debt' });
    fetchItems();
  }, [fetchItems]);

  useDataReset(resetData);

  // Fetch data khi component mount hoặc login status thay đổi
  useEffect(() => {
    if (isLoggedIn) {
      fetchItems();
    }
  }, [isLoggedIn, fetchItems]);

  const handleAddItem = async () => {
    if (!formData.amount || !formData.person || !formData.due_date) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      await loanService.create({
        amount: parseFloat(formData.amount),
        person: formData.person,
        due_date: formData.due_date,
        type: formData.type
      });
      setShowAddForm(false);
      setFormData({ amount: '', person: '', due_date: '', type: 'debt' });
      fetchItems();
    } catch (err) {
      console.error('Error adding loan/debt:', err);
      alert('Error adding loan/debt. Please try again.');
    }
  };

  const handleEditItem = async () => {
    if (!formData.amount || !formData.person || !formData.due_date) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      const currentItem = items.find(i => i.id === editingItem);
      await loanService.update(editingItem, {
        amount: parseFloat(formData.amount),
        person: formData.person,
        due_date: formData.due_date,
        type: formData.type,
        status: currentItem?.status || 'pending'
      });
      setEditingItem(null);
      setFormData({ amount: '', person: '', due_date: '', type: 'debt' });
      fetchItems();
    } catch (err) {
      console.error('Error updating loan/debt:', err);
      alert('Error updating loan/debt. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this loan/debt?')) return;
    
    try {
      await loanService.delete(id);
      fetchItems();
    } catch (err) {
      console.error('Error deleting loan/debt:', err);
      alert('Error deleting loan/debt. Please try again.');
    }
  };

  const handleMarkPaid = async (id) => {
    if (!window.confirm('Congratulation. You did it !!!')) return;
    try {
      await loanService.updateStatus(id, 'paid');
      fetchItems();
    } catch (err) {
      console.error('Error marking as paid:', err);
      alert('Error marking as paid. Please try again.');
    }
  };



  const openEditForm = (itemId) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      setEditingItem(itemId);
      setFormData({
        amount: item.amount.toString(),
        person: item.person,
        due_date: item.due_date,
        type: item.type
      });
    }
  };

  const closeForm = () => {
    setShowAddForm(false);
    setEditingItem(null);
    setFormData({ amount: '', person: '', due_date: '', type: 'debt' });
  };

  const formatDateForInput = (dateString) => {
    return new Date(dateString).toISOString().split('T')[0];
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Loans & Debts</h1>
        <button 
          className={styles.addBtn}
          onClick={() => setShowAddForm(true)}
        >
          ➕ Add Loan/Debt
        </button>
      </div>

      {(showAddForm || editingItem) && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>{editingItem ? 'Edit Loan/Debt' : 'Add New Loan/Debt'}</h3>
            
            <CurrencyInput
              placeholder="Amount (e.g., 5.000.000 VND)"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
            
            <input
              type="text"
              placeholder="Person/Company name"
              value={formData.person}
              onChange={(e) => setFormData({ ...formData, person: e.target.value })}
            />
            
            <input
              type="date"
              placeholder="Due date"
              value={editingItem ? formatDateForInput(formData.due_date) : formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
            
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="debt">💸 Debt (I owe someone)</option>
              <option value="loan">💰 Loan (Someone owes me)</option>
            </select>
            
            <div className={styles.modalActions}>
              <button 
                onClick={editingItem ? handleEditItem : handleAddItem}
                className={styles.saveBtn}
              >
                {editingItem ? 'Update' : 'Save'}
              </button>
              <button onClick={closeForm} className={styles.cancelBtn}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.loansSection}>
        <div className={styles.sectionHeader}>
          <h2>Track Your Loans & Debts</h2>
        </div>
        
        <div className={styles.itemsList}>
          {loading ? (
            <div className={styles.loading}>Loading your loans & debts...</div>
          ) : items.length > 0 ? (
            items.map((item) => (
              <LoanDebtItem
                key={item.id}
                item={item}
                onEdit={openEditForm}
                onDelete={handleDelete}
                onMarkPaid={handleMarkPaid}
              />
            ))
          ) : (
            <div className={styles.emptyState}>
              <p>No loans or debts recorded yet.</p>
              <p>Click 'Add Loan/Debt' to start tracking!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoansDebts; 