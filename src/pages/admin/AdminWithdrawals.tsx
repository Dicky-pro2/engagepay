import { useAppStore } from "../../store/appStore";

export default function AdminWithdrawals() {
  const { withdrawals } = useAppStore();

  return (
    <div className="card p-5">
      <h2 className="font-sora font-semibold text-lg mb-4">
        Withdrawal Requests
      </h2>
      <div className="space-y-2">
        {withdrawals.length === 0 && (
          <p className="text-sm text-slatec">No withdrawal requests yet.</p>
        )}
        {withdrawals.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-xl border border-border px-3 py-3 text-sm"
          >
            <div>
              <p className="font-medium">
                {item.amount.toLocaleString()} coins
              </p>
              <p className="text-slatec">
                {item.method} • {item.accountDetails}
              </p>
            </div>
            <span className="rounded-full bg-amber-400/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-amber-400">
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
