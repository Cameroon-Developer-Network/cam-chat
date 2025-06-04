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

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jwt_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: async (username, password) => {
    const response = await api.post('/api/auth/login', { username, password });
    const { token, user } = response.data;
    localStorage.setItem('jwt_token', token);
    return { token, user };
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
  getMessages: async (chatId, { page = 1, limit = 50 } = {}) => {
    const response = await api.get(`/api/chats/${chatId}/messages`, {
      params: { page, limit },
    });
    return {
      messages: response.data.messages,
      hasMore: response.data.has_more,
      total: response.data.total,
    };
  },
  sendMessage: async (chatId, content) => {
    const response = await api.post(`/api/chats/${chatId}/messages`, { content });
    return response.data;
  },
  markMessagesSeen: async (chatId, messageIds) => {
    await api.post(`/api/chats/${chatId}/messages/seen`, { messageIds });
  },
  sendTypingStatus: async (chatId, isTyping) => {
    await api.post(`/api/chats/${chatId}/typing`, { isTyping });
  },
};

export default api; 