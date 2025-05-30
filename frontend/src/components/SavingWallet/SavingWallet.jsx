import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useDataReset } from '../../hooks/useDataReset.js';
import CurrencyInput from '../common/CurrencyInput.jsx';
import savingService from '../../services/savingService';
import SavingWalletModal from './SavingWalletModal';
import './SavingWallet.css';

function SavingWallet() {
  const { isLoggedIn } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [editingGoalData, setEditingGoalData] = useState(null);

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
    setEditingGoalData(null);
    fetchGoals();
  }, [fetchGoals]);

  useDataReset(resetData);

  useEffect(() => {
    if (isLoggedIn) {
      fetchGoals();
    }
  }, [isLoggedIn, fetchGoals]);

  const handleAddGoal = async (formData) => {
    // Convert currency fields to numbers
    const dataToSend = {
      ...formData,
      target_amount: parseFloat(formData.target_amount) || 0,
      current_amount: parseFloat(formData.current_amount) || 0,
      monthly_goal: parseFloat(formData.monthly_goal) || 0,
    };
    try {
      await savingService.create(dataToSend);
      setShowAddForm(false);
      fetchGoals();
    } catch (err) {
      console.error('Error adding goal:', err);
      alert('Error adding goal. Please try again.');
    }
  };

  const handleEditGoal = async (formData) => {
    // Convert currency fields to numbers
    const dataToSend = {
      ...formData,
      target_amount: parseFloat(formData.target_amount) || 0,
      current_amount: parseFloat(formData.current_amount) || 0,
      monthly_goal: parseFloat(formData.monthly_goal) || 0,
    };
    try {
      await savingService.update(editingGoal, dataToSend);
      setEditingGoal(null);
      setEditingGoalData(null);
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
      setEditingGoalData(goal);
    }
  };

  const closeForm = () => {
    setShowAddForm(false);
    setEditingGoal(null);
    setEditingGoalData(null);
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
          className="addBtn"
          onClick={() => setShowAddForm(true)}
        >
          ➕ Add Saving Goal
        </button>
      </div>

      <SavingWalletModal
        isOpen={showAddForm || editingGoal}
        onClose={closeForm}
        onSave={editingGoal ? handleEditGoal : handleAddGoal}
        editingGoal={editingGoal}
        initialData={editingGoalData}
      />

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