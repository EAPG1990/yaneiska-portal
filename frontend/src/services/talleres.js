import axios from 'axios';
import authService from './auth';

import BASE_URL from '../config';
const API_URL = `${BASE_URL}/talleres`;

const talleresService = {
  getMensuales: async (mes, anio) => {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/?mes=${mes}&anio=${anio}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  create: async (tallerData) => {
    const token = authService.getToken();
    const response = await axios.post(`${API_URL}/`, tallerData, {
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

  togglePagoFacilitador: async (id) => {
    const token = authService.getToken();
    const response = await axios.put(`${API_URL}/${id}/pago-facilitador`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

export default talleresService;
