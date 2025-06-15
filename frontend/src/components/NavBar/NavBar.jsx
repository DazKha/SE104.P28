  // components/NavBar/NavBar.jsx
  import React from 'react';
  import { NavLink, useNavigate } from 'react-router-dom';
  import { useAuth } from '../../contexts/AuthContext.jsx';
  import './NavBar.css';

  function NavBar() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
      logout();
      navigate('/login');
    };

    return (
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-links">
            <NavLink to="/home" className={({ isActive }) => isActive ? "active-link" : ""}>
              Home page
            </NavLink>
            
            <NavLink to="/expenses" className={({ isActive }) => isActive ? "active-link" : ""}>
              Expenses
            </NavLink>
            
            <NavLink to="/budget" className={({ isActive }) => isActive ? "active-link" : ""}>
              Budget
            </NavLink>
            
            <NavLink to="/saving-wallet" className={({ isActive }) => isActive ? "active-link" : ""}>
              Saving Wallet
            </NavLink>
            
            <NavLink to="/your-debt" className={({ isActive }) => isActive ? "active-link" : ""}>
              Your debt
            </NavLink>
            
            <NavLink to="/ocr" className={({ isActive }) => isActive ? "active-link" : ""}>
              <i className="fas fa-camera"></i> Receipt
            </NavLink>
          </div>
          
          <div className="user-section">
            <span className="user-name">{user?.name || 'USER'}</span>
            <button className="logout-btn" onClick={handleLogout}>
              LOG OUT
            </button>
          </div>
        </div>
      </nav>
    );
  }

  export default NavBar;