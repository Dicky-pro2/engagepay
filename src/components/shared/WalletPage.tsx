import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icons } from '../icons/Icons';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { notify } from '../../utils/notify';
import type { TransactionType } from '../../types';

const FUND_AMOUNTS = [100, 500, 1000, 5000];

const TX_META: Record<TransactionType, { icon: React.ReactNode; color: string; label: string }> = {
  deposit: { icon: <Icons.CreditCard size={16} />, color: 'text-emerald2', label: 'Deposit' },
  withdrawal: { icon: <Icons.CoinOut size={16} />, color: 'text-red-400', label: 'Withdrawal' },
  task_payment: { icon: <Icons.Rocket size={16} />, color: 'text-red-400', label: 'Task Payment' },
  task_earning: { icon: <Icons.Star size={16} />, color: 'text-emerald2', label: 'Task Earning' },
  refund: { icon: <Icons.ArrowLeft size={16} />, color: 'text-violet-light', label: 'Refund' },
  bonus: { icon: <Icons.PiggyBank size={16} />, color: 'text-amber-400', label: 'Bonus' },
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
      description: 'Wallet top-up',
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
          <div className="text-xs text-slatec uppercase tracking-wide mb-1">
            Current Balance
          </div>
          <div className="font-sora font-extrabold text-3xl sm:text-4xl text-amber-400 flex items-center gap-2">
            <Icons.Wallet size={28} className="text-amber-400" />
            {(user?.walletBalance ?? 0).toLocaleString()}
            <span className="text-base font-normal text-slatec">coins</span>
          </div>
        </div>
      </motion.div>

      {/* Fund wallet */}
      <div className="card p-5 max-w-md">
        <h2 className="font-sora font-bold text-base mb-1 flex items-center gap-2">
          <Icons.CreditCard size={16} /> Fund Wallet
        </h2>
        <p className="text-slatec text-sm mb-4">
          Choose an amount to add (demo — no real payment).
        </p>

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
              {amt.toLocaleString()} coins
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

        <button onClick={handleFund} className="btn-primary w-full font-sora flex items-center justify-center gap-2">
          <Icons.CoinIn size={16} /> Add Coins to Wallet
        </button>
      </div>

      {/* Transaction history */}
      <div>
        <h2 className="font-sora font-bold text-base mb-3 flex items-center gap-2">
          <Icons.Clock size={16} /> Transaction History
        </h2>
        {transactions.length === 0 ? (
          <div className="card p-10 text-center text-slatec">
            <Icons.Wallet size={32} className="mx-auto mb-2 opacity-30" />
            No transactions yet
          </div>
        ) : (
          <div className="card divide-y divide-border">
            {transactions.map((tx) => {
              const meta = TX_META[tx.type];
              const isCredit = tx.amount > 0;
              return (
                <div key={tx.id} className="flex items-center gap-3 px-4 sm:px-5 py-3">
                  <div className="w-9 h-9 rounded-xl bg-navy-2 flex items-center justify-center flex-shrink-0">
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{tx.description}</div>
                    <div className="text-xs text-slatec">
                      {new Date(tx.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className={`font-sora font-bold text-sm flex items-center gap-1 ${meta.color}`}>
                    {isCredit
                      ? <Icons.CoinIn size={14} />
                      : <Icons.CoinOut size={14} />
                    }
                    {isCredit ? '+' : ''}{tx.amount.toLocaleString()}
                    <span className="text-xs font-normal text-slatec">coins</span>
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