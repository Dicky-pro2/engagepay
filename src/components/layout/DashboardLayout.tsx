import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ListChecks, Wallet as WalletIcon, LogOut, RefreshCw } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { notify } from '../../utils/notify';

export default function DashboardLayout() {
  const { user, logout, switchRole } = useAuthStore();
  const navigate = useNavigate();
  const isAdvertiser = user?.role === 'advertiser';

  const handleSwitchRole = () => {
    const newRole = isAdvertiser ? 'earner' : 'advertiser';
    switchRole(newRole);
    notify.info(`Switched to ${newRole === 'advertiser' ? 'Advertiser' : 'Earner'} view`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
    { to: '/dashboard/tasks', icon: ListChecks, label: 'Tasks' },
    { to: '/dashboard/wallet', icon: WalletIcon, label: 'Wallet' },
  ];

  return (
    <div className="min-h-screen bg-navy">
      {/* Top Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-navy/90 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
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

          {/* Right side: wallet, switch, logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-card border border-border rounded-full px-3 sm:px-4 py-1.5 text-sm font-semibold flex items-center gap-1.5">
              <span className="text-amber-400">🪙</span>
              <span>{(user?.walletBalance ?? 0).toLocaleString()}</span>
            </div>
            <button
              onClick={handleSwitchRole}
              title="Switch role"
              className="border border-border rounded-full px-3 py-1.5 text-xs sm:text-sm text-slatec hover:border-violet-light hover:text-white transition-all flex items-center gap-1.5"
            >
              <RefreshCw size={14} />
              <span className="hidden sm:inline">Switch</span>
            </button>
            <button
              onClick={handleLogout}
              title="Logout"
              className="border border-border rounded-full p-1.5 sm:p-2 text-slatec hover:border-red-500/50 hover:text-red-400 transition-all"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>

        {/* Mobile bottom-style tabs (shown under header on small screens) */}
        <div className="sm:hidden flex items-center justify-around border-t border-border px-2 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-4 py-1 rounded-lg text-xs font-medium transition-all ${
                  isActive ? (isAdvertiser ? 'text-violet-light' : 'text-emerald2') : 'text-slatec'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Page content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}