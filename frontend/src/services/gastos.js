import axios from 'axios';
import authService from './auth';

import BASE_URL from '../config';
const API_URL = `${BASE_URL}/gastos`;

const gastosService = {
  getMensuales: async (mes, anio) => {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/?mes=${mes}&anio=${anio}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  create: async (gastoData) => {
    const token = authService.getToken();
    const response = await axios.post(`${API_URL}/`, gastoData, {
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
  }
};

export default gastosService;
