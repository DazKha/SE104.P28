import React, { useState, useEffect } from 'react';
import ReportChart from './ReportChart/ReportChart.jsx';
import { PieChart, BarChart, TrendingUp, TrendingDown, Calendar, Download } from 'lucide-react';
import './ReportSection.css';

const ReportSection = () => {
  // Trạng thái cho các giao dịch
  const [transactions, setTransactions] = useState([]);
  
  // Trạng thái cho báo cáo tổng quan
  const [summary, setSummary] = useState({
    balance: 0,
    income: 0,
    expense: 0,
    thisMonth: {
      income: 0,
      expense: 0
    },
    lastMonth: {
      income: 0,
      expense: 0
    }
  });

  // Tải dữ liệu từ localStorage
  useEffect(() => {
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  // Tính toán các báo cáo tổng quan
  useEffect(() => {
    if (transactions.length === 0) return;

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Lọc giao dịch theo tháng hiện tại và tháng trước
    const currentMonthTransactions = transactions.filter(transaction => {
      const [day, month, year] = transaction.date.split('/').map(Number);
      return month - 1 === currentMonth && year === currentYear;
    });
    
    const lastMonthTransactions = transactions.filter(transaction => {
      const [day, month, year] = transaction.date.split('/').map(Number);
      // Xử lý tháng 1 (so với tháng 12 năm trước)
      if (currentMonth === 0) {
        return month === 12 && year === currentYear - 1;
      }
      return month - 1 === currentMonth - 1 && year === currentYear;
    });

    // Tính toán tổng thu nhập và chi tiêu
    const totalIncome = transactions
      .filter(transaction => transaction.amount > 0)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    
    const totalExpense = transactions
      .filter(transaction => transaction.amount < 0)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    
    // Tính toán cho tháng hiện tại
    const thisMonthIncome = currentMonthTransactions
      .filter(transaction => transaction.amount > 0)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    
    const thisMonthExpense = currentMonthTransactions
      .filter(transaction => transaction.amount < 0)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    
    // Tính toán cho tháng trước
    const lastMonthIncome = lastMonthTransactions
      .filter(transaction => transaction.amount > 0)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    
    const lastMonthExpense = lastMonthTransactions
      .filter(transaction => transaction.amount < 0)
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    // Cập nhật báo cáo tổng quan
    setSummary({
      balance: totalIncome + totalExpense,
      income: totalIncome,
      expense: totalExpense,
      thisMonth: {
        income: thisMonthIncome,
        expense: thisMonthExpense
      },
      lastMonth: {
        income: lastMonthIncome,
        expense: lastMonthExpense
      }
    });
  }, [transactions]);
  
  // Định dạng số tiền
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(Math.abs(amount));
  };

  // Tính toán phần trăm thay đổi
  const calculateChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / Math.abs(previous)) * 100;
  };

  // Hiển thị phần trăm thay đổi với biểu tượng
  const renderPercentageChange = (current, previous) => {
    const percentChange = calculateChange(current, previous);
    
    return (
      <div>
        {percentChange > 0 ? (
          <TrendingUp size={14}/>
        ) : percentChange < 0 ? (
          <TrendingDown size={14}/>
        ) : null}
        {percentChange !== 0 ? `${Math.abs(percentChange).toFixed(1)}%` : 'No change'}
        <span>so với tháng trước</span>
      </div>
    );
  };

  // Lấy tên tháng hiện tại
  const getCurrentMonth = () => {
    const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
                  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    return months[new Date().getMonth()];
  };

  // Xử lý xuất báo cáo dưới dạng CSV
  const exportToCSV = () => {
    // Tạo dữ liệu CSV
    let csvContent = "Date,Description,Category,Amount\n";
    
    transactions.forEach(transaction => {
      csvContent += `${transaction.date},"${transaction.description}","${transaction.category}",${transaction.amount}\n`;
    });
    
    // Tạo đối tượng Blob và liên kết tải xuống
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `finance_report_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="report-section">
      <div className="report-header">
        <h2>Report</h2>
        <button className="export-btn" onClick={exportToCSV}>
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* Thẻ tổng quan */}
      <div className="overview-grid">
        <div className="overview-card">
          <div className="overview-card-title">Số dư hiện tại</div>
          <div className="overview-card-amount">
            {formatCurrency(summary.balance)} đ
          </div>
          <div className="overview-card-subtitle">
            Tổng: {transactions.length} giao dịch
          </div>
        </div>
        
        <div className="overview-card">
          <div className="overview-card-title">Thu nhập</div>
          <div className="overview-card-amount">
            {formatCurrency(summary.income)} đ
          </div>
          <div className="overview-card-subtitle">
            {transactions.filter(t => t.amount > 0).length} giao dịch thu nhập
          </div>
        </div>
        
        <div className="overview-card">
          <div className="overview-card-title">Chi tiêu</div>
          <div className="overview-card-amount">
            {formatCurrency(summary.expense)} đ
          </div>
          <div className="overview-card-subtitle">
            {transactions.filter(t => t.amount < 0).length} giao dịch chi tiêu
          </div>
        </div>
        
        <div className="current-month-card">
          <div className="month-header">
            <Calendar size={14}/>
            {getCurrentMonth()}
          </div>
          <div className="month-stats">
            <div className="month-stat-item">
              <div className="month-stat-amount income">
                +{formatCurrency(summary.thisMonth.income)}đ
              </div>
              <div className="percentage-change">
                {renderPercentageChange(summary.thisMonth.income, summary.lastMonth.income)}
              </div>
            </div>
            <div className="month-stat-item">
              <div className="month-stat-amount expense">
                -{formatCurrency(summary.thisMonth.expense)}đ
              </div>
              <div className="percentage-change">
                {renderPercentageChange(Math.abs(summary.thisMonth.expense), Math.abs(summary.lastMonth.expense))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phần biểu đồ */}
      {transactions.length === 0 ? (
        <div className="no-data">
          <PieChart size={48}/>
          <h3>Không có dữ liệu để hiển thị</h3>
          <p>Thêm giao dịch để xem báo cáo chi tiết và biểu đồ phân tích.</p>
        </div>
      ) : (
        <div className="chart-section">
          <ReportChart transactions={transactions} />
        </div>
      )}
    </div>
  );
};

export default ReportSection;