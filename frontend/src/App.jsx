import React from 'react';
import LoginPage from './components/Login/LoginPage.jsx';
import RegisterPage from './components/Register/RegisterPage.jsx';
import HomePage from './components/HomePage/HomePage.jsx';
import NavBar from './components/NavBar/NavBar.jsx';
import ExpensesPage from './components/ExpensesPage/ExpensesPage.jsx';
import SavingWallet from './components/SavingWallet/SavingWallet.jsx';
import LoansDebts from './components/LoansDebts/LoansDebts.jsx';
import Budget from './components/Budget/Budget.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { BrowserRouter as Router, Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import './App.css';

function AppContent() {
  const { isLoggedIn, logout } = useAuth();

  return (
    <BrowserRouter>
      {isLoggedIn && <NavBar onLogout={logout} />}
      <div className="App">
        <Routes>
          {/* Trang mặc định luôn chuyển đến trang đăng nhập */}
          <Route path="/" element={<Navigate to="/login" />} />
          
          {/* Trang đăng nhập */}
          <Route path="/login" element={
            isLoggedIn ? <Navigate to="/home" /> : <LoginPage />
          } />
          
          {/* Trang đăng ký */}
          <Route path="/register" element={
            isLoggedIn ? <Navigate to="/home" /> : <RegisterPage />
          } />
          
          {/* Trang chủ */}
          <Route path="/home" element={
            isLoggedIn ? <HomePage onLogout={logout} /> : <Navigate to="/login" />
          } />
          {/* Trang chi tiêu */}
          <Route path="/expenses" element={
            isLoggedIn ? <ExpensesPage /> : <Navigate to="/login" />
          } />
          {/* Trang Saving Wallet */}
          <Route path="/saving-wallet" element={
            isLoggedIn ? <SavingWallet /> : <Navigate to="/login" />
          } />
          {/* Trang Your debt */}
          <Route path="/your-debt" element={
            isLoggedIn ? <LoansDebts /> : <Navigate to="/login" />
          } />
          {/* Trang Budget */}
          <Route path="/budget" element={
            isLoggedIn ? <Budget /> : <Navigate to="/login" />
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;