import { useMemo } from "react";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/appStore";
import {
  calculateAdvertiserImpact,
  calculateWithdrawalFee,
} from "../../utils/transactionMath";

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const { transactions, withdrawals } = useAppStore();

  const summary = useMemo(() => {
    const totalWithdrawals = withdrawals.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    const totalFees = withdrawals.reduce(
      (sum, item) => sum + calculateWithdrawalFee(item.amount),
      0,
    );
    const totalTransactions = transactions.reduce(
      (sum, tx) => sum + Math.abs(tx.amount),
      0,
    );
    const advertiserBudget = transactions
      .filter((tx) => tx.type === "task_payment")
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    return {
      totalWithdrawals,
      totalFees,
      totalTransactions,
      advertiserBudget,
    };
  }, [transactions, withdrawals]);

  if (user?.role !== "admin") {
    return (
      <div className="card p-8 text-center text-slatec">
        <p>You need admin access to view this page.</p>
      </div>
    );
  }

  const impact = calculateAdvertiserImpact(summary.advertiserBudget);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sora font-bold text-2xl mb-1">Admin Dashboard</h1>
        <p className="text-slatec text-sm">
          Monitor platform activity, withdrawal fees, and advertiser impact.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wide text-slatec">
            Pending withdrawals
          </p>
          <p className="mt-2 font-sora text-2xl">{withdrawals.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wide text-slatec">
            Withdrawal fees
          </p>
          <p className="mt-2 font-sora text-2xl">
            {summary.totalFees.toLocaleString()} coins
          </p>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wide text-slatec">
            Total withdrawn
          </p>
          <p className="mt-2 font-sora text-2xl">
            {summary.totalWithdrawals.toLocaleString()} coins
          </p>
        </div>
        <div className="card p-5">
          <p className="text-xs uppercase tracking-wide text-slatec">
            Advertiser budget
          </p>
          <p className="mt-2 font-sora text-2xl">
            {summary.advertiserBudget.toLocaleString()} coins
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-sora font-semibold text-lg mb-4">
            Advertiser Impact
          </h2>
          <div className="space-y-3 text-sm text-slatec">
            <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
              <span>Estimated follows</span>
              <span className="font-semibold text-white">{impact.follows}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
              <span>Estimated likes</span>
              <span className="font-semibold text-white">{impact.likes}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2">
              <span>Estimated engagement</span>
              <span className="font-semibold text-white">
                {impact.engagement}
              </span>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-sora font-semibold text-lg mb-4">
            Recent activity
          </h2>
          <div className="space-y-2 text-sm text-slatec">
            {transactions.slice(0, 6).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-xl border border-border px-3 py-2"
              >
                <span>{tx.description}</span>
                <span
                  className={
                    tx.amount >= 0 ? "text-emerald2" : "text-amber-400"
                  }
                >
                  {tx.amount >= 0 ? "+" : ""}
                  {tx.amount.toLocaleString()}
                </span>
              </div>
            ))}
            {transactions.length === 0 && <p>No activity recorded yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
