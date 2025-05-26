import axios from 'axios';

const API_URL = 'http://localhost:3000/api/loans_debts';
axios.defaults.withCredentials = true;

const getToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

const loanService = {
  getAll: async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log('Fetching loans/debts with token:', token ? 'Token exists' : 'No token');
      
      const res = await axios.get(API_URL, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      console.log('Loans/debts fetched successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error in loanService.getAll:', error.response?.data || error.message);
      throw error;
    }
  },
  
  create: async (loanData) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log('Creating loan/debt:', loanData);
      
      const res = await axios.post(API_URL, loanData, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      console.log('Loan/debt created successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error in loanService.create:', error.response?.data || error.message);
      throw error;
    }
  },
  
  update: async (id, data) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log('Updating loan/debt:', id, data);
      
      const res = await axios.put(`${API_URL}/${id}`, data, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      console.log('Loan/debt updated successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error in loanService.update:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: `${API_URL}/${id}`,
        requestData: data
      });
      throw error;
    }
  },

  updateStatus: async (id, status) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log('Updating loan/debt status:', id, status);
      
      const res = await axios.patch(`${API_URL}/${id}/status`, { status }, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      console.log('Loan/debt status updated successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error in loanService.updateStatus:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: `${API_URL}/${id}/status`,
        requestData: { status }
      });
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log('Deleting loan/debt:', id);
      
      await axios.delete(`${API_URL}/${id}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      console.log('Loan/debt deleted successfully');
    } catch (error) {
      console.error('Error in loanService.delete:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default loanService; 