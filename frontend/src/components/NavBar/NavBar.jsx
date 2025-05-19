  // components/NavBar/NavBar.jsx
  import React from 'react';
  import { NavLink, useNavigate } from 'react-router-dom';
  import './NavBar.css';

  function NavBar() {
    return (
      <nav className="navbar">
        <div className="nav-container">
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
          
          <div className="user-section">
            <NavLink to="/profile">USER</NavLink>
          </div>
        </div>
      </nav>
    );
  }

  export default NavBar;