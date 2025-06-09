import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './NavPage.css';

const NavPage = () => {
  const location = useLocation();

  return (
    <nav className="nav-page">
      <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
        <i className="fas fa-home"></i>
        <span>Home</span>
      </Link>
      <Link to="/budget" className={`nav-item ${location.pathname === '/budget' ? 'active' : ''}`}>
        <i className="fas fa-chart-pie"></i>
        <span>Budget</span>
      </Link>
      <Link to="/ocr" className={`nav-item ${location.pathname === '/ocr' ? 'active' : ''}`}>
        <i className="fas fa-camera"></i>
        <span>OCR</span>
      </Link>
      <Link to="/profile" className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}>
        <i className="fas fa-user"></i>
        <span>Profile</span>
      </Link>
    </nav>
  );
};

export default NavPage; 