import React, { useEffect } from 'react';
import { Link,useNavigate } from 'react-router-dom';

const LoginSuccessMessage = ({ user }) => {
  const navigate = useNavigate();
  useEffect(() => {
    setTimeout(() => {
      navigate('/home');
    }, 3000);
    return () => clearTimeout(timeout);
  }, [navigate]);
  
  return (
    <div className="login-container success-container">
      <div className="success-message">
        <h2>Đăng nhập thành công!</h2>
        <p>Chào mừng quay trở lại, {user?.email || 'bạn'}!</p>
        <p>Bạn sẽ được chuyển đến trang chủ trong vài giây...</p>
        <Link to="/" className="btn btn-primary">Đến trang chủ ngay</Link>
      </div>
    </div>
  );
};

export default LoginSuccessMessage;