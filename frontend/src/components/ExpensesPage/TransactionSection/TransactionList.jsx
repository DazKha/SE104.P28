import React, { useState, useEffect } from 'react';
import TransactionItem from './TransactionItem.jsx';
import { SearchIcon, XIcon } from 'lucide-react';
import './TransactionList.css';

const TransactionList = ({ transactions, onDelete }) => {
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Áp dụng bộ lọc khi danh sách giao dịch, bộ lọc hoặc truy vấn tìm kiếm thay đổi
  useEffect(() => {
    let result = [...transactions];
    
    // Lọc theo loại (thu nhập/chi tiêu/tất cả)
    if (filter === 'income') {
      result = result.filter(transaction => transaction.type === 'income');
    } else if (filter === 'expense') {
      result = result.filter(transaction => transaction.type === 'outcome');
    }
    
    // Lọc theo từ khóa tìm kiếm
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(transaction => {
        const description = transaction.note || transaction.description || '';
        const category = transaction.category_name || transaction.category || '';
        return description.toLowerCase().includes(query) || 
               category.toLowerCase().includes(query);
      });
    }
    
    // Sắp xếp theo ngày tháng giảm dần (mới nhất lên đầu)
    result = result.sort((a, b) => {
      // Handle both date formats from API and local data
      const getDateForSort = (dateStr) => {
        if (!dateStr) return '';
        
        // If date is in DD/MM/YYYY format, convert to YYYY-MM-DD for sorting
        if (dateStr.includes('/')) {
          const [day, month, year] = dateStr.split('/');
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        
        // If date is already in YYYY-MM-DD format, use as is
        return dateStr;
      };
      
      const dateA = getDateForSort(a.date);
      const dateB = getDateForSort(b.date);
      return dateB.localeCompare(dateA);
    });
    
    setFilteredTransactions(result);
  }, [transactions, filter, searchQuery]);

  // Tính tổng số giao dịch đã lọc
  const totalTransactions = filteredTransactions.length;

  return (
    <div className="transaction-list-container">
      <div className="list-controls">
        <div className="filter-buttons">
          <button
            onClick={() => setFilter('all')}
            className={`filter-button ${filter === 'all' ? 'active' : ''}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('income')}
            className={`filter-button income ${filter === 'income' ? 'active' : ''}`}
          >
            Income
          </button>
          <button
            onClick={() => setFilter('expense')}
            className={`filter-button expense ${filter === 'expense' ? 'active' : ''}`}
          >
            Expense
          </button>
        </div>
        
        <div className="search-container">
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="clear-search"
              title="Clear search"
            >
              <XIcon size={16} />
            </button>
          )}
        </div>
      </div>

      {totalTransactions === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <div className="empty-state-text">
            {searchQuery ? 'No transactions found matching your search' : 'No transactions to display'}
          </div>
          <div className="empty-state-subtext">
            {searchQuery ? 'Try different keywords' : 'Add your first transaction'}
          </div>
        </div>
      ) : (
        <div className="list-content">
          <div className="transaction-count">
            Showing {totalTransactions} transaction{totalTransactions !== 1 ? 's' : ''}
          </div>
          <div className="transactions">
            {filteredTransactions.map(transaction => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;