import axios from 'axios';

// Configuração base da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const UPLOADS_BASE_URL = import.meta.env.VITE_UPLOADS_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API específica para uploads (com timeout maior)
export const uploadApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 segundos para uploads
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Interceptor para adicionar token de autenticação
const addAuthToken = (config: any) => {
  const token = localStorage.getItem('fiscalmind_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

api.interceptors.request.use(addAuthToken);
uploadApi.interceptors.request.use(addAuthToken);

// Interceptor para tratamento global de erros
const handleError = (error: any) => {
  if (error.response?.status === 401) {
    // Redirecionar para login se não autorizado
    localStorage.removeItem('fiscalmind_token');
    localStorage.removeItem('fiscalmind_user');
    window.location.href = '/login';
  }
  
  // Log de erros em desenvolvimento
  if (import.meta.env.MODE === 'development') {
    console.error('API Error:', error.response?.data || error.message);
  }
  
  return Promise.reject(error);
};

api.interceptors.response.use(
  (response) => response,
  handleError
);

uploadApi.interceptors.response.use(
  (response) => response,
  handleError
);

// Helper para verificar status da API
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await api.get('/health');
    return response.status === 200;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};

// Helper para login (se necessário)
export const setAuthToken = (token: string) => {
  localStorage.setItem('fiscalmind_token', token);
};

// Helper para logout
export const clearAuth = () => {
  localStorage.removeItem('fiscalmind_token');
  localStorage.removeItem('fiscalmind_user');
};