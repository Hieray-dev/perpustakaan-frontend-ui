import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080',
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