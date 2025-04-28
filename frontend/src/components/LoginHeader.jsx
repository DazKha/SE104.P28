import React from 'react';

function LoginHeader() {
  return (
    <>
      
      <h1 className="text-5xl font-bold text-pacifico-400 mb-12 text-center tracking-wider">
        Smart Expense Tracker
      </h1>
      
      <div className="text-center mb-6">
        <p className="text-2xl text-500 font-georgia italic">Welcome to SET</p>
        <h2 className="text-4xl text-500 font-georgia italic">Sign into your account</h2>
      </div>
    </>
  );
}

export default LoginHeader;