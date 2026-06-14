import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Coins, ArrowRight, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { mockUsers } from '../services/mockData';
//import type { Role } from '../types';
import { notify } from '../utils/notify';

export default function Landing() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [selectedRole, setSelectedRole] = useState<'advertiser' | 'earner' | null>(null);
  const [form, setForm] = useState({ name: '', email: '' });

 const handleEnter = (e: React.FormEvent) => {
  e.preventDefault();
  if (!selectedRole) return;

  const base = mockUsers[selectedRole];
  const user = {
    ...base,
    name: form.name || base.name,
    email: form.email || base.email,
  };

  login(user, 'mock_access_token', 'mock_refresh_token');
  notify.success(`Welcome, ${user.name}! 🎉`);
  navigate('/dashboard');
};


  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-12 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute w-[500px] h-[500px] bg-violet/20 rounded-full blur-[100px] -top-32 -left-32 pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] bg-blue-500/15 rounded-full blur-[100px] -bottom-24 -right-24 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10 relative z-10"
      >
        <h1 className="font-sora font-extrabold text-3xl sm:text-4xl mb-2">
          Engage<span className="text-violet-light">Pay</span>
        </h1>
        <p className="text-slatec text-sm sm:text-base">
          Real social media engagement, powered by real people.
        </p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-5 relative z-10 w-full max-w-2xl justify-center items-stretch">
        <RoleCard
          icon={<Megaphone size={32} />}
          title="I'm an Advertiser"
          desc="Post tasks for followers, likes & comments. Fund your wallet and watch engagement grow."
          color="violet"
          buttonLabel="Post Tasks"
          onClick={() => setSelectedRole('advertiser')}
        />
        <RoleCard
          icon={<Coins size={32} />}
          title="I'm an Earner"
          desc="Browse tasks, complete them, and earn coins instantly. Withdraw anytime."
          color="green"
          buttonLabel="Start Earning"
          onClick={() => setSelectedRole('earner')}
        />
      </div>

      {/* Login modal */}
      <AnimatePresence>
        {selectedRole && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4"
            onClick={() => setSelectedRole(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              onClick={(e) => e.stopPropagation()}
              className="card p-6 sm:p-8 w-full max-w-md relative"
            >
              <button
                onClick={() => setSelectedRole(null)}
                className="absolute top-4 right-4 text-slatec hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              <h2 className="font-sora font-bold text-xl mb-1">
                Continue as {selectedRole === 'advertiser' ? 'Advertiser' : 'Earner'}
              </h2>
              <p className="text-slatec text-sm mb-6">
                This is a demo login — enter any name/email to continue.
              </p>

              <form onSubmit={handleEnter} className="space-y-4">
                <div>
                  <label className="label">Name</label>
                  <input
                    className="input"
                    placeholder={mockUsers[selectedRole].name}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    className="input"
                    type="email"
                    placeholder={mockUsers[selectedRole].email}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  className={`w-full font-sora font-bold rounded-xl px-6 py-3 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 text-white ${
                    selectedRole === 'advertiser' ? 'bg-violet hover:bg-violet-dark' : 'bg-emerald2 hover:bg-emerald-600'
                  }`}
                >
                  Enter Dashboard <ArrowRight size={18} />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface RoleCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: 'violet' | 'green';
  buttonLabel: string;
  onClick: () => void;
}

function RoleCard({ icon, title, desc, color, buttonLabel, onClick }: RoleCardProps) {
  const borderHover = {
    violet: 'hover:border-violet/40',
    green: 'hover:border-emerald2/40',
  };
  const iconBg = {
    violet: 'bg-violet/15 text-violet-light',
    green: 'bg-emerald2/15 text-emerald2',
  };
  const btnBg = {
    violet: 'bg-violet hover:bg-violet-dark',
    green: 'bg-emerald2 hover:bg-emerald-600',
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      className={`card p-7 sm:p-8 w-full sm:w-72 text-center cursor-pointer transition-all ${borderHover[color]}`}
    >
      <div className={`w-16 h-16 rounded-2xl ${iconBg[color]} flex items-center justify-center mx-auto mb-4`}>
        {icon}
      </div>
      <h3 className="font-sora font-bold text-lg mb-2">{title}</h3>
      <p className="text-slatec text-sm leading-relaxed mb-5">{desc}</p>
      <span className={`inline-flex items-center gap-2 text-white font-bold text-sm rounded-full px-6 py-2.5 transition-all ${btnBg[color]}`}>
        {buttonLabel} <ArrowRight size={16} />
      </span>
    </motion.div>
  );
}