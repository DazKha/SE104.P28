import React, { useState, useEffect } from 'react';
import './CurrencyInput.css';

const CurrencyInput = ({ 
  value, 
  onChange, 
  placeholder = "Nhập số tiền...", 
  className = "",
  ...props 
}) => {
  const [displayValue, setDisplayValue] = useState('');

  // Format number với dấu chấm ngăn cách hàng nghìn
  const formatNumber = (num) => {
    if (!num) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Loại bỏ dấu chấm để lấy số thật
  const parseNumber = (str) => {
    if (!str) return '';
    return str.replace(/\./g, '');
  };

  // Cập nhật display value khi value prop thay đổi
  useEffect(() => {
    if (value !== undefined && value !== null) {
      setDisplayValue(formatNumber(value.toString()));
    }
  }, [value]);

  const handleChange = (e) => {
    const inputValue = e.target.value;
    
    // Chỉ cho phép nhập số
    const numericValue = inputValue.replace(/[^\d]/g, '');
    
    // Cập nhật display value với format
    setDisplayValue(formatNumber(numericValue));
    
    // Gửi giá trị thật (không có dấu chấm) về parent component
    if (onChange) {
      onChange({
        ...e,
        target: {
          ...e.target,
          value: numericValue
        }
      });
    }
  };

  return (
    <input
      {...props}
      type="text"
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={`currency-input ${className}`}
      inputMode="numeric"
      pattern="[0-9.]*"
    />
  );
};

export default CurrencyInput; 