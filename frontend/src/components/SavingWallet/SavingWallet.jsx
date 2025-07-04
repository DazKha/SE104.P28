import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useDataReset } from '../../hooks/useDataReset.js';
import savingService from '../../services/savingService';
import './SavingWallet.css';

function SavingWallet() {
  const { isLoggedIn } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({ goal_name: '', target_amount: '', current_amount: '' });

  const fetchGoals = useCallback(async () => {
    if (!isLoggedIn) return;
    
    setLoading(true);
    try {
      const data = await savingService.getAll();
      setGoals(data);
    } catch (err) {
      console.error('Error fetching savings:', err);
      // Nếu lỗi, hiển thị mock data để demo
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

  // Reset data chỉ khi user thay đổi hoặc lần đầu đăng nhập
  const resetData = useCallback(() => {
    setGoals([]);
    setShowAddForm(false);
    setEditingGoal(null);
    setFormData({ goal_name: '', target_amount: '', current_amount: '' });
    fetchGoals();
  }, [fetchGoals]);

  useDataReset(resetData);

  // Fetch data khi component mount hoặc login status thay đổi
  useEffect(() => {
    if (isLoggedIn) {
      fetchGoals();
    }
  }, [isLoggedIn, fetchGoals]);

  const formatNumberWithDot = (value) => {
    if (!value) return '';
    // Loại bỏ mọi ký tự không phải số
    let number = value.replace(/\D/g, '');
    // Format lại với dấu chấm
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleAddGoal = async () => {
    if (!formData.goal_name || !formData.target_amount) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      await savingService.create({
        goal_name: formData.goal_name,
        target_amount: parseFloat(formData.target_amount.replace(/\./g, ''))
      });
      setShowAddForm(false);
      setFormData({ goal_name: '', target_amount: '', current_amount: '' });
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
        current_amount: parseFloat(formData.current_amount.replace(/\./g, ''))
      });
      setEditingGoal(null);
      setFormData({ goal_name: '', target_amount: '', current_amount: '' });
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
        target_amount: goal.target_amount.toString(),
        current_amount: goal.current_amount.toString()
      });
    }
  };

  const closeForm = () => {
    setShowAddForm(false);
    setEditingGoal(null);
    setFormData({ goal_name: '', target_amount: '', current_amount: '' });
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">Savings Goals</h1>
        <button 
          className="add-btn"
          onClick={() => setShowAddForm(true)}
        >
          ➕ Add Saving Goal
        </button>
      </div>

      {(showAddForm || editingGoal) && (
        <div className="modal">
          <div className="modalContent">
            <h3>{editingGoal ? 'Update Saving Goal' : 'Add New Saving Goal'}</h3>
            
            {!editingGoal && (
              <>
                <input
                  type="text"
                  placeholder="Goal name (e.g., New Laptop)"
                  value={formData.goal_name}
                  onChange={(e) => setFormData({ ...formData, goal_name: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Target amount (e.g., 50.000.000)"
                  value={formData.target_amount}
                  onChange={(e) => {
                    // Không cho nhập số âm, chỉ nhận số và format
                    const formatted = formatNumberWithDot(e.target.value);
                    setFormData({ ...formData, target_amount: formatted });
                  }}
                  inputMode="numeric"
                  pattern="[0-9.]*"
                />
              </>
            )}
            
            {editingGoal && (
              <input
                type="text"
                placeholder="Current amount"
                value={formData.current_amount}
                onChange={(e) => {
                  const formatted = formatNumberWithDot(e.target.value);
                  setFormData({ ...formData, current_amount: formatted });
                }}
                inputMode="numeric"
                pattern="[0-9.]*"
              />
            )}
            
            <div className="modalActions">
              <button 
                onClick={editingGoal ? handleEditGoal : handleAddGoal}
                className="saveBtn"
              >
                {editingGoal ? 'Update' : 'Save'}
              </button>
              <button onClick={closeForm} className="cancelBtn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="goalsSection">
        <div className="sectionHeader">
          <h2>Your Goals</h2>
        </div>
        
        <div className="goalsGrid">
          {loading ? (
            <div className="loading">Loading your savings goals...</div>
          ) : goals.length > 0 ? (
            goals.map((goal) => {
              const progressPercentage = goal.completion_percentage || 
                (goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0);
              const remaining = Math.max(0, goal.target_amount - goal.current_amount);
              const isComplete = progressPercentage >= 100;

              return (
                <div key={goal.id} className="card">
                  <div className="cardHeader">
                    <div>
                      <h3>{goal.goal_name}</h3>
                      <div className="target">
                        🎯 Target: {formatCurrency(goal.target_amount)}
                      </div>
                    </div>
                    <div className="actions">
                      <button onClick={() => openEditForm(goal.id)} title="Edit">
                        ✏️
                      </button>
                      <button onClick={() => handleDelete(goal.id)} title="Delete">
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <div className="cardContent">
                    <div className="amountSection">
                      <div className="amount">
                        🐷 {formatCurrency(goal.current_amount)}
                      </div>
                      
                      <div className="progressBar">
                        <div
                          className={isComplete ? "progress complete" : "progress"}
                          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                        />
                      </div>
                      
                      <div className="progressInfo">
                        <span className="percent">{progressPercentage.toFixed(0)}% Complete</span>
                        {!isComplete && (
                          <span className="left">{formatCurrency(remaining)} Left</span>
                        )}
                        {isComplete && (
                          <span className="achieved">Goal Achieved! 🎉</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="emptyState">
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