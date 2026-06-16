import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/appStore";
import { notify } from "../../utils/notify";
import type { WithdrawalMethod, TransactionType } from "../../types";

const METHODS: {
  key: WithdrawalMethod;
  label: string;
  icon: string;
  placeholder: string;
}[] = [
  {
    key: "bank_transfer",
    label: "Bank Transfer",
    icon: "🏦",
    placeholder: "Bank name, account number, account name",
  },
  {
    key: "mobile_money",
    label: "Mobile Money",
    icon: "📱",
    placeholder: "Phone number and provider (e.g. MTN, Airtel)",
  },
  {
    key: "paypal",
    label: "PayPal",
    icon: "💳",
    placeholder: "Your PayPal email address",
  },
  {
    key: "crypto",
    label: "Crypto (USDT)",
    icon: "₿",
    placeholder: "Your USDT wallet address (TRC20)",
  },
];

const MIN_WITHDRAWAL = 100;

const TX_LABELS: Record<TransactionType, { icon: string; color: string }> = {
  deposit: { icon: "💳", color: "text-emerald2" },
  withdrawal: { icon: "💸", color: "text-red-400" },
  task_payment: { icon: "🚀", color: "text-red-400" },
  task_earning: { icon: "🎉", color: "text-emerald2" },
  refund: { icon: "↩️", color: "text-violet-light" },
  bonus: { icon: "🎁", color: "text-amber-400" },
};

const STATUS_DISPLAY: Record<string, { icon: React.ReactNode; color: string }> =
  {
    pending: { icon: <Clock size={14} />, color: "text-amber-400" },
    processing: { icon: <Clock size={14} />, color: "text-violet-light" },
    completed: { icon: <CheckCircle size={14} />, color: "text-emerald2" },
    rejected: { icon: <XCircle size={14} />, color: "text-red-400" },
  };

