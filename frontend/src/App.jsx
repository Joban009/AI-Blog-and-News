import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Layout
import MainLayout  from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';

// Public pages
import HomePage       from './pages/HomePage';
import BlogListPage   from './pages/BlogListPage';
import PostDetailPage from './pages/PostDetailPage';
import LoginPage      from './pages/LoginPage';
import RegisterPage   from './pages/RegisterPage';

// User pages
import SubmitPostPage from './pages/SubmitPostPage';

// Admin pages
import AdminDashboard    from './pages/admin/AdminDashboard';
import AdminPosts        from './pages/admin/AdminPosts';
import AdminComments     from './pages/admin/AdminComments';
import AdminUsers        from './pages/admin/AdminUsers';
import AdminCreatePost   from './pages/admin/AdminCreatePost';
import AdminEditPost     from './pages/admin/AdminEditPost';

// Guards
function RequireAuth({ children }) {
  const user = useAuthStore(s => s.user);
  const loading = useAuthStore(s => s.loading);
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
}

function RequireAdmin({ children }) {
  const user = useAuthStore(s => s.user);
  const loading = useAuthStore(s => s.loading);
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role_name !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const fetchMe = useAuthStore(s => s.fetchMe);
  const token   = useAuthStore(s => s.token);

  useEffect(() => { if (token) fetchMe(); else useAuthStore.setState({ loading: false }); }, []);

  return (
    <Routes>
      {/* Public */}
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="blog" element={<BlogListPage type="blog" />} />
        <Route path="news" element={<BlogListPage type="news" />} />
        <Route path="posts/:slug" element={<PostDetailPage />} />
        <Route path="login"    element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* Authenticated users */}
        <Route path="submit" element={<RequireAuth><SubmitPostPage /></RequireAuth>} />
      </Route>

      {/* Admin */}
      <Route path="admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
        <Route index           element={<AdminDashboard />} />
        <Route path="posts"    element={<AdminPosts />} />
        <Route path="posts/new"  element={<AdminCreatePost />} />
        <Route path="posts/:id/edit" element={<AdminEditPost />} />
        <Route path="comments" element={<AdminComments />} />
        <Route path="users"    element={<AdminUsers />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
