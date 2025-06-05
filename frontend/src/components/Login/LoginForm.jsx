import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const LoginForm = ({ onSuccess }) => {
  const navigate = useNavigate();
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
      newErrors.email = "Do not leave this field blank";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email";
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = "Do not leave this field blank";
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
      console.log('Sending login request...');
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });
      console.log('Response received:', response);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token and user data
      const token = data.token;
      if (formData.rememberMe) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(data.user));
      }

      // Set up axios interceptor for future requests
      if (window.axios) {
        window.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      if (onSuccess) {
        onSuccess(data.user);
      }

      // Redirect to dashboard or home page
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setApiError(error.message || 'Login failed. Please try again.');
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
          placeholder="Enter your email"
        />
        {errors.email && <span className="error-message">{errors.email}</span>}
      </div>
      
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={errors.password ? 'error' : ''}
          placeholder="Enter your password"
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
          <label htmlFor="rememberMe">Remember me</label>
        </div>
        
        <Link to="/forgot-password" className="forgot-password">
          Forgot password?
        </Link>
      </div>
      
      <button type="submit" className="submit-button" disabled={isSubmitting}>
        {isSubmitting ? 'Processing...' : 'Login'}
      </button>
      
      <div className="login-footer">
        <p>Don't have an account? <Link to="/register" className="register-link">Register</Link></p>
      </div>
    </form>
  );
};

export default LoginForm;