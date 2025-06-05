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
        <h2>Login successful!</h2>
        <p>Welcome back, {user?.email || 'you'}!</p>
        <p>You will be redirected to the home page in a few seconds...</p>
        <Link to="/" className="btn btn-primary">Go to home page now</Link>
      </div>
    </div>
  );
};

export default LoginSuccessMessage;