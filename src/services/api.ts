import axios from 'axios';
import { getSession } from '../utils/tokenStorage';

// Mantén aquí la IP que ya te funcionó (ej. http://192.168.1.70:8000 o http://127.0.0.1:8000)
export const BASE_URL = 'http://192.168.1.71:8000';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 10000,
});

// Adjunta el JWT automáticamente si existe una sesión activa
api.interceptors.request.use(async (config) => {
  const { token } = await getSession();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;