export default function EarnerWallet() {
  const { user, updateWallet } = useAuthStore();
  const {
    transactions,
    withdrawals,
    addTransaction,
    addWithdrawal,
    pushActivity,
    addNotification,
  } = useAppStore();

  const [method, setMethod] = useState<WithdrawalMethod>("bank_transfer");
  const [amount, setAmount] = useState("");
  const [accountDetails, setAccountDetails] = useState("");
  const [activeTab, setActiveTab] = useState<
    "withdraw" | "history" | "withdrawals"
  >("withdraw");

  const earningTransactions = transactions.filter(
    (tx) =>
      tx.type === "task_earning" ||
      tx.type === "withdrawal" ||
      tx.type === "bonus",
  );

  const handleWithdraw = () => {
    const amt = Number(amount);
    if (!amt || amt < MIN_WITHDRAWAL) {
      notify.error(`Minimum withdrawal is 🪙${MIN_WITHDRAWAL}`);
      return;
    }
    if (!user || amt > user.walletBalance) {
      notify.error("Insufficient balance");
      return;
    }
    if (!accountDetails.trim()) {
      notify.error("Please enter your account details");
      return;
    }

    updateWallet(user.walletBalance - amt);
    addTransaction({
      type: "withdrawal",
      amount: -amt,
      description: `Withdrawal via ${METHODS.find((m) => m.key === method)?.label}`,
    });
    addWithdrawal({
      amount: amt,
      method,
      accountDetails: accountDetails.trim(),
    });
    pushActivity(`Withdrawal of 🪙${amt.toLocaleString()} requested`, "violet");
    addNotification({
      type: "withdrawal_processed",
      title: "💸 Withdrawal Requested",
      message: `Your withdrawal of 🪙${amt.toLocaleString()} via ${METHODS.find((m) => m.key === method)?.label} is being processed.`,
    });

    setAmount("");
    setAccountDetails("");
  };

  const selectedMethod = METHODS.find((m) => m.key === method)!;

  const tabs = [
    { key: "withdraw" as const, label: "💸 Withdraw" },
    { key: "history" as const, label: "📜 Earnings History" },
    { key: "withdrawals" as const, label: "⏳ My Withdrawals" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sora font-bold text-2xl mb-1">Wallet</h1>
        <p className="text-slatec text-sm">
          Withdraw your earnings and track transactions.
        </p>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-5 sm:col-span-2"
        >
          <div className="text-xs text-slatec uppercase tracking-wide mb-1">
            Available to Withdraw
          </div>
          <div className="font-sora font-extrabold text-3xl sm:text-4xl text-emerald2">
            {(user?.walletBalance ?? 0).toLocaleString()} 🪙
          </div>
          <div className="text-xs text-slatec mt-1">
            Minimum withdrawal: 🪙{MIN_WITHDRAWAL.toLocaleString()}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card p-5"
        >
          <div className="text-xs text-slatec uppercase tracking-wide mb-1">
            Total Earned
          </div>
          <div className="font-sora font-extrabold text-2xl text-violet-light">
            {(user?.totalEarned ?? 0).toLocaleString()} 🪙
          </div>
          <div className="text-xs text-slatec mt-1">All time</div>
        </motion.div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 flex-wrap border-b border-border pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-xl px-4 py-1.5 text-sm font-semibold transition-all border ${
              activeTab === tab.key
                ? "border-emerald2 bg-emerald2/15 text-emerald2"
                : "border-border text-slatec hover:border-white/20"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Withdrawal form */}
        {activeTab === "withdraw" && (
          <motion.div
            key="withdraw"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="card p-5 max-w-lg space-y-4"
          >
            <h2 className="font-sora font-bold text-base">
              Choose Withdrawal Method
            </h2>

            <div className="grid grid-cols-2 gap-2">
              {METHODS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => {
                    setMethod(m.key);
                    setAccountDetails("");
                  }}
                  className={`rounded-xl border px-3 py-3 text-sm font-medium transition-all flex items-center gap-2 ${
                    method === m.key
                      ? "border-emerald2 bg-emerald2/10 text-emerald2"
                      : "border-border text-slatec hover:border-white/20"
                  }`}
                >
                  <span className="text-lg">{m.icon}</span>
                  {m.label}
                </button>
              ))}
            </div>

            <div>
              <label className="label">{selectedMethod.label} Details</label>
              <textarea
                className="input min-h-[80px] resize-none"
                placeholder={selectedMethod.placeholder}
                value={accountDetails}
                onChange={(e) => setAccountDetails(e.target.value)}
              />
            </div>

            <div>
              <label className="label">Amount (🪙)</label>
              <input
                className="input"
                type="number"
                min={MIN_WITHDRAWAL}
                max={user?.walletBalance}
                placeholder={`Min ${MIN_WITHDRAWAL}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="bg-navy-2 border border-border rounded-xl px-4 py-2.5 flex items-center justify-between text-sm">
              <span className="text-slatec">You'll receive</span>
              <span className="font-sora font-bold text-emerald2">
                🪙 {amount ? Number(amount).toLocaleString() : "0"}
              </span>
            </div>

            <button
              onClick={handleWithdraw}
              disabled={
                !amount ||
                Number(amount) < MIN_WITHDRAWAL ||
                Number(amount) > (user?.walletBalance ?? 0)
              }
              className="btn-green w-full font-sora disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Request Withdrawal
            </button>
          </motion.div>
        )}

        {/* Earnings history */}
        {activeTab === "history" && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            {earningTransactions.length === 0 ? (
              <div className="card p-10 text-center text-slatec">
                <div className="text-3xl mb-2">💼</div>
                No earnings yet — complete tasks to start earning!
              </div>
            ) : (
              <div className="card divide-y divide-border">
                {earningTransactions.map((tx) => {
                  const meta = TX_LABELS[tx.type];
                  const isCredit = tx.amount > 0;
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center gap-3 px-4 sm:px-5 py-3"
                    >
                      <div className="w-9 h-9 rounded-xl bg-navy-2 flex items-center justify-center text-base flex-shrink-0">
                        {meta.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {tx.description}
                        </div>
                        <div className="text-xs text-slatec">
                          {new Date(tx.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div
                        className={`font-sora font-bold text-sm flex items-center gap-1 ${meta.color}`}
                      >
                        {isCredit ? (
                          <ArrowDownCircle size={14} />
                        ) : (
                          <ArrowUpCircle size={14} />
                        )}
                        {isCredit ? "+" : ""}
                        {tx.amount.toLocaleString()} 🪙
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Withdrawal requests */}
        {activeTab === "withdrawals" && (
          <motion.div
            key="withdrawals"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            {withdrawals.length === 0 ? (
              <div className="card p-10 text-center text-slatec">
                <div className="text-3xl mb-2">⏳</div>
                No withdrawal requests yet.
              </div>
            ) : (
              <div className="card divide-y divide-border">
                {withdrawals.map((w) => {
                  const statusMeta = STATUS_DISPLAY[w.status];
                  const methodMeta = METHODS.find((m) => m.key === w.method)!;
                  return (
                    <div
                      key={w.id}
                      className="flex items-center gap-3 px-4 sm:px-5 py-3"
                    >
                      <div className="w-9 h-9 rounded-xl bg-navy-2 flex items-center justify-center text-base flex-shrink-0">
                        {methodMeta.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">
                          {methodMeta.label}
                        </div>
                        <div className="text-xs text-slatec truncate">
                          {w.accountDetails}
                        </div>
                        <div className="text-xs text-slatec">
                          {new Date(w.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-sora font-bold text-sm text-red-400 mb-1">
                          -{w.amount.toLocaleString()} 🪙
                        </div>
                        <div
                          className={`flex items-center gap-1 text-xs font-semibold ${statusMeta.color}`}
                        >
                          {statusMeta.icon} {w.status}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
