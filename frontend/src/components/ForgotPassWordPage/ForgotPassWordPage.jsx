import React from 'react';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <h1>Quên mật khẩu</h1>
          <p>Vui lòng nhập email của bạn để nhận link đặt lại mật khẩu</p>
        </div>
        
        <form className="forgot-password-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Nhập email của bạn"
            />
          </div>
          
          <button type="submit" className="submit-button">
            Gửi link đặt lại mật khẩu
          </button>
        </form>
        
        <div className="forgot-password-footer">
          <p>Đã nhớ mật khẩu? <Link to="/login">Đăng nhập</Link></p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;