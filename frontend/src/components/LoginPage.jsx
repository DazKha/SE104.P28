import React from 'react';
import LoginHeader from './LoginHeader';
import LoginForm from './LoginForm';

function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <div className="w-full max-w-md">
        <LoginHeader />
        <LoginForm />
      </div>
    </div>
  );
}

export default LoginPage;