import React, { useState } from 'react';
import BalanceCard from './BalanceCard/BalanceCard.jsx';
import TransactionSection from './TransactionSection/index.jsx';
import ReportSection from './ReportSection/ReportSection.jsx';
import ExpenseChart from './ExpenseChart/ExpenseChart.jsx';

const ExpensesPage = () => {
  // Dữ liệu số dư hiện tại
  const [currentBalance, setCurrentBalance] = useState(19800000);
  
  // Dữ liệu giao dịch - Đây là dữ liệu chính sẽ được truyền xuống các component con
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      date: '2024-07-29',
      description: 'Lunch with colleagues',
      amount: 1200000,
      type: 'expense',
      category: 'food',
      categoryLabel: 'Ăn uống'
    },
    {
      id: 2,
      date: '2024-07-27',
      description: 'Monthly rent',
      amount: 5000000,
      type: 'expense',
      category: 'housing',
      categoryLabel: 'Thuê nhà'
    },
    {
      id: 3,
      date: '2024-07-26',
      description: 'Gas refill',
      amount: 500000,
      type: 'expense',
      category: 'transportation',
      categoryLabel: 'Di chuyển'
    },
    {
      id: 4,
      date: '2024-07-25',
      description: 'July Salary',
      amount: 25000000,
      type: 'income',
      category: 'salary',
      categoryLabel: 'Lương'
    }
  ]);

  // Dữ liệu báo cáo
  const reportData = [
    { name: 'Lương', value: 25000000, color: '#3182CE' },
    { name: 'Bán tự do', value: 5000000, color: '#38A169' }
  ];

  // Xử lý khi click vào nút Add
  const handleAddTransaction = () => {
    // Triển khai chức năng thêm giao dịch mới
    console.log('Add new transaction');
    // Có thể thêm modal hoặc form để nhập giao dịch mới
  };

  return (
    <div className="expenses-page bg-gray-900 min-h-screen p-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột bên trái (2/3 màn hình) */}
          <div className="lg:col-span-2">
            <BalanceCard 
              balance={currentBalance} 
              onAddClick={handleAddTransaction} 
            />
            
            {/* Phần biểu đồ chi tiêu */}
            <ExpenseChart transactions={transactions} />
            
            {/* Truyền dữ liệu xuống cho TransactionSection */}
            <TransactionSection transactions={transactions} />
          </div>
          
          {/* Cột bên phải (1/3 màn hình) */}
          <div className="lg:col-span-1">
            <ReportSection data={reportData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpensesPage;