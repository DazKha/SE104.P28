import axios from 'axios';

const API_URL = 'http://localhost:3000/api/savings';
axios.defaults.withCredentials = true;

const getToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

const savingService = {
  getAll: async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log('Fetching savings with token:', token ? 'Token exists' : 'No token');
      
      const res = await axios.get(API_URL, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      console.log('Savings fetched successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error in savingService.getAll:', error.response?.data || error.message);
      throw error;
    }
  },
  
  create: async (goal) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log('Creating saving goal:', goal);
      
      const res = await axios.post(API_URL, goal, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      console.log('Saving goal created successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error in savingService.create:', error.response?.data || error.message);
      throw error;
    }
  },
  
  update: async (id, data) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log('Updating saving goal:', id, data);
      
      const res = await axios.put(`${API_URL}/${id}`, data, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      console.log('Saving goal updated successfully:', res.data);
      return res.data;
    } catch (error) {
      console.error('Error in savingService.update:', error.response?.data || error.message);
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log('Deleting saving goal:', id);
      
      await axios.delete(`${API_URL}/${id}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      console.log('Saving goal deleted successfully');
    } catch (error) {
      console.error('Error in savingService.delete:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default savingService; 