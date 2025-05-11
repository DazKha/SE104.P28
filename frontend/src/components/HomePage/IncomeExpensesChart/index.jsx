import React, { useState,useEffect } from 'react';
import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts';
import './IncomeExpensesChart.css';

const IncomeExpensesChart = ({ data }) => {
  const [viewType, setViewType] = useState('weekly');

  const toggleView = () => {
    setViewType(viewType === 'weekly' ? 'monthly' : 'weekly');
  };

  return (
    <div className="card chart-card">
      <div className="card-header">
        <h2>Income vs Expenses ({viewType})</h2>
        <button className="view-toggle" onClick={toggleView}>
          Show {viewType === 'weekly' ? 'Monthly' : 'Weekly'}
        </button>
      </div>
      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-color income-color"></span>
          <span>Income</span>
        </div>
        <div className="legend-item">
          <span className="legend-color expenses-color"></span>
          <span>Expenses</span>
        </div>
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <Bar dataKey="income" fill="#4CAF50" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" fill="#2196F3" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default IncomeExpensesChart;