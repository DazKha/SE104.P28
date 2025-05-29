import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useDataReset } from '../../hooks/useDataReset.js';
import CurrencyInput from '../common/CurrencyInput.jsx';
import savingService from '../../services/savingService';
import styles from './SavingWallet.module.css';

function SavingWallet() {
  const { isLoggedIn } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    goal_name: '',
    icon: '💰',
    target_amount: '',
    current_amount: '0',
    target_date: '',
    monthly_goal: '',
    priority: 'medium',
    description: ''
  });

  const fetchGoals = useCallback(async () => {
    if (!isLoggedIn) return;
    
    setLoading(true);
    try {
      const data = await savingService.getAll();
      setGoals(data);
    } catch (err) {
      console.error('Error fetching savings:', err);
      // Mock data for demo
      setGoals([
        {
          id: 1,
          goal_name: 'New Laptop',
          target_amount: 37500000,
          current_amount: 21250000,
          completion_percentage: 57
        },
        {
          id: 2,
          goal_name: 'Vacation Fund',
          target_amount: 75000000,
          current_amount: 30000000,
          completion_percentage: 40
        }
      ]);
    }
    setLoading(false);
  }, [isLoggedIn]);

  const resetData = useCallback(() => {
    setGoals([]);
    setShowAddForm(false);
    setEditingGoal(null);
    setFormData({
      goal_name: '',
      icon: '💰',
      target_amount: '',
      current_amount: '0',
      target_date: '',
      monthly_goal: '',
      priority: 'medium',
      description: ''
    });
    fetchGoals();
  }, [fetchGoals]);

  useDataReset(resetData);

  useEffect(() => {
    if (isLoggedIn) {
      fetchGoals();
    }
  }, [isLoggedIn, fetchGoals]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleIconSelect = (icon) => {
    setFormData(prev => ({
      ...prev,
      icon
    }));
  };

  const handlePrioritySelect = (priority) => {
    setFormData(prev => ({
      ...prev,
      priority
    }));
  };

  const handleAddGoal = async () => {
    if (!formData.goal_name || !formData.target_amount) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      await savingService.create({
        ...formData,
        target_amount: parseFloat(formData.target_amount),
        current_amount: parseFloat(formData.current_amount),
        monthly_goal: parseFloat(formData.monthly_goal) || 0
      });
      setShowAddForm(false);
      setFormData({
        goal_name: '',
        icon: '💰',
        target_amount: '',
        current_amount: '0',
        target_date: '',
        monthly_goal: '',
        priority: 'medium',
        description: ''
      });
      fetchGoals();
    } catch (err) {
      console.error('Error adding goal:', err);
      alert('Error adding goal. Please try again.');
    }
  };

  const handleEditGoal = async () => {
    if (!formData.current_amount) {
      alert('Please enter current amount');
      return;
    }
    
    try {
      await savingService.update(editingGoal, {
        ...formData,
        current_amount: parseFloat(formData.current_amount)
      });
      setEditingGoal(null);
      setFormData({
        goal_name: '',
        icon: '💰',
        target_amount: '',
        current_amount: '0',
        target_date: '',
        monthly_goal: '',
        priority: 'medium',
        description: ''
      });
      fetchGoals();
    } catch (err) {
      console.error('Error updating goal:', err);
      alert('Error updating goal. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this saving goal?')) return;
    
    try {
      await savingService.delete(id);
      fetchGoals();
    } catch (err) {
      console.error('Error deleting goal:', err);
      alert('Error deleting goal. Please try again.');
    }
  };

  const openEditForm = (goalId) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      setEditingGoal(goalId);
      setFormData({
        goal_name: goal.goal_name,
        icon: goal.icon || '💰',
        target_amount: goal.target_amount.toString(),
        current_amount: goal.current_amount.toString(),
        target_date: goal.target_date || '',
        monthly_goal: goal.monthly_goal?.toString() || '',
        priority: goal.priority || 'medium',
        description: goal.description || ''
      });
    }
  };

  const closeForm = () => {
    setShowAddForm(false);
    setEditingGoal(null);
    setFormData({
      goal_name: '',
      icon: '💰',
      target_amount: '',
      current_amount: '0',
      target_date: '',
      monthly_goal: '',
      priority: 'medium',
      description: ''
    });
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Savings Goals</h1>
        <button 
          className={styles.addBtn}
          onClick={() => setShowAddForm(true)}
        >
          ➕ Add Saving Goal
        </button>
      </div>

      {(showAddForm || editingGoal) && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>{editingGoal ? 'Cập nhật mục tiêu' : 'Tạo mục tiêu tiết kiệm mới'}</h2>
            
            {!editingGoal && (
              <div className="form-container">
                {/* Goal name */}
                <div className="form-group">
                  <label className="form-label">Tên mục tiêu</label>
                  <input 
                    type="text" 
                    name="goal_name"
                    className="form-input" 
                    placeholder="Ví dụ: Mua xe, Du lịch, ..." 
                    value={formData.goal_name}
                    onChange={handleInputChange}
                    required 
                  />
                </div>

                {/* Target amount */}
                <div className="form-group">
                  <label className="form-label">Số tiền mục tiêu *</label>
                  <div className="currency-input">
                    <input 
                      type="number" 
                      name="target_amount"
                      className="form-input" 
                      id="targetAmount" 
                      placeholder="500000000" 
                      value={formData.target_amount}
                      onChange={handleInputChange}
                      required 
                    />
                    <span className="currency-symbol">VNĐ</span>
                  </div>
                </div>

                {/* Current money */}
                <div className="form-group">
                  <label className="form-label">Số tiền hiện tại</label>
                  <div className="currency-input">
                    <input 
                      type="number" 
                      name="current_amount"
                      className="form-input" 
                      id="currentAmount" 
                      placeholder="0" 
                      value={formData.current_amount}
                      onChange={handleInputChange}
                    />
                    <span className="currency-symbol">VNĐ</span>
                  </div>
                </div>

                {/* Target Date */}
                <div className="form-group">
                  <label className="form-label">Ngày dự kiến hoàn thành</label>
                  <input 
                    type="date" 
                    name="target_date"
                    className="form-input date-input" 
                    id="targetDate"
                    value={formData.target_date}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Monthly Saving Goal */}
                <div className="form-group">
                  <label className="form-label">Mục tiêu tiết kiệm hàng tháng</label>
                  <div className="currency-input">
                    <input 
                      type="number" 
                      name="monthly_goal"
                      className="form-input" 
                      id="monthlyGoal" 
                      placeholder="5000000"
                      value={formData.monthly_goal}
                      onChange={handleInputChange}
                    />
                    <span className="currency-symbol">VNĐ</span>
                  </div>
                  <div className="calculation-preview" id="calculationPreview" style={{ display: 'none' }}>
                    <div className="calculation-title">Dự kiến hoàn thành:</div>
                    <div className="calculation-value" id="completionEstimate"></div>
                  </div>
                </div>

                {/* Priority Level */}
                <div className="form-group">
                  <label className="form-label">Mức độ ưu tiên</label>
                  <div className="priority-levels">
                    {[
                      { value: 'low', label: 'Thấp', icon: '🟢', desc: 'Không vội' },
                      { value: 'medium', label: 'Trung bình', icon: '🟡', desc: 'Bình thường' },
                      { value: 'high', label: 'Cao', icon: '🔴', desc: 'Khẩn cấp' }
                    ].map(({ value, label, icon, desc }) => (
                      <div 
                        key={value}
                        className={`priority-option priority-${value} ${formData.priority === value ? 'selected' : ''}`}
                        onClick={() => handlePrioritySelect(value)}
                      >
                        <div>{icon} {label}</div>
                        <small>{desc}</small>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="form-group">
                  <label className="form-label">Mô tả (tùy chọn)</label>
                  <textarea 
                    className="form-input" 
                    name="description"
                    rows="3" 
                    placeholder="Mô tả chi tiết về mục tiêu của bạn..."
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}
            
            {editingGoal && (
              <CurrencyInput
                placeholder="Current amount"
                value={formData.current_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, current_amount: e.target.value }))}
              />
            )}
            
            <div className={styles.modalActions}>
              <button 
                onClick={editingGoal ? handleEditGoal : handleAddGoal}
                className={styles.saveBtn}
              >
                {editingGoal ? 'Update' : 'Save'}
              </button>
              <button onClick={closeForm} className={styles.cancelBtn}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.goalsSection}>
        <div className={styles.sectionHeader}>
          <h2>Your Goals</h2>
        </div>
        
        <div className={styles.goalsGrid}>
          {loading ? (
            <div className={styles.loading}>Loading your savings goals...</div>
          ) : goals.length > 0 ? (
            goals.map((goal) => {
              const progressPercentage = goal.completion_percentage || 
                (goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0);
              const remaining = Math.max(0, goal.target_amount - goal.current_amount);
              const isComplete = progressPercentage >= 100;

              return (
                <div key={goal.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div>
                      <h3>{goal.goal_name}</h3>
                      <div className={styles.target}>
                        🎯 Target: {formatCurrency(goal.target_amount)}
                      </div>
                    </div>
                    <div className={styles.actions}>
                      <button onClick={() => openEditForm(goal.id)} title="Edit">
                        ✏️
                      </button>
                      <button onClick={() => handleDelete(goal.id)} title="Delete">
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <div className={styles.cardContent}>
                    <div className={styles.amountSection}>
                      <div className={styles.amount}>
                        🐷 {formatCurrency(goal.current_amount)}
                      </div>
                      
                      <div className={styles.progressBar}>
                        <div
                          className={isComplete ? `${styles.progress} ${styles.complete}` : styles.progress}
                          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                        />
                      </div>
                      
                      <div className={styles.progressInfo}>
                        <span className={styles.percent}>{progressPercentage.toFixed(0)}% Complete</span>
                        {!isComplete && (
                          <span className={styles.left}>{formatCurrency(remaining)} Left</span>
                        )}
                        {isComplete && (
                          <span className={styles.achieved}>Goal Achieved! 🎉</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className={styles.emptyState}>
              <p>No savings goals set yet.</p>
              <p>Click 'Add Saving Goal' to create your first one!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SavingWallet; 