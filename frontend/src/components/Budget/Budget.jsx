import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useDataReset } from '../../hooks/useDataReset.js';
import CurrencyInput from '../common/CurrencyInput.jsx';
import budgetService from '../../services/budgetService';
import BudgetItem from './BudgetItem';
import styles from './Budget.module.css';

function Budget() {
  const { isLoggedIn, authKey } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    month: '',
    amount: ''
  });

  const fetchBudgets = useCallback(async () => {
    if (!isLoggedIn) return;
    
    setLoading(true);
    try {
      const data = await budgetService.getAll();
      setBudgets(data);
    } catch (err) {
      console.error('Error fetching budgets:', err);
      // Fallback với mock data nếu lỗi
      setBudgets([
        {
          id: 1,
          month: '2024-07',
          amount: 62500000, // 2500 USD = 62.5 triệu VNĐ
          used: 46250000,   // 1850 USD = 46.25 triệu VNĐ
        },
        {
          id: 2,
          month: '2024-06',
          amount: 60000000, // 2400 USD = 60 triệu VNĐ
          used: 61250000,   // 2450 USD = 61.25 triệu VNĐ (over budget)
        }
      ]);
    }
    setLoading(false);
  }, [isLoggedIn]);

  // Reset data chỉ khi user thay đổi hoặc lần đầu đăng nhập
  const resetData = useCallback(() => {
    setBudgets([]);
    setShowAddForm(false);
    setEditingBudget(null);
    setFormData({ month: '', amount: '' });
    fetchBudgets();
  }, [fetchBudgets]);

  useDataReset(resetData);

  // Fetch data khi component mount, login status hoặc authKey thay đổi
  useEffect(() => {
    if (isLoggedIn) {
      fetchBudgets();
    }
  }, [isLoggedIn, fetchBudgets, authKey]);

  const handleAddBudget = async () => {
    if (!formData.month || !formData.amount) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }
    
    try {
      await budgetService.create({
        month: formData.month,
        amount: parseFloat(formData.amount)
      });
      setShowAddForm(false);
      setFormData({ month: '', amount: '' });
      fetchBudgets();
    } catch (err) {
      console.error('Error adding budget:', err);
      alert('Lỗi khi thêm ngân sách. Vui lòng thử lại.');
    }
  };

  const handleEditBudget = async () => {
    if (!formData.amount) {
      alert('Vui lòng nhập số tiền ngân sách');
      return;
    }
    
    try {
      await budgetService.update(editingBudget, {
        amount: parseFloat(formData.amount)
      });
      setEditingBudget(null);
      setFormData({ month: '', amount: '' });
      fetchBudgets();
    } catch (err) {
      console.error('Error updating budget:', err);
      alert('Lỗi khi cập nhật ngân sách. Vui lòng thử lại.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa ngân sách này?')) return;
    
    try {
      await budgetService.delete(id);
      fetchBudgets();
    } catch (err) {
      console.error('Error deleting budget:', err);
      alert('Lỗi khi xóa ngân sách. Vui lòng thử lại.');
    }
  };

  const openEditForm = (budgetId) => {
    const budget = budgets.find(b => b.id === budgetId);
    if (budget) {
      setEditingBudget(budgetId);
      setFormData({
        month: budget.month,
        amount: budget.amount.toString()
      });
    }
  };

  const closeForm = () => {
    setShowAddForm(false);
    setEditingBudget(null);
    setFormData({ month: '', amount: '' });
  };

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Ngân sách</h1>
        <button 
          className={styles.addBtn}
          onClick={() => setShowAddForm(true)}
        >
          ➕ Thêm ngân sách
        </button>
      </div>

      {(showAddForm || editingBudget) && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>{editingBudget ? 'Chỉnh sửa ngân sách' : 'Thêm ngân sách mới'}</h3>
            
            {!editingBudget && (
              <input
                type="month"
                placeholder="Chọn tháng"
                value={formData.month}
                min={getCurrentMonth()}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
              />
            )}
            
            <CurrencyInput
              placeholder="Số tiền ngân sách (VD: 50.000.000 cho 50 triệu VNĐ)"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
            
            <div className={styles.modalActions}>
              <button 
                onClick={editingBudget ? handleEditBudget : handleAddBudget}
                className={styles.saveBtn}
              >
                {editingBudget ? 'Cập nhật' : 'Lưu'}
              </button>
              <button onClick={closeForm} className={styles.cancelBtn}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.budgetSection}>
        <div className={styles.sectionHeader}>
          <h2>Ngân sách hàng tháng</h2>
        </div>
        
        <div className={styles.budgetsList}>
          {loading ? (
            <div className={styles.loading}>Đang tải ngân sách...</div>
          ) : budgets.length > 0 ? (
            budgets.map((budget) => (
              <BudgetItem
                key={budget.id}
                budget={budget}
                onEdit={openEditForm}
                onDelete={handleDelete}
              />
            ))
          ) : (
            <div className={styles.emptyState}>
              <p>Chưa có ngân sách nào được thiết lập.</p>
              <p>Nhấn 'Thêm ngân sách' để bắt đầu!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Budget; 