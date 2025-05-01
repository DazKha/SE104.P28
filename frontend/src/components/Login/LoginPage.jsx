import React, { useState } from 'react';
import './LoginPage.css';
import LoginHeader from './LoginHeader';
import LoginForm from './LoginForm';
import LoginSuccessMessage from './LoginSuccessMessage';

const LoginPage = () => {
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [userData, setUserData] = useState(null);

  const handleLoginSuccess = (formData) => {
    setUserData(formData);
    setLoginSuccess(true);
    console.log("Login completed with data:", formData);
  };

  if (loginSuccess) {
    return <LoginSuccessMessage user={userData} />;
  }

  return (
    <div className="login-container">
      <div className="login-form-container">
        <LoginHeader />
        <LoginForm onSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
};

export default LoginPage;