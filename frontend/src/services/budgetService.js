import axios from 'axios';
import transactionService from './transactionService';

const API_URL = 'http://localhost:3000/api/budgets';
axios.defaults.withCredentials = true;

const getToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

const budgetService = {
  getAll: async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log('Fetching budgets with token:', token ? 'Token exists' : 'No token');
      
      // Lấy budgets cho nhiều tháng gần đây
      const currentDate = new Date();
      const budgets = [];
      
      // Lấy budgets cho 6 tháng gần đây
      for (let i = 0; i < 6; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        try {
          const res = await axios.get(`${API_URL}?month=${monthStr}`, { 
            headers: { Authorization: `Bearer ${token}` } 
          });
          
          if (res.data && res.data.length > 0) {
            budgets.push(...res.data);
          }
        } catch (err) {
          // Bỏ qua lỗi cho tháng cụ thể
          console.log(`No budget found for month ${monthStr}`);
        }
      }
      
      console.log('Budgets fetched successfully:', budgets);
      return budgets;
    } catch (error) {
      console.error('Error in budgetService.getAll:', error.response?.data || error.message);
      throw error;
    }
  },
  
  create: async (budgetData) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log('Creating budget:', budgetData);
      
      const res = await axios.post(API_URL, budgetData, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      console.log('Budget created successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error in budgetService.create:', error.response?.data || error.message);
      throw error;
    }
  },
  
  update: async (id, data) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log('Updating budget:', id, data);
      
      const res = await axios.put(`${API_URL}/${id}`, data, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      console.log('Budget updated successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error in budgetService.update:', error.response?.data || error.message);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log('Deleting budget:', id);
      
      await axios.delete(`${API_URL}/${id}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      console.log('Budget deleted successfully');
    } catch (error) {
      console.error('Error in budgetService.delete:', error.response?.data || error.message);
      throw error;
    }
  },

  calculateUsedAmount: async (month) => {
    try {
      const allTransactions = await transactionService.getAllTransactions();
      console.log('All transactions:', allTransactions);
      const filtered = allTransactions.filter(t => t.type === 'outcome' && t.date.startsWith(month));
      console.log('Filtered transactions for month', month, filtered);
      const usedAmount = filtered.reduce((sum, t) => sum + t.amount, 0);
      return usedAmount;
    } catch (error) {
      console.error('Error calculating used amount:', error);
      return 0;
    }
  },

  getAllWithUsedAmount: async () => {
    try {
      const budgets = await budgetService.getAll();
      const budgetsWithUsed = await Promise.all(budgets.map(async (budget) => {
        const used = await budgetService.calculateUsedAmount(budget.month);
        return { ...budget, used };
      }));
      return budgetsWithUsed;
    } catch (error) {
      console.error('Error getting budgets with used amount:', error);
      throw error;
    }
  }
};

export default budgetService; 