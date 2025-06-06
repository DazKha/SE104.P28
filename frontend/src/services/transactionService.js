import axios from 'axios';

const API_URL = 'http://localhost:3000/api'; // Backend server
const PUBLIC_API_URL = 'http://localhost:3000/api/public'; // Public API

const getToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

const transactionService = {
  // Lấy tất cả giao dịch
  getAllTransactions: async () => {
    try {
      const token = getToken();
      
      if (!token) {
        // Use public API if no token
        const response = await axios.get(`${PUBLIC_API_URL}/transactions`);
        return response.data;
      }

      const response = await axios.get(`${API_URL}/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  getByMonth: async (month) => {
    try {
      const token = getToken();
      
      if (!token) {
        // Use public API if no token
        const response = await axios.get(`${PUBLIC_API_URL}/transactions?month=${month}`);
        return response.data;
      }

      const response = await axios.get(`${API_URL}/transactions?month=${month}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions by month:', error);
      throw error;
    }
  },

  // Thêm giao dịch mới
  addTransaction: async (transaction) => {
    try {
      const token = getToken();
      
      if (!token) {
        // Use public API if no token
        const response = await axios.post(`${PUBLIC_API_URL}/transactions`, transaction);
        return response.data;
      }

      const response = await axios.post(`${API_URL}/transactions`, transaction, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  },

  // Cập nhật giao dịch
  updateTransaction: async (id, transaction) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.put(`${API_URL}/transactions/${id}`, transaction, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  },

  // Xóa giao dịch
  deleteTransaction: async (id) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.delete(`${API_URL}/transactions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }
};

export default transactionService; 