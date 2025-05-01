import React, { useState } from 'react';
import RegisterHeader from './RegisterHeader';
import RegisterForm from './RegisterForm';
import RegisterSuccessMessage from './RegisterSuccessMessage';

const RegisterPage = () => {
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleRegistrationSuccess = (formData) => {
    setRegistrationSuccess(true);
    // Ở đây bạn có thể xử lý dữ liệu form nếu cần
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