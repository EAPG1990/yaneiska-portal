import axios from 'axios';
import authService from './auth';

import BASE_URL from '../config';
const API_URL = `${BASE_URL}/alquileres`;

const alquileresService = {
  getMensuales: async (mes, anio) => {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/?mes=${mes}&anio=${anio}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  create: async (alquilerData) => {
    const token = authService.getToken();
    const response = await axios.post(`${API_URL}/`, alquilerData, {
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

  togglePago: async (id) => {
    const token = authService.getToken();
    const response = await axios.put(`${API_URL}/${id}/pagar`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

export default alquileresService;
