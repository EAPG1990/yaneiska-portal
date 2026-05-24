import axios from 'axios';
import authService from './auth';
import BASE_URL from '../config';

const API_URL = `${BASE_URL}/pagos`;

const pagosService = {
  getPagosMensuales: async (mes, anio) => {
    const token = authService.getToken();
    const response = await axios.get(`${API_URL}/mensuales?mes=${mes}&anio=${anio}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  registrarPago: async (payload) => {
    const token = authService.getToken();
    const response = await axios.post(`${API_URL}/registrar`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};

export default pagosService;
