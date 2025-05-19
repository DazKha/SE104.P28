import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import './ReportChart.css';

const ReportChart = ({ transactions }) => {
  const [chartData, setChartData] = useState({
    income: [],
    expense: []
  });
  
  // Màu sắc cho biểu đồ
  const INCOME_COLORS = ['#3498db', '#2980b9', '#1abc9c', '#16a085', '#27ae60'];
  const EXPENSE_COLORS = ['#e74c3c', '#c0392b', '#e67e22', '#d35400', '#f39c12'];
  
  // Loại biểu đồ mặc định là "thu nhập"
  const [chartType, setChartType] = useState('income');

  // Phân loại và tổng hợp dữ liệu cho biểu đồ
  useEffect(() => {
    // Xử lý dữ liệu thu nhập (theo danh mục)
    const incomeByCategory = transactions
      .filter(transaction => transaction.amount > 0)
      .reduce((acc, transaction) => {
        const category = transaction.category;
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += transaction.amount;
        return acc;
      }, {});
    
    // Xử lý dữ liệu chi tiêu (theo danh mục)
    const expenseByCategory = transactions
      .filter(transaction => transaction.amount < 0)
      .reduce((acc, transaction) => {
        const category = transaction.category;
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += Math.abs(transaction.amount);
        return acc;
      }, {});
    
    // Chuyển đổi dữ liệu để sử dụng với Recharts
    const incomeData = Object.keys(incomeByCategory).map(category => ({
      name: category,
      value: incomeByCategory[category]
    }));
    
    const expenseData = Object.keys(expenseByCategory).map(category => ({
      name: category,
      value: expenseByCategory[category]
    }));
    
    setChartData({
      income: incomeData,
      expense: expenseData
    });
  }, [transactions]);

  // Tính tổng thu nhập và chi tiêu
  const totalIncome = transactions
    .filter(transaction => transaction.amount > 0)
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  
  const totalExpense = transactions
    .filter(transaction => transaction.amount < 0)
    .reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);

  // Định dạng số tiền
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  // Hiển thị tooltip cho biểu đồ
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div>
          <p> {payload[0].name}</p>
          <p>{formatCurrency(payload[0].value)} đ
            <span>
              ({((payload[0].value / (chartType === 'income' ? totalIncome : totalExpense)) * 100).toFixed(1)}%)
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Render dữ liệu cho bảng chi tiết
  const renderDetailTable = () => {
    const data = chartType === 'income' ? chartData.income : chartData.expense;
    const total = chartType === 'income' ? totalIncome : totalExpense;
    
    if (data.length === 0) {
      return (
        <div>
          No {chartType} transactions to display
        </div>
      );
    }
    
    // Sắp xếp dữ liệu theo giá trị giảm dần
    const sortedData = [...data].sort((a, b) => b.value - a.value);
    
    return (
      <div>
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Amount</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{formatCurrency(item.value)} đ</td>
                <td>
                  {((item.value / total) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
            <tr>
              <td>Total</td>
              <td>{formatCurrency(total)} đ</td>
              <td>100%</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="report-chart">
      <div className="chart-controls">
        <div className="chart-type-selector">
          <button 
            className={`chart-type-btn ${chartType === 'income' ? 'active' : ''}`}
            onClick={() => setChartType('income')}
          >
            <PieChart size={16} />
            Thu nhập
          </button>
          <button 
            className={`chart-type-btn ${chartType === 'expense' ? 'active' : ''}`}
            onClick={() => setChartType('expense')}
          >
            <PieChart size={16} />
            Chi tiêu
          </button>
        </div>
      </div>

      <div className="chart-container">
        <h3 className="chart-title">
          {chartType === 'income' ? 'Thu nhập' : 'Chi tiêu'} theo danh mục
        </h3>
        
        {(chartType === 'income' ? chartData.income.length : chartData.expense.length) === 0 ? (
          <div className="no-data">
            <PieChart size={38} />
            <p>Không có dữ liệu để hiển thị</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartType === 'income' ? chartData.income : chartData.expense}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
              >
                {(chartType === 'income' ? chartData.income : chartData.expense).map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={chartType === 'income' 
                      ? INCOME_COLORS[index % INCOME_COLORS.length]
                      : EXPENSE_COLORS[index % EXPENSE_COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="chart-details">
        <h3 className="details-title">Chi tiết</h3>
        {renderDetailTable()}
      </div>
    </div>
  );
};

export default ReportChart;