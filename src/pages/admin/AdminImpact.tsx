import { useMemo } from "react";
import { useAppStore } from "../../store/appStore";
import { calculateAdvertiserImpact } from "../../utils/transactionMath";

export default function AdminImpact() {
  const { transactions } = useAppStore();

  const impact = useMemo(() => {
    const advertiserBudget = transactions
      .filter((tx) => tx.type === "task_payment")
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    return calculateAdvertiserImpact(advertiserBudget);
  }, [transactions]);

  return (
    <div className="card p-5">
      <h2 className="font-sora font-semibold text-lg mb-4">Campaign Impact</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border p-4">
          <p className="text-sm text-slatec">Follows</p>
          <p className="mt-2 font-sora text-xl">{impact.follows}</p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <p className="text-sm text-slatec">Likes</p>
          <p className="mt-2 font-sora text-xl">{impact.likes}</p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <p className="text-sm text-slatec">Engagement</p>
          <p className="mt-2 font-sora text-xl">{impact.engagement}</p>
        </div>
      </div>
    </div>
  );
}
