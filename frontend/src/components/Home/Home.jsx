import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Home = () => {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Welcome to Expense Tracker</h1>
        <button 
          onClick={logout}
          style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Logout
        </button>
      </div>
      
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>Hello, {user?.name || 'User'}!</h2>
        <p>This is your expense tracking dashboard.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3>Total Expenses</h3>
          <p style={{ fontSize: '24px', color: '#dc3545' }}>$0.00</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3>Budget</h3>
          <p style={{ fontSize: '24px', color: '#28a745' }}>$0.00</p>
        </div>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
          <h3>Savings</h3>
          <p style={{ fontSize: '24px', color: '#007bff' }}>$0.00</p>
        </div>
      </div>
    </div>
  );
};

export default Home; 