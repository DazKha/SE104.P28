import React, { useState, useEffect } from 'react';
import CurrencyInput from '../common/CurrencyInput.jsx';
import './SavingWallet.css';

function SavingWalletModal({ isOpen, onClose, onSave, editingGoal, initialData }) {
  const [formData, setFormData] = useState({
    goal_name: '',
    icon: '💰',
    target_amount: 0,
    current_amount: 0,
    target_date: '',
    monthly_goal: 0,
    priority: 'medium',
    tags: [],
    description: ''
  });

  const [selectedIcon, setSelectedIcon] = useState('💰');
  const [selectedPriority, setSelectedPriority] = useState('medium');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        goal_name: initialData.goal_name || '',
        icon: initialData.icon || '💰',
        target_amount: initialData.target_amount || 0,
        current_amount: initialData.current_amount || 0,
        target_date: initialData.target_date || '',
        monthly_goal: initialData.monthly_goal || 0,
        priority: initialData.priority || 'medium',
        tags: initialData.tags || [],
        description: initialData.description || ''
      });
      setSelectedIcon(initialData.icon || '💰');
      setSelectedPriority(initialData.priority || 'medium');
      setTags(initialData.tags || []);
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log('Submitting form data:', formData);

    // Basic validation for goal_name
    if (!formData.goal_name || !formData.goal_name.trim()) {
      alert('Tên mục tiêu không được để trống.');
      return;
    }

    // Safely parse target_amount (expecting a digit string from CurrencyInput)
    const targetAmountNumber = parseFloat(formData.target_amount);

    console.log('Value from formData.target_amount:', formData.target_amount);
    console.log('Parsed target amount number:', targetAmountNumber);

    if (isNaN(targetAmountNumber) || targetAmountNumber <= 0) {
        alert('Số tiền mục tiêu phải là một số dương.');
        return;
    }

    // Safely parse other currency fields (expecting digit strings)
    const currentAmountNumber = parseFloat(formData.current_amount) || 0;
    const monthlyGoalNumber = parseFloat(formData.monthly_goal) || 0;

    onSave({
      ...formData,
      icon: selectedIcon,
      priority: selectedPriority,
      tags: tags,
      // Ensure numbers are sent as numbers
      target_amount: targetAmountNumber,
      current_amount: currentAmountNumber,
      monthly_goal: monthlyGoalNumber,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For CurrencyInput, value might be a formatted string, we need to clean it
    let processedValue = value;
    if (name === 'target_amount' || name === 'current_amount' || name === 'monthly_goal') {
        // Remove any non-digit characters except decimal point
        processedValue = value.replace(/[^\d.]/g, '');
        // Ensure only one decimal point
        const parts = processedValue.split('.');
        if (parts.length > 2) {
            processedValue = parts[0] + '.' + parts.slice(1).join('');
        }
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const handleIconSelect = (icon) => {
    setSelectedIcon(icon);
  };

  const handlePrioritySelect = (priority) => {
    setSelectedPriority(priority);
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const calculateCompletion = () => {
    const targetAmount = parseFloat(formData.target_amount) || 0;
    const currentAmount = parseFloat(formData.current_amount) || 0;
    const monthlyGoal = parseFloat(formData.monthly_goal) || 0;

    if (targetAmount > 0 && monthlyGoal > 0) {
      const remaining = targetAmount - currentAmount;
      const monthsNeeded = Math.ceil(remaining / monthlyGoal);
      
      if (monthsNeeded > 0) {
        const completionDate = new Date();
        completionDate.setMonth(completionDate.getMonth() + monthsNeeded);
        return `${monthsNeeded} tháng (${completionDate.toLocaleDateString('vi-VN')})`;
      }
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`}>
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">{editingGoal ? 'Chỉnh sửa mục tiêu' : 'Tạo mục tiêu tiết kiệm mới'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tên mục tiêu *</label>
            <input
              type="text"
              className="form-input"
              name="goal_name"
              value={formData.goal_name}
              onChange={handleChange}
              placeholder="Ví dụ: Mua xe, Du lịch Hàn Quốc..."
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Chọn biểu tượng</label>
            <div className="goal-icons">
              {['🚗', '🏠', '✈️', '💍', '🎓', '💻', '📱', '🎸', '👗', '🎮', '📚', '💰'].map((icon) => (
                <div
                  key={icon}
                  className={`icon-option ${selectedIcon === icon ? 'selected' : ''}`}
                  onClick={() => handleIconSelect(icon)}
                >
                  {icon}
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Số tiền mục tiêu *</label>
            <div className="currency-input">
              <CurrencyInput
                className="form-input"
                name="target_amount"
                value={formData.target_amount}
                onChange={handleChange}
                placeholder="500000000"
                required
              />
              <span className="currency-symbol">VNĐ</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Số tiền hiện tại</label>
            <div className="currency-input">
              <CurrencyInput
                className="form-input"
                name="current_amount"
                value={formData.current_amount}
                onChange={handleChange}
                placeholder="0"
              />
              <span className="currency-symbol">VNĐ</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Ngày dự kiến hoàn thành</label>
            <input
              type="date"
              className="form-input date-input"
              name="target_date"
              value={formData.target_date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mục tiêu tiết kiệm hàng tháng</label>
            <div className="currency-input">
              <CurrencyInput
                className="form-input"
                name="monthly_goal"
                value={formData.monthly_goal}
                onChange={handleChange}
                placeholder="5000000"
              />
              <span className="currency-symbol">VNĐ</span>
            </div>
            {calculateCompletion() && (
              <div className="calculation-preview">
                <div className="calculation-title">Dự kiến hoàn thành:</div>
                <div className="calculation-value">{calculateCompletion()}</div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Mức độ ưu tiên</label>
            <div className="priority-levels">
              <div
                className={`priority-option priority-low ${selectedPriority === 'low' ? 'selected' : ''}`}
                onClick={() => handlePrioritySelect('low')}
              >
                <div>🟢 Thấp</div>
                <small>Không vội</small>
              </div>
              <div
                className={`priority-option priority-medium ${selectedPriority === 'medium' ? 'selected' : ''}`}
                onClick={() => handlePrioritySelect('medium')}
              >
                <div>🟡 Trung bình</div>
                <small>Bình thường</small>
              </div>
              <div
                className={`priority-option priority-high ${selectedPriority === 'high' ? 'selected' : ''}`}
                onClick={() => handlePrioritySelect('high')}
              >
                <div>🔴 Cao</div>
                <small>Khẩn cấp</small>
              </div>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Mô tả (tùy chọn)</label>
            <textarea
              className="form-input"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Mô tả chi tiết về mục tiêu của bạn..."
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn cancel-btn" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn save-btn">
              {editingGoal ? 'Cập nhật' : 'Tạo mục tiêu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SavingWalletModal; 