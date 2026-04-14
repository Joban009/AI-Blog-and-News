import { create } from 'zustand';
import { authApi } from '../services/api';

export const useAuthStore = create((set, get) => ({
  user:    null,
  token:   localStorage.getItem('token') || null,
  loading: true,

  setToken(token) {
    localStorage.setItem('token', token);
    set({ token });
  },

  async fetchMe() {
    try {
      const { data } = await authApi.me();
      set({ user: data.user, loading: false });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null, loading: false });
    }
  },

  async login(credentials) {
    const { data } = await authApi.login(credentials);
    localStorage.setItem('token', data.token);
    set({ token: data.token, user: data.user });
    return data;
  },

  async register(payload) {
    const { data } = await authApi.register(payload);
    localStorage.setItem('token', data.token);
    set({ token: data.token, user: data.user });
    return data;
  },

  logout() {
    localStorage.removeItem('token');
    set({ user: null, token: null });
    window.location.href = '/';
  },

  isAdmin: () => get().user?.role_name === 'admin',
  isAuthenticated: () => !!get().user,
}));
