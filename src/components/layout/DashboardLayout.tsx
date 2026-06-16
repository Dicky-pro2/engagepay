import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { LayoutDashboard, ListChecks, Wallet as WalletIcon, LogOut, Bell, ClipboardList } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { notify } from '../../utils/notify';
import NotificationPanel from './NotificationPanel';

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const notifications = useAppStore((s) => s.notifications);
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const isAdvertiser = user?.role === 'advertiser';

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleLogout = () => {
    logout();
    notify.info('Logged out successfully');
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
    { to: '/dashboard/tasks', icon: ListChecks, label: 'Tasks' },
    { to: '/dashboard/wallet', icon: WalletIcon, label: 'Wallet' },
    ...(isAdvertiser ? [] : [{ to: '/dashboard/submissions', icon: ClipboardList, label: 'Submissions'}]),
  ];

  return (
    <div className="min-h-screen bg-navy">
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-navy/90 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="font-sora font-extrabold text-xl">
            Engage<span className="text-violet-light">Pay</span>
          </div>

          {/* Desktop nav tabs */}
          <div className="hidden sm:flex items-center gap-1 bg-card border border-border rounded-full p-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                    isActive
                      ? isAdvertiser
                        ? 'bg-violet text-white'
                        : 'bg-emerald2 text-white'
                      : 'text-slatec hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wallet balance */}
            <div className="bg-card border border-border rounded-full px-3 sm:px-4 py-1.5 text-sm font-semibold flex items-center gap-1.5">
              <span className="text-amber-400">🪙</span>
              <span>{(user?.walletBalance ?? 0).toLocaleString()}</span>
            </div>

            {/* Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications((v) => !v)}
                className="border border-border rounded-full p-1.5 sm:p-2 text-slatec hover:text-white hover:border-violet-light transition-all relative"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-violet rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <NotificationPanel onClose={() => setShowNotifications(false)} />
                )}
              </AnimatePresence>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              title="Logout"
              className="border border-border rounded-full p-1.5 sm:p-2 text-slatec hover:border-red-500/50 hover:text-red-400 transition-all"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="sm:hidden flex items-center justify-around border-t border-border px-2 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-4 py-1 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? isAdvertiser
                      ? 'text-violet-light'
                      : 'text-emerald2'
                    : 'text-slatec'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}