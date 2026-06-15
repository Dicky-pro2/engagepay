import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownCircle, ArrowUpCircle, Wallet as WalletIcon } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { notify } from '../../utils/notify';
import type { TransactionType } from '../../types';

const FUND_AMOUNTS = [100, 500, 1000, 5000];

const TX_LABELS: Record<TransactionType, { icon: string; color: string }> = {
  deposit: { icon: '💳', color: 'text-emerald2' },
  withdrawal: { icon: '💸', color: 'text-red-400' },
  task_payment: { icon: '🚀', color: 'text-red-400' },
  task_earning: { icon: '🎉', color: 'text-emerald2' },
  refund: { icon: '↩️', color: 'text-violet-light' },
  bonus: { icon: '🎁', color: 'text-amber-400' },
};

export default function WalletPage() {
  const { user, updateWallet } = useAuthStore();
  const { transactions, addTransaction } = useAppStore();
  const [selectedAmt, setSelectedAmt] = useState(500);
  const [customAmt, setCustomAmt] = useState('');

  const handleFund = () => {
    const amt = customAmt ? Number(customAmt) : selectedAmt;
    if (!amt || amt <= 0 || !user) {
      notify.error('Enter a valid amount');
      return;
    }

    updateWallet(user.walletBalance + amt);
    addTransaction({
      type: 'deposit',
      amount: amt,
      description: 'Wallet top-up (mock payment)',
    });
    notify.walletFunded(amt);
    setCustomAmt('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sora font-bold text-2xl mb-1">Wallet</h1>
        <p className="text-slatec text-sm">Manage your balance and view transaction history.</p>
      </div>

      {/* Balance card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 flex items-center justify-between flex-wrap gap-4"
      >
        <div>
          <div className="text-xs text-slatec uppercase tracking-wide mb-1">Current Balance</div>
          <div className="font-sora font-extrabold text-3xl sm:text-4xl text-amber-400">
            {(user?.walletBalance ?? 0).toLocaleString()} 🪙
          </div>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-amber-500/15 flex items-center justify-center">
          <WalletIcon size={26} className="text-amber-400" />
        </div>
      </motion.div>

      {/* Fund wallet */}
      <div className="card p-5 max-w-md">
        <h2 className="font-sora font-bold text-base mb-1">💳 Fund Wallet</h2>
        <p className="text-slatec text-sm mb-4">Choose an amount to add to your wallet (demo — no real payment).</p>

        <div className="flex gap-2 flex-wrap mb-3">
          {FUND_AMOUNTS.map((amt) => (
            <button
              key={amt}
              onClick={() => { setSelectedAmt(amt); setCustomAmt(''); }}
              className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-all ${
                selectedAmt === amt && !customAmt
                  ? 'border-violet bg-violet/15 text-violet-light'
                  : 'border-border text-slatec hover:border-white/20'
              }`}
            >
              {amt.toLocaleString()} 🪙
            </button>
          ))}
        </div>

        <input
          className="input mb-3"
          type="number"
          min={1}
          placeholder="Or enter custom amount"
          value={customAmt}
          onChange={(e) => setCustomAmt(e.target.value)}
        />

        <button onClick={handleFund} className="btn-primary w-full font-sora">
          Add Coins to Wallet
        </button>
      </div>

      {/* Transaction history */}
      <div>
        <h2 className="font-sora font-bold text-base mb-3">📜 Transaction History</h2>
        {transactions.length === 0 ? (
          <div className="card p-10 text-center text-slatec">
            <div className="text-3xl mb-2">💼</div>
            No transactions yet
          </div>
        ) : (
          <div className="card divide-y divide-border">
            {transactions.map((tx) => {
              const meta = TX_LABELS[tx.type];
              const isCredit = tx.amount > 0;
              return (
                <div key={tx.id} className="flex items-center gap-3 px-4 sm:px-5 py-3">
                  <div className="w-9 h-9 rounded-xl bg-navy-2 flex items-center justify-center text-base flex-shrink-0">
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{tx.description}</div>
                    <div className="text-xs text-slatec">{new Date(tx.createdAt).toLocaleString()}</div>
                  </div>
                  <div className={`font-sora font-bold text-sm flex items-center gap-1 ${meta.color}`}>
                    {isCredit ? <ArrowDownCircle size={14} /> : <ArrowUpCircle size={14} />}
                    {isCredit ? '+' : ''}{tx.amount.toLocaleString()} 🪙
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}