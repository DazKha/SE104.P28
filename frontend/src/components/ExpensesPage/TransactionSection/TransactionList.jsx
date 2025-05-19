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
      result = result.filter(transaction => transaction.amount > 0);
    } else if (filter === 'expense') {
      result = result.filter(transaction => transaction.amount < 0);
    }
    
    // Lọc theo từ khóa tìm kiếm
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(transaction => 
        transaction.description.toLowerCase().includes(query) || 
        transaction.category.toLowerCase().includes(query)
      );
    }
    
    // Sắp xếp theo ngày tháng giảm dần (mới nhất lên đầu)
    result = result.sort((a, b) => {
      const dateA = a.date.split('/').reverse().join('');
      const dateB = b.date.split('/').reverse().join('');
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
          <SearchIcon className="search-icon" size={16} />
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