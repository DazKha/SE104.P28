import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="main-nav">
      <div className="nav-links">
        <Link to="/" className="active">Home page</Link>
        <Link to="/expenses">Expenses</Link>
        <Link to="/budget">Budget</Link>
        <Link to="/saving-wallet">Saving Wallet</Link>
        <Link to="/your-debt">Your debt</Link>
      </div>
      <div className="user-section">
        <button className="user-btn">USER</button>
      </div>
    </nav>
  );
};

export default Navbar;