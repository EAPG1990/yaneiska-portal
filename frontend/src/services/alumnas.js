import axios from 'axios';
import authService from './auth';

import BASE_URL from '../config';
const API_URL = `${BASE_URL}/alumnas`;

const alumnasService = {
  getAll: async () => {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  create: async (alumnaData) => {
    const token = authService.getToken();
    const response = await axios.post(`${API_URL}/`, alumnaData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  delete: async (id) => {
    const token = authService.getToken();
    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  update: async (id, alumnaData) => {
    const token = authService.getToken();
    const response = await axios.put(`${API_URL}/${id}`, alumnaData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

export default alumnasService;
