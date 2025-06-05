import React, { useState } from 'react';
import RegisterHeader from './RegisterHeader';
import RegisterForm from './RegisterForm';
import RegisterSuccessMessage from './RegisterSuccessMessage';
import './RegisterPage.css';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegistrationSuccess = (formData) => {
    setRegistrationSuccess(true);
    console.log("Registration completed with data:", formData);
  };

  if (registrationSuccess) {
    return <RegisterSuccessMessage />;
  }

  return (
    <div className="register-container">
      <div className="register-form-container">
        <RegisterHeader />
        <RegisterForm onSuccess={handleRegistrationSuccess} />
      </div>
    </div>
  );
};

export default RegisterPage;