import React, { useState } from 'react';
import LoginPage from './components/Login/LoginPage';
import RegisterPage from './components/Register/RegisterPage';
import HomePage from './components/HomePage/HomePage';
import NavBar from './components/NavBar/NavBar';
import { BrowserRouter as Router, Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';

function App() {
  // State để kiểm tra đăng nhập
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Hàm xử lý đăng nhập thành công
  const handleLoginSuccess = () => {
    console.log("Login successful");
    setIsLoggedIn(true);
  };

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    console.log("Logout successful");
    setIsLoggedIn(false);
  };

  return (
    <BrowserRouter>
      {isLoggedIn && <NavBar />}
      <div className="App">
      <Routes>
          {/* Trang mặc định luôn chuyển đến trang đăng nhập */}
          <Route path="/" element={<Navigate to="/login" />} />
          
          {/* Trang đăng nhập */}
          <Route path="/login" element={
            isLoggedIn ? <Navigate to="/home" /> : <LoginPage onLoginSuccess={handleLoginSuccess} />
          } />
          
          {/* Trang đăng ký */}
          <Route path="/register" element={
            isLoggedIn ? <Navigate to="/home" /> : <RegisterPage />
          } />
          
          {/* Trang chủ */}
          <Route path="/home" element={
            isLoggedIn ? <HomePage onLogout={handleLogout} /> : <Navigate to="/login" />
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;