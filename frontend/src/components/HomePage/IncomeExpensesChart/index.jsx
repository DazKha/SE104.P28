import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts';
import './IncomeExpensesChart.css';

const IncomeExpensesChart = ({ transactions }) => {
  const [viewType, setViewType] = useState('weekly');
  const [isLoading, setIsLoading] = useState(true);

  // Memoize the processed data to avoid unnecessary recalculations
  const chartData = useMemo(() => {
    console.log('=== CHART DEBUG ===');
    console.log('Raw transactions received:', transactions?.length || 0);
    console.log('Sample transaction:', transactions?.[0]);
    
    if (!transactions) {
      console.log('No transactions provided');
      return [];
    }

    // Debug: Check transaction types
    const outcomeTransactions = transactions.filter(t => t.type === 'outcome');
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    
    console.log('Income transactions:', incomeTransactions.length);
    console.log('Outcome transactions:', outcomeTransactions.length);
    console.log('Sample outcome:', outcomeTransactions[0]);

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
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);

        const outcome = dayTransactions
          .filter(t => t.type === 'outcome')
          .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);

        console.log(`${dayName} - Income: ${income}, Outcome: ${outcome}`);
        
        data.push({
          name: dayName,
          income,
          outcome
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
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);

        const outcome = monthTransactions
          .filter(t => t.type === 'outcome')
          .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);

        data.push({
          name: monthName,
          income,
          outcome
        });
      }
    }
    
    console.log('Final chart data:', data);
    console.log('=== END CHART DEBUG ===');
    return data;
  }, [transactions, viewType]);

  useEffect(() => {
    setIsLoading(true);
    // Simulate loading state for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
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
        <h2>Income vs Outcome ({viewType})</h2>
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
          <span className="legend-color outcome-color"></span>
          <span>Outcome</span>
        </div>
      </div>
      <div className="chart-container">
        {isLoading ? (
          <div className="loading-spinner">Loading...</div>
        ) : (
          chartData.length === 0 ? (
            <div className="no-data-message">
              No transaction data available
            </div>
          ) : (
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
                  animationDuration={500}
                />
                <Bar 
                  dataKey="outcome" 
                  fill="#2196F3" 
                  radius={[4, 4, 0, 0]}
                  name="Outcome"
                  animationDuration={500}
                />
              </BarChart>
            </ResponsiveContainer>
          )
        )}
      </div>
    </div>
  );
};

export default IncomeExpensesChart;