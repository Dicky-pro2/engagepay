import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Toaster from './components/Toaster';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import DashboardLayout from './components/layout/DashboardLayout';
import Overview from './pages/OverView';
import Tasks from './pages/Tasks';
import Wallet from './pages/Wallet';
import { useAuthStore } from './store/authStore';
import Submissions from './pages/Submissions';

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Landing />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Signup />} />
        <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/dashboard" /> : <ForgotPassword />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" />}>
          <Route index element={<Overview />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="submissions" element={<Submissions />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}