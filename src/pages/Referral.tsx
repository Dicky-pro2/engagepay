import { Users, Copy, Check, TrendingUp, Award } from "lucide-react";
import { useState } from "react";
import { useReferralStore, REFERRAL_TIERS } from "../store/referralStore";
import { useAuthStore } from "../store/authStore";

export default function ReferralPage() {
  const { referralData, getReferralLevel } = useReferralStore();
  const user = useAuthStore((s) => s.user);
  const [copied, setCopied] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Please log in</p>
      </div>
    );
  }

  const referralCode =
    referralData?.code || `ZNK${user.id.substring(0, 4).toUpperCase()}`;
  const currentLevel = getReferralLevel(referralData?.totalReferrals || 0);
  const currentTier = REFERRAL_TIERS.find((t) => t.level === currentLevel);
  const nextTier =
    currentLevel < 5
      ? REFERRAL_TIERS.find((t) => t.level === currentLevel + 1)
      : null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const referralsNeeded =
    (nextTier?.minimumReferrals || 0) - (referralData?.totalReferrals || 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🚀 Referral Program
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Earn money by inviting friends to ZynkBuzz
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Referral Code Card */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Your Code
              </h2>
              <Users className="w-6 h-6 text-purple-600" />
            </div>

            <div className="bg-purple-50 dark:bg-slate-700 rounded-lg p-4 mb-4">
              <p className="text-center text-2xl font-mono font-bold text-purple-600 dark:text-purple-400">
                {referralCode}
              </p>
            </div>

            <button
              onClick={copyToClipboard}
              className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Code
                </>
              )}
            </button>
          </div>

          {/* Stats */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Your Stats
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Referrals
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {referralData?.totalReferrals || 0}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Referral Earnings
                </p>
                <p className="text-2xl font-bold text-green-600">
                  ${(referralData?.totalEarnings || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Current Level */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Current Level
            </h2>

            <div className="flex items-center gap-4 mb-4">
              <Award className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Level {currentLevel}
                </p>
                <p className="font-bold text-gray-900 dark:text-white">
                  {currentTier?.description}
                </p>
              </div>
            </div>

            {nextTier && (
              <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Next level in {Math.max(0, referralsNeeded)} referrals
                </p>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${((referralData?.totalReferrals || 0) / (nextTier.minimumReferrals || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Referral Tiers */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Referral Tiers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {REFERRAL_TIERS.map((tier) => (
              <div
                key={tier.level}
                className={`p-4 rounded-lg border-2 transition-all ${
                  currentLevel >= tier.level
                    ? "border-purple-600 bg-purple-50 dark:bg-slate-700"
                    : "border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900"
                }`}
              >
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Level {tier.level}
                  </p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                    {tier.bonusPercentage}%
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {tier.minimumReferrals}+ referrals
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {tier.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Referred Users */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Your Referrals ({referralData?.totalReferrals || 0})
          </h2>

          {referralData?.referredUsers &&
          referralData.referredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700">
                    <th className="text-left py-2 px-4 font-semibold text-gray-900 dark:text-white">
                      Name
                    </th>
                    <th className="text-left py-2 px-4 font-semibold text-gray-900 dark:text-white">
                      Tasks
                    </th>
                    <th className="text-left py-2 px-4 font-semibold text-gray-900 dark:text-white">
                      Earnings
                    </th>
                    <th className="text-left py-2 px-4 font-semibold text-gray-900 dark:text-white">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {referralData.referredUsers.map((referred) => (
                    <tr
                      key={referred.id}
                      className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
                    >
                      <td className="py-3 px-4 text-gray-900 dark:text-white">
                        {referred.name}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {referred.tasksCompleted}
                      </td>
                      <td className="py-3 px-4 font-semibold text-green-600">
                        ${referred.earnings.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-gray-500 dark:text-gray-500">
                        {new Date(referred.referredAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                No referrals yet. Share your code to earn!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
