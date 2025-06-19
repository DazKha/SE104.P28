import React from 'react';
import ExpenseItem from './ExpenseItem';
import './RecentExpenses.css';

// const RecentExpenses = ({ expenses }) => {
//   return (
//     <div className="card expenses-card">
//       <div className="card-header">
//         <h2>Recent Expenses</h2>
//       </div>
//       <div className="expense-list">
//         {expenses && expenses.length > 0 ? (
//           expenses.map((expense, index) => (
//             <ExpenseItem 
//               key={expense.id || `expense-${index}`}
//               date={expense.date}
//               description={expense.description}
//               amount={expense.amount}
//               category={expense.category}
//               type={expense.type}
//             />
//           ))
//         ) : (
//           <div className="no-expenses">
//             <p>No recent transactions</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };



const RecentExpenses = ({ expenses }) => {


  // Sắp xếp theo ngày giảm dần
  const sortedExpenses = (expenses || []).slice().sort((a, b) => {
    const parseDate = (dateStr) => {
      if (!dateStr) return 0;
      
      if (dateStr.includes('/')) {
        // DD/MM/YYYY
        const [day, month, year] = dateStr.split('/');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).getTime();
      }
      if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts[0].length === 4) {
          // YYYY-MM-DD
          return new Date(dateStr).getTime();
        } else if (parts[2].length === 4) {
          // DD-MM-YYYY
          const [day, month, year] = parts;
          return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).getTime();
        }
      }
      // ISO hoặc các định dạng khác
      return new Date(dateStr).getTime();
    };
    
    return parseDate(b.date) - parseDate(a.date); // mới nhất lên đầu
  });

  // Lấy 5 giao dịch gần nhất
  const recentExpenses = sortedExpenses.slice(0, 5);

  return (
    <div className="card expenses-card">
      <div className="card-header">
        <h2>Recent Transactions</h2>
      </div>
      <div className="expense-list">
        {recentExpenses && recentExpenses.length > 0 ? (
          recentExpenses.map((expense, index) => (
            <ExpenseItem 
              key={expense.id || `expense-${index}`}
              date={expense.date}
              description={expense.description}
              amount={expense.amount}
              category={expense.category}
              type={expense.type}
            />
          ))
        ) : (
          <div className="no-expenses">
            <p>No recent transactions</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentExpenses;