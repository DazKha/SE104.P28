import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LoginForm = ({ onSuccess }) => {
  // State for form fields
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  
  // State for form validation and submission
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
    setApiError(''); // Clear API error when user types
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = "Mật khẩu không được để trống";
    }
    
    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApiError('');
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setIsSubmitting(false);
      return;
    }
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }

      // Store token in localStorage if remember me is checked
      if (formData.rememberMe) {
        localStorage.setItem('token', data.token);
      } else {
        sessionStorage.setItem('token', data.token);
      }

      if (onSuccess) {
        onSuccess(data.user);
      }
    } catch (error) {
      setApiError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      {apiError && <div className="api-error-message">{apiError}</div>}
      
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={errors.email ? 'error' : ''}
          placeholder="Nhập email của bạn"
        />
        {errors.email && <span className="error-message">{errors.email}</span>}
      </div>
      
      <div className="form-group">
        <label htmlFor="password">Mật khẩu</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={errors.password ? 'error' : ''}
          placeholder="Nhập mật khẩu của bạn"
        />
        {errors.password && <span className="error-message">{errors.password}</span>}
      </div>
      
      <div className="login-options">
        <div className="remember-me">
          <input
            type="checkbox"
            id="rememberMe"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
          />
          <label htmlFor="rememberMe">Ghi nhớ đăng nhập</label>
        </div>
        
        <Link to="/forgot-password" className="forgot-password">
          Quên mật khẩu?
        </Link>
      </div>
      
      <button type="submit" className="submit-button" disabled={isSubmitting}>
        {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
      </button>
      
      <div className="login-footer">
        <p>Chưa có tài khoản? <Link to="/register" className="register-link">Đăng ký</Link></p>
      </div>
    </form>
  );
};

export default LoginForm;