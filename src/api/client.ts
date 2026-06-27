import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { clearAuthSession, getToken } from '../services/storage';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(async config => {
  const token = await getToken();

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
    if (error?.response?.status === 401) {
      await clearAuthSession();
    }
    return Promise.reject(error);
  }
);

export default api;