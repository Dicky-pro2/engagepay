import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  ShieldCheck,
  Pencil,
  Check,
  X,
  TrendingUp,
  Wallet as WalletIcon,
  ListChecks,
  Star,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import { notify } from '../utils/notify';

export default function Profile() {
  const { user, updateName, logout } = useAuthStore();
  const { transactions, submissions, myTasks } = useAppStore();

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name ?? '');
  const [savingName, setSavingName] = useState(false);

  const isAdvertiser = user?.role === 'advertiser';

  const handleSaveName = async () => {
    if (!nameInput.trim()) {
      notify.error('Name cannot be empty');
      return;
    }
    if (nameInput.trim() === user?.name) {
      setEditingName(false);
      return;
    }
    setSavingName(true);
    await new Promise((r) => setTimeout(r, 500));
    updateName(nameInput.trim());
    notify.success('Name updated successfully!');
    setSavingName(false);
    setEditingName(false);
  };

  const handleCancelEdit = () => {
    setNameInput(user?.name ?? '');
    setEditingName(false);
  };

  const totalTransactions = transactions.length;
  const memberSince = user ? 'June 2026' : '—';

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-sora font-bold text-2xl mb-1">Profile</h1>
        <p className="text-slatec text-sm">Manage your account details.</p>
      </div>

      {/* Avatar + name card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="flex items-start gap-4">
          {/* Avatar placeholder */}
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-sora font-bold flex-shrink-0 ${
            isAdvertiser
              ? 'bg-violet/20 text-violet-light'
              : 'bg-emerald2/20 text-emerald2'
          }`}>
            {user?.name?.charAt(0).toUpperCase() ?? '?'}
          </div>

          <div className="flex-1 min-w-0">
            {/* Name with edit */}
            {editingName ? (
              <div className="flex items-center gap-2 mb-1">
                <input
                  className="input py-1.5 text-base font-semibold"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                />
                <button
                  onClick={handleSaveName}
                  disabled={savingName}
                  className="text-emerald2 hover:text-emerald-400 transition-colors flex-shrink-0"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="text-slatec hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-sora font-bold text-xl">{user?.name}</h2>
                <button
                  onClick={() => setEditingName(true)}
                  className="text-slatec hover:text-white transition-colors"
                  title="Edit name"
                >
                  <Pencil size={14} />
                </button>
              </div>
            )}

            {/* Email */}
            <div className="flex items-center gap-1.5 text-sm text-slatec mb-2">
              <Mail size={13} />
              {user?.email}
            </div>

            {/* Role + verified badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                isAdvertiser
                  ? 'bg-violet/10 border-violet/30 text-violet-light'
                  : 'bg-emerald2/10 border-emerald2/30 text-emerald2'
              }`}>
                {isAdvertiser ? '📢 Advertiser' : '💰 Earner'}
              </span>
              {user?.isEmailVerified && (
                <span className="flex items-center gap-1 text-xs text-emerald2 bg-emerald2/10 border border-emerald2/30 px-2.5 py-1 rounded-full font-semibold">
                  <ShieldCheck size={12} /> Verified
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div>
        <h2 className="font-sora font-bold text-base mb-3">📊 Account Stats</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="stat-card"
          >
            <div className="flex items-center gap-1.5 text-xs text-slatec uppercase tracking-wide mb-1">
              <WalletIcon size={12} /> Balance
            </div>
            <div className="font-sora font-bold text-xl text-amber-400">
              🪙 {(user?.walletBalance ?? 0).toLocaleString()}
            </div>
          </motion.div>

          {isAdvertiser ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="stat-card"
              >
                <div className="flex items-center gap-1.5 text-xs text-slatec uppercase tracking-wide mb-1">
                  <ListChecks size={12} /> Tasks Posted
                </div>
                <div className="font-sora font-bold text-xl text-violet-light">
                  {myTasks.length}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="stat-card"
              >
                <div className="flex items-center gap-1.5 text-xs text-slatec uppercase tracking-wide mb-1">
                  <TrendingUp size={12} /> Coins Spent
                </div>
                <div className="font-sora font-bold text-xl">
                  🪙 {(user?.totalSpent ?? 0).toLocaleString()}
                </div>
              </motion.div>
            </>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="stat-card"
              >
                <div className="flex items-center gap-1.5 text-xs text-slatec uppercase tracking-wide mb-1">
                  <Star size={12} /> Tasks Done
                </div>
                <div className="font-sora font-bold text-xl text-violet-light">
                  {submissions.length}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="stat-card"
              >
                <div className="flex items-center gap-1.5 text-xs text-slatec uppercase tracking-wide mb-1">
                  <TrendingUp size={12} /> Total Earned
                </div>
                <div className="font-sora font-bold text-xl text-emerald2">
                  🪙 {(user?.totalEarned ?? 0).toLocaleString()}
                </div>
              </motion.div>
            </>
          )}

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="stat-card"
          >
            <div className="flex items-center gap-1.5 text-xs text-slatec uppercase tracking-wide mb-1">
              <TrendingUp size={12} /> Transactions
            </div>
            <div className="font-sora font-bold text-xl">
              {totalTransactions}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Account info */}
      <div>
        <h2 className="font-sora font-bold text-base mb-3">🔐 Account Info</h2>
        <div className="card divide-y divide-border">
          <InfoRow label="Email" value={user?.email ?? '—'} />
          <InfoRow label="Role" value={isAdvertiser ? 'Advertiser' : 'Earner'} />
          <InfoRow label="Member Since" value={memberSince} />
          <InfoRow
            label="Email Verified"
            value={user?.isEmailVerified ? '✅ Verified' : '❌ Not verified'}
          />
        </div>
      </div>

      {/* Danger zone */}
      <div>
        <h2 className="font-sora font-bold text-base mb-3">⚠️ Account Actions</h2>
        <div className="card p-5 space-y-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <div className="text-sm font-semibold">Log out</div>
              <div className="text-xs text-slatec">Sign out of your account on this device.</div>
            </div>
            <button
              onClick={() => { logout(); }}
              className="border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl px-4 py-2 text-sm font-semibold transition-all"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 sm:px-5 py-3 gap-4">
      <span className="text-sm text-slatec">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}