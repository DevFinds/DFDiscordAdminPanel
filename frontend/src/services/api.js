import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const auth = {
  loginUrl: () => `${API_URL}/auth/discord`,
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout')
};

export const servers = {
  getAll: () => api.get('/api/servers'),
  getOne: (guildId) => api.get(`/api/servers/${guildId}`)
};

export const guild = {
  getRoles: (guildId) => api.get(`/api/settings/${guildId}/roles`),
  getChannels: (guildId) => api.get(`/api/settings/${guildId}/channels`)
};

export const settings = {
  updateWelcome: (guildId, data) => api.put(`/api/settings/${guildId}/welcome`, data),
  updateAutoRole: (guildId, data) => api.put(`/api/settings/${guildId}/autorole`, data),
  addReactionRole: (guildId, data) => api.post(`/api/settings/${guildId}/reactionrole`, data),
  deleteReactionRole: (guildId, messageId, emoji) => 
    api.delete(`/api/settings/${guildId}/reactionrole/${messageId}/${encodeURIComponent(emoji)}`),
  addRSSFeed: (guildId, data) => api.post(`/api/settings/${guildId}/rss`, data),
  deleteRSSFeed: (guildId, feedId) => api.delete(`/api/settings/${guildId}/rss/${feedId}`)
};

export const buildin = {
  getFeeds: (guildId) => api.get(`/api/settings/${guildId}/buildin`),
  addFeed: (guildId, data) => api.post(`/api/settings/${guildId}/buildin`, data),
  deleteFeed: (guildId, feedId) => api.delete(`/api/settings/${guildId}/buildin/${feedId}`),
  testFeed: (guildId, data) => api.post(`/api/settings/${guildId}/buildin/test`, data)
};

export default api;