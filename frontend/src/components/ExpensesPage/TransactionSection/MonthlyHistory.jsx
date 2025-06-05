import React, { useState, useEffect } from 'react';
import TransactionItem from './TransactionItem.jsx';
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, TrendingUpIcon, TrendingDownIcon } from 'lucide-react';
import './MonthlyTransactionHistory.css';

const MonthlyTransactionHistory = ({ transactions = [] }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyTransactions, setMonthlyTransactions] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netAmount: 0,
    transactionCount: 0
  });

  // Danh sách tháng
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Lấy danh sách năm có giao dịch
  const getAvailableYears = () => {
    const years = new Set();
    transactions.forEach(transaction => {
      if (transaction.date) {
        let year;
        if (transaction.date.includes('/')) {
          // Format DD/MM/YYYY
          const parts = transaction.date.split('/');
          year = parseInt(parts[2]);
        } else if (transaction.date.includes('-')) {
          // Format YYYY-MM-DD
          year = parseInt(transaction.date.split('-')[0]);
        }
        if (year && !isNaN(year)) {
          years.add(year);
        }
      }
    });
    
    // Thêm năm hiện tại nếu chưa có
    years.add(new Date().getFullYear());
    
    return Array.from(years).sort((a, b) => b - a);
  };

  // Lấy danh sách tháng có giao dịch trong năm được chọn
  const getAvailableMonths = () => {
    const monthsWithData = new Set();
    transactions.forEach(transaction => {
      if (transaction.date) {
        let month, year;
        if (transaction.date.includes('/')) {
          // Format DD/MM/YYYY
          const parts = transaction.date.split('/');
          month = parseInt(parts[1]) - 1; // Convert to 0-based index
          year = parseInt(parts[2]);
        } else if (transaction.date.includes('-')) {
          // Format YYYY-MM-DD
          const parts = transaction.date.split('-');
          year = parseInt(parts[0]);
          month = parseInt(parts[1]) - 1; // Convert to 0-based index
        }
        
        if (year === selectedYear && !isNaN(month)) {
          monthsWithData.add(month);
        }
      }
    });
    
    return Array.from(monthsWithData).sort((a, b) => a - b);
  };

  // Lọc giao dịch theo tháng và năm được chọn
  useEffect(() => {
    const filtered = transactions.filter(transaction => {
      if (!transaction.date) return false;
      
      let transactionMonth, transactionYear;
      
      if (transaction.date.includes('/')) {
        // Format DD/MM/YYYY
        const parts = transaction.date.split('/');
        transactionMonth = parseInt(parts[1]) - 1; // Convert to 0-based index
        transactionYear = parseInt(parts[2]);
      } else if (transaction.date.includes('-')) {
        // Format YYYY-MM-DD
        const parts = transaction.date.split('-');
        transactionYear = parseInt(parts[0]);
        transactionMonth = parseInt(parts[1]) - 1; // Convert to 0-based index
      }
      
      return transactionMonth === selectedMonth && transactionYear === selectedYear;
    });

    // Sắp xếp theo ngày
    const sorted = filtered.sort((a, b) => {
      const getDateForSort = (dateStr) => {
        if (!dateStr) return '';
        
        if (dateStr.includes('/')) {
          const [day, month, year] = dateStr.split('/');
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        
        return dateStr;
      };
      
      const dateA = getDateForSort(a.date);
      const dateB = getDateForSort(b.date);
      return dateB.localeCompare(dateA);
    });

    setMonthlyTransactions(sorted);

    // Tính toán thống kê
    const stats = sorted.reduce((acc, transaction) => {
      const amount = Math.abs(transaction.amount);
      if (transaction.type === 'income') {
        acc.totalIncome += amount;
      } else {
        acc.totalExpense += amount;
      }
      acc.transactionCount++;
      return acc;
    }, {
      totalIncome: 0,
      totalExpense: 0,
      transactionCount: 0
    });

    stats.netAmount = stats.totalIncome - stats.totalExpense;
    setMonthlyStats(stats);
  }, [transactions, selectedMonth, selectedYear]);

  // Format số tiền
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(Math.abs(amount));
  };

  // Chuyển tháng trước/sau
  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 11) {
        setSelectedMonth(0);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };

  const availableYears = getAvailableYears();
  const availableMonths = getAvailableMonths();

  return (
    <div className="monthly-history-container">
      {/* Header với điều hướng tháng */}
      <div className="month-navigation">
        <button 
          onClick={() => navigateMonth('prev')}
          className="nav-button"
          title="Previous month"
        >
          <ChevronLeftIcon size={20} />
        </button>
        
        <div className="month-selector">
          <div className="current-month">
            <CalendarIcon size={20} />
            <span className="month-text">
              {months[selectedMonth]} {selectedYear}
            </span>
          </div>
          
          <div className="selector-dropdowns">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="month-select"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>
                  {month}
                </option>
              ))}
            </select>
            
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="year-select"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <button 
          onClick={() => navigateMonth('next')}
          className="nav-button"
          title="Next month"
        >
          <ChevronRightIcon size={20} />
        </button>
      </div>

      {/* Thống kê tháng */}
      <div className="monthly-stats">
        <div className="stat-card income">
          <div className="stat-icon">
            <TrendingUpIcon size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Total Income</div>
            <div className="stat-value">+{formatAmount(monthlyStats.totalIncome)} đ</div>
          </div>
        </div>
        
        <div className="stat-card expense">
          <div className="stat-icon">
            <TrendingDownIcon size={24} />
          </div>
          <div className="stat-info">
            <div className="stat-label">Total Expense</div>
            <div className="stat-value">-{formatAmount(monthlyStats.totalExpense)} đ</div>
          </div>
        </div>
        
        <div className={`stat-card net ${monthlyStats.netAmount >= 0 ? 'positive' : 'negative'}`}>
          <div className="stat-icon">
            {monthlyStats.netAmount >= 0 ? 
              <TrendingUpIcon size={24} /> : 
              <TrendingDownIcon size={24} />
            }
          </div>
          <div className="stat-info">
            <div className="stat-label">Net Amount</div>
            <div className="stat-value">
              {monthlyStats.netAmount >= 0 ? '+' : '-'}
              {formatAmount(monthlyStats.netAmount)} đ
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách giao dịch */}
      <div className="transactions-section">
        <div className="section-header">
          <h3>Transactions ({monthlyStats.transactionCount})</h3>
          {availableMonths.length > 0 && (
            <div className="months-with-data">
              <span>Months with data: </span>
              {availableMonths.map((monthIndex, index) => (
                <button
                  key={monthIndex}
                  onClick={() => setSelectedMonth(monthIndex)}
                  className={`month-chip ${monthIndex === selectedMonth ? 'active' : ''}`}
                >
                  {months[monthIndex].substring(0, 3)}
                </button>
              ))}
            </div>
          )}
        </div>

        {monthlyTransactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <div className="empty-title">No transactions found</div>
            <div className="empty-subtitle">
              No transactions recorded for {months[selectedMonth]} {selectedYear}
            </div>
          </div>
        ) : (
          <div className="transactions-list">
            {monthlyTransactions.map(transaction => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onDelete={() => {}} // Disable delete in history view
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthlyTransactionHistory;