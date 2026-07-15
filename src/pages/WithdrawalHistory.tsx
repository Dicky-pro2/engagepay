import { useState } from "react";
import {
  CreditCard,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Download,
  Filter,
} from "lucide-react";
import { useAppStore } from "../store/appStore";
import type { WithdrawalStatus } from "../types";

type FilterStatus = WithdrawalStatus | "all";

export default function WithdrawalHistoryPage() {
  const withdrawals = useAppStore((s) => s.withdrawals);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");

  const filteredWithdrawals =
    filterStatus === "all"
      ? withdrawals
      : withdrawals.filter((w) => w.status === filterStatus);

  const totalWithdrawn = withdrawals
    .filter((w) => w.status === "completed")
    .reduce((sum, w) => sum + w.amount, 0);

  const pendingAmount = withdrawals
    .filter((w) => w.status === "pending" || w.status === "processing")
    .reduce((sum, w) => sum + w.amount, 0);

  const getStatusIcon = (status: WithdrawalStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "pending":
      case "processing":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (status: WithdrawalStatus) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
      case "processing":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    }
  };

  const getMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      bank_transfer: "Bank Transfer",
      paypal: "PayPal",
      crypto: "Cryptocurrency",
      mobile_money: "Mobile Money",
    };
    return labels[method] || method;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            💰 Withdrawal History
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Track all your withdrawals and transactions
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Total Withdrawn
                </p>
                <p className="text-3xl font-bold text-green-600">
                  ${totalWithdrawn.toFixed(2)}
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Pending
                </p>
                <p className="text-3xl font-bold text-yellow-600">
                  ${pendingAmount.toFixed(2)}
                </p>
              </div>
              <Clock className="w-12 h-12 text-yellow-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Total Requests
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {withdrawals.length}
                </p>
              </div>
              <CreditCard className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-4 py-2 rounded transition-colors ${
                filterStatus === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-600"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus("completed")}
              className={`px-4 py-2 rounded transition-colors ${
                filterStatus === "completed"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-600"
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilterStatus("pending")}
              className={`px-4 py-2 rounded transition-colors ${
                filterStatus === "pending"
                  ? "bg-yellow-600 text-white"
                  : "bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-600"
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterStatus("rejected")}
              className={`px-4 py-2 rounded transition-colors ${
                filterStatus === "rejected"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-600"
              }`}
            >
              Rejected
            </button>
          </div>
        </div>

        {/* Withdrawals List */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
          {filteredWithdrawals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">
                      Date
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">
                      Amount
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">
                      Method
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWithdrawals.map((withdrawal) => (
                    <tr
                      key={withdrawal.id}
                      className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <td className="py-4 px-6 text-gray-900 dark:text-white">
                        <div>
                          <p className="font-medium">
                            {new Date(
                              withdrawal.createdAt,
                            ).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(
                              withdrawal.createdAt,
                            ).toLocaleTimeString()}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-gray-900 dark:text-white">
                          ${withdrawal.amount.toFixed(2)}
                        </p>
                      </td>
                      <td className="py-4 px-6 text-gray-900 dark:text-white">
                        {getMethodLabel(withdrawal.method)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(withdrawal.status)}
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(withdrawal.status)}`}
                          >
                            {withdrawal.status}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 dark:text-gray-400">
                        {withdrawal.accountName || withdrawal.accountNumber
                          ? `${withdrawal.accountName || "Account"}`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                No withdrawals found with the selected filter
              </p>
            </div>
          )}
        </div>

        {/* Export Button */}
        <div className="mt-6 flex justify-end">
          <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            Export as CSV
          </button>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
            💡 About Withdrawals
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
            <li>✓ Withdrawals typically process within 3-5 business days</li>
            <li>✓ Minimum withdrawal amount: $5.00</li>
            <li>✓ Maximum: $5000 per transaction</li>
            <li>✓ Verify your payment method before requesting a withdrawal</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
