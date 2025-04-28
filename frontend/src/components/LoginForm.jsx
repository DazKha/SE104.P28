import React, { useState } from 'react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt with:', { email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="text"
          placeholder="Phone or Email address"
          className="w-full p-4 rounded-full bg-white shadow-md placeholder-gray-400 text-gray-700 focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div>
        <input
          type="password"
          placeholder="Password"
          className="w-full p-4 rounded-full bg-white shadow-md placeholder-gray-400 text-gray-700 focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
      <div>
        <button
          type="submit"
          className="w-full py-3 bg-500 hover:bg-pink-600 text-white font-bold text-xl rounded-full transition duration-300"
        >
          Log In
        </button>
      </div>
      
      <div className="text-center">
        <a href="#" className="text-blue-500 underline text-sm">
          Forget password?
        </a>
      </div>
    </form>
  );
}

export default LoginForm;