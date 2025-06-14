import React, { useState, useEffect, useMemo } from 'react';
import ReportChart from './ReportChart/ReportChart.jsx';
import { PieChart, BarChart, TrendingUp, TrendingDown, Calendar, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import './ReportSection.css';

const ReportSection = ({ transactions = [] }) => {
  // State cho month/year selector
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
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

  // Helper function để parse date
  const parseTransactionDate = (dateString) => {
    if (!dateString) return null;
    
    // Xử lý format DD/MM/YYYY
    if (dateString.includes('/')) {
      const [day, month, year] = dateString.split('/').map(Number);
      return { day, month: month - 1, year }; // month - 1 vì JavaScript Date sử dụng 0-based month
    }
    
    // Xử lý format YYYY-MM-DD
    if (dateString.includes('-')) {
      const [year, month, day] = dateString.split('-').map(Number);
      return { day, month: month - 1, year };
    }
    
    return null;
  };

  // Filter transactions theo tháng được chọn
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const parsedDate = parseTransactionDate(transaction.date);
      if (!parsedDate) return false;
      return parsedDate.month === selectedMonth && parsedDate.year === selectedYear;
    });
  }, [transactions, selectedMonth, selectedYear]);

  // Tính toán các báo cáo tổng quan dựa trên transactions đã filter
  useEffect(() => {
    console.log('=== REPORT SECTION DEBUG ===');
    console.log('All transactions received:', transactions?.length || 0);
    console.log('Filtered transactions for month:', filteredTransactions?.length || 0);
    console.log('Selected month/year:', selectedMonth + 1, selectedYear);
    if (filteredTransactions?.length > 0) {
      console.log('Sample filtered transaction:', {
        date: filteredTransactions[0].date,
        category_name: filteredTransactions[0].category_name,
        type: filteredTransactions[0].type,
        amount: filteredTransactions[0].amount
      });
    }
    console.log('=== END REPORT SECTION DEBUG ===');
    
    if (filteredTransactions.length === 0) {
      // Reset summary if no transactions
      setSummary({
        balance: 0,
        income: 0,
        expense: 0,
        thisMonth: { income: 0, expense: 0 },
        lastMonth: { income: 0, expense: 0 }
      });
      return;
    }

    // Tính toán tổng thu nhập và chi tiêu cho tháng được chọn
    const totalIncome = filteredTransactions
      .filter(transaction => transaction.type === 'income')
      .reduce((sum, transaction) => sum + Math.abs(parseFloat(transaction.amount)), 0);
    
    const totalExpense = filteredTransactions
      .filter(transaction => transaction.type === 'outcome')
      .reduce((sum, transaction) => sum + Math.abs(parseFloat(transaction.amount)), 0);

    // Tính toán cho tháng trước để so sánh
    const lastMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const lastYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
    
    const lastMonthTransactions = transactions.filter(transaction => {
      const parsedDate = parseTransactionDate(transaction.date);
      if (!parsedDate) return false;
      return parsedDate.month === lastMonth && parsedDate.year === lastYear;
    });

    const lastMonthIncome = lastMonthTransactions
      .filter(transaction => transaction.type === 'income')
      .reduce((sum, transaction) => sum + Math.abs(parseFloat(transaction.amount)), 0);
    
    const lastMonthExpense = lastMonthTransactions
      .filter(transaction => transaction.type === 'outcome')
      .reduce((sum, transaction) => sum + Math.abs(parseFloat(transaction.amount)), 0);

    // Cập nhật báo cáo tổng quan
    setSummary({
      balance: totalIncome - totalExpense,
      income: totalIncome,
      expense: totalExpense,
      thisMonth: {
        income: totalIncome,
        expense: totalExpense
      },
      lastMonth: {
        income: lastMonthIncome,
        expense: lastMonthExpense
      }
    });
  }, [filteredTransactions, transactions, selectedMonth, selectedYear]);

  // Navigation handlers
  const goToPreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

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
  const getMonthName = (month, year) => {
    const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
                  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    return `${months[month]} ${year}`;
  };

  // Xử lý xuất báo cáo dưới dạng CSV
  const exportToCSV = () => {
    let csvContent = "Date,Description,Category,Amount,Type\n";
    
    filteredTransactions.forEach(transaction => {
      const category = transaction.category_name || transaction.category || 'Uncategorized';
      const description = transaction.note || transaction.description || '';
      csvContent += `${transaction.date},"${description}","${category}",${transaction.amount},"${transaction.type}"\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const monthYear = `${selectedYear}-${(selectedMonth + 1).toString().padStart(2, '0')}`;
    link.setAttribute('href', url);
    link.setAttribute('download', `finance_report_${monthYear}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="report-section">
      <div className="report-header">
        <h2>Report</h2>
      </div>

      {/* Month Navigator */}
      <div className="month-navigator">
        <button className="nav-button" onClick={goToPreviousMonth}>
          <ChevronLeft size={20} />
        </button>
        <div className="month-display">
          <Calendar size={20} />
          <h3>{getMonthName(selectedMonth, selectedYear)}</h3>
        </div>
        <button className="nav-button" onClick={goToNextMonth}>
          <ChevronRight size={20} />
        </button>
      </div>



      {/* Phần biểu đồ */}
      {filteredTransactions.length === 0 ? (
        <div className="no-data">
          <PieChart size={48}/>
          <h3>Không có dữ liệu để hiển thị</h3>
          <p>Không có giao dịch nào trong {getMonthName(selectedMonth, selectedYear).toLowerCase()}.</p>
        </div>
      ) : (
        <div className="chart-section">
          <ReportChart transactions={filteredTransactions} />
        </div>
      )}
    </div>
  );
};

export default ReportSection;