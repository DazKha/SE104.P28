import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import './IncomeExpensesChart.css';

const IncomeExpensesChart = ({ transactions }) => {
  const [viewType, setViewType] = useState('weekly');
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const processData = () => {
      const now = new Date();
      const data = [];
      
      if (viewType === 'weekly') {
        // Get last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          
          const dayTransactions = transactions.filter(t => {
            const transDate = new Date(t.date);
            return transDate.toDateString() === date.toDateString();
          });

          const income = dayTransactions
            .filter(t => t.type === 'Income')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);

          const expenses = dayTransactions
            .filter(t => t.type === 'Expense')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);

          data.push({
            name: dayName,
            income,
            expenses
          });
        }
      } else {
        // Get last 6 months
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now);
          date.setMonth(date.getMonth() - i);
          const monthName = date.toLocaleDateString('en-US', { month: 'short' });
          
          const monthTransactions = transactions.filter(t => {
            const transDate = new Date(t.date);
            return transDate.getMonth() === date.getMonth() && 
                   transDate.getFullYear() === date.getFullYear();
          });

          const income = monthTransactions
            .filter(t => t.type === 'Income')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);

          const expenses = monthTransactions
            .filter(t => t.type === 'Expense')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);

          data.push({
            name: monthName,
            income,
            expenses
          });
        }
      }
      
      setChartData(data);
    };

    processData();
  }, [transactions, viewType]);

  const toggleView = () => {
    setViewType(viewType === 'weekly' ? 'monthly' : 'weekly');
  };

  // Format currency for tooltip
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
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
          <BarChart data={chartData}>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#888' }}
            />
            <Tooltip 
              formatter={(value) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: '#2a2a2a',
                border: 'none',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Bar 
              dataKey="income" 
              fill="#4CAF50" 
              radius={[4, 4, 0, 0]}
              name="Income"
            />
            <Bar 
              dataKey="expenses" 
              fill="#2196F3" 
              radius={[4, 4, 0, 0]}
              name="Expenses"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default IncomeExpensesChart;