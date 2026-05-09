import axios from 'axios';
import authService from './auth';

import BASE_URL from '../config';
const API_URL = `${BASE_URL}/configuraciones`;

const configService = {
  getAll: async () => {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  update: async (clave, valor) => {
    const token = authService.getToken();
    const response = await axios.put(`${API_URL}/${clave}?valor=${valor}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

export default configService;
