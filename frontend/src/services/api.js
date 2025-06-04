import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  login: async (username, password) => {
    const response = await api.post('/api/auth/login', { username, password });
    const { token } = response.data;
    localStorage.setItem('jwt_token', token);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('jwt_token');
  },
  isAuthenticated: () => {
    return !!localStorage.getItem('jwt_token');
  },
};

export const chats = {
  list: async () => {
    const response = await api.get('/api/chats');
    return response.data;
  },
  getMessages: async (chatId) => {
    const response = await api.get(`/api/chats/${chatId}/messages`);
    return response.data;
  },
  sendMessage: async (chatId, content) => {
    const response = await api.post(`/api/chats/${chatId}/messages`, { content });
    return response.data;
  },
};

export default api; 