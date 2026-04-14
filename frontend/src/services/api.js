import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth ─────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  me:       ()     => api.get('/auth/me'),
};

// ── Posts ────────────────────────────────────────────────
export const postsApi = {
  list:    (params) => api.get('/posts', { params }),
  get:     (slug)   => api.get(`/posts/${slug}`),
  create:  (data)   => api.post('/posts', data),
  update:  (id, data) => api.put(`/posts/${id}`, data),
  delete:  (id)     => api.delete(`/posts/${id}`),
  publish: (id)     => api.post(`/posts/${id}/publish`),
  reject:  (id, reason) => api.post(`/posts/${id}/reject`, { reason }),
};

// ── Comments ─────────────────────────────────────────────
export const commentsApi = {
  list:    (post_id) => api.get('/comments', { params: { post_id } }),
  create:  (data)    => api.post('/comments', data),
  delete:  (id)      => api.delete(`/comments/${id}`),
  approve: (id)      => api.patch(`/comments/${id}/approve`),
  reject:  (id)      => api.patch(`/comments/${id}/reject`),
};

// ── Admin ────────────────────────────────────────────────
export const adminApi = {
  dashboard:   ()       => api.get('/admin/dashboard'),
  listPosts:   (params) => api.get('/admin/posts', { params }),
  listComments:(params) => api.get('/admin/comments', { params }),
  listUsers:   ()       => api.get('/admin/users'),
  updateUser:  (id, data) => api.patch(`/admin/users/${id}`, data),
};

// ── AI ───────────────────────────────────────────────────
export const aiApi = {
  generate: (data) => api.post('/ai/generate', data),
  improve:  (data) => api.post('/ai/improve', data),
};
