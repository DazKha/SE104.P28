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
      console.log('=== TRANSACTION SERVICE - ADD TRANSACTION ===');
      console.log('Token status:', token ? 'Found' : 'Not found');
      console.log('Transaction data received in service:', transaction);
      console.log('transaction.note:', transaction.note);
      console.log('transaction.description:', transaction.description);
      
      if (!token) {
        // Use public API if no token
        console.log('Using PUBLIC API endpoint:', `${PUBLIC_API_URL}/transactions`);
        console.log('Sending to backend:', JSON.stringify(transaction, null, 2));
        const response = await axios.post(`${PUBLIC_API_URL}/transactions`, transaction);
        console.log('Backend response:', response.data);
        return response.data;
      }

      console.log('Using PRIVATE API endpoint:', `${API_URL}/transactions`);
      console.log('Sending to backend:', JSON.stringify(transaction, null, 2));
      const response = await axios.post(`${API_URL}/transactions`, transaction, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Backend response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error adding transaction:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      console.error('Error response headers:', error.response?.headers);
      throw error;
    }
  },

  // Cập nhật giao dịch
  updateTransaction: async (id, transaction) => {
    try {
      const token = getToken();
      console.log('=== UPDATE TRANSACTION DEBUG ===');
      console.log('Transaction ID:', id);
      console.log('Transaction data:', transaction);
      console.log('Token status:', token ? 'Found' : 'Not found');
      
      // TEMPORARY: Always use public API for testing
      const publicUrl = `${PUBLIC_API_URL}/transactions/${id}`;
      console.log('FORCE Using PUBLIC API endpoint for update:', publicUrl);
      const response = await axios.put(publicUrl, transaction);
      console.log('Public API response:', response.data);
      return response.data;
      
      // Original logic commented out for testing
      /*
      if (!token) {
        // Use public API if no token
        const publicUrl = `${PUBLIC_API_URL}/transactions/${id}`;
        console.log('Using PUBLIC API endpoint for update:', publicUrl);
        const response = await axios.put(publicUrl, transaction);
        console.log('Public API response:', response.data);
        return response.data;
      }

      console.log('Using PRIVATE API endpoint for update:', `${API_URL}/transactions/${id}`);
      const response = await axios.put(`${API_URL}/transactions/${id}`, transaction, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Private API response:', response.data);
      return response.data;
      */
    } catch (error) {
      console.error('=== UPDATE TRANSACTION ERROR ===');
      console.error('Error updating transaction:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      console.error('Error request data:', error.config?.data);
      console.error('Error request URL:', error.config?.url);
      throw error;
    }
  },

  // Xóa giao dịch
  deleteTransaction: async (id) => {
    try {
      const token = getToken();
      
      // TEMPORARY: Always use public API for testing
      const publicUrl = `${PUBLIC_API_URL}/transactions/${id}`;
      console.log('FORCE Using PUBLIC API endpoint for delete:', publicUrl);
      const response = await axios.delete(publicUrl);
      console.log('Public API delete response:', response.data);
      return response.data;
      
      // Original logic commented out for testing
      /*
      if (!token) {
        // Use public API if no token
        console.log('Using PUBLIC API endpoint for delete:', `${PUBLIC_API_URL}/transactions/${id}`);
        const response = await axios.delete(`${PUBLIC_API_URL}/transactions/${id}`);
        return response.data;
      }

      console.log('Using PRIVATE API endpoint for delete:', `${API_URL}/transactions/${id}`);
      const response = await axios.delete(`${API_URL}/transactions/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
      */
    } catch (error) {
      console.error('Error deleting transaction:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      throw error;
    }
  }
};

export default transactionService; 