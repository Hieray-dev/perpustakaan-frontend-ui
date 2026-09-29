import axios from 'axios';

const api = axios.create({
  baseURL: 'https://backend-perpustakaan-production-6f7f.up.railway.app',
});

// Lampirkan token JWT (Bearer) ke tiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
