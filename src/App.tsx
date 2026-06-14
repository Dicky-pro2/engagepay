import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Toaster from './components/Toaster';
import Landing from './pages/Landing';
import DashboardLayout from './components/layout/DashboardLayout';
import Overview from './pages/Overview';
import Tasks from './pages/Tasks';
import Wallet from './pages/Wallet';
import { useAuthStore } from './store/authStore';

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Landing />} />

        <Route path="/dashboard" element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/" />}>
          <Route index element={<Overview />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="wallet" element={<Wallet />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}