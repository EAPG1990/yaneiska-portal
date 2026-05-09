import axios from 'axios';
import authService from './auth';

import BASE_URL from '../config';
const API_URL = `${BASE_URL}/docentes`;

const docentesService = {
  getAll: async () => {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  create: async (docenteData) => {
    const token = authService.getToken();
    const response = await axios.post(`${API_URL}/`, docenteData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  update: async (id, docenteData) => {
    const token = authService.getToken();
    const response = await axios.put(`${API_URL}/${id}`, docenteData, {
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

  // Obtener todas las clases registradas en un mes/año específico
  getClasesMensuales: async (mes, anio) => {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/clases/`, {
      params: { mes, anio },
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Registrar horas de clase
  registrarClase: async (claseData) => {
    const token = authService.getToken();
    const response = await axios.post(`${API_URL}/clases/`, claseData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

export default docentesService;
