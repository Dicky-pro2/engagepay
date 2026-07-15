import { useState } from "react";
import { Trophy, TrendingUp, Flame } from "lucide-react";
import { useGamificationStore } from "../store/gamificationStore";
import { useAuthStore } from "../store/authStore";

type LeaderboardMetric = "earnings" | "tasks" | "streak";

export default function LeaderboardPage() {
  const [metric, setMetric] = useState<LeaderboardMetric>("earnings");
  const {
    leaderboardEarnings,
    leaderboardTasks,
    leaderboardStreak,
    getLeaderboardPosition,
  } = useGamificationStore();
  const user = useAuthStore((s) => s.user);

  const getLeaderboard = () => {
    switch (metric) {
      case "earnings":
        return leaderboardEarnings;
      case "tasks":
        return leaderboardTasks;
      case "streak":
        return leaderboardStreak;
    }
  };

  const leaderboard = getLeaderboard();
  const userPosition = user ? getLeaderboardPosition(user.id, metric) : null;

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "text-yellow-500";
      case 2:
        return "text-gray-400";
      case 3:
        return "text-orange-600";
      default:
        return "text-gray-400";
    }
  };

  const getMedalIcon = (rank: number) => {
    if (rank <= 3) {
      return <Trophy className={`w-5 h-5 ${getMedalColor(rank)}`} />;
    }
    return null;
  };

  const getMetricLabel = (m: LeaderboardMetric) => {
    switch (m) {
      case "earnings":
        return "Total Earnings";
      case "tasks":
        return "Tasks Completed";
      case "streak":
        return "Current Streak";
    }
  };

  const getMetricValue = (m: LeaderboardMetric, score: number) => {
    switch (m) {
      case "earnings":
        return `$${score.toFixed(2)}`;
      case "tasks":
        return `${Math.round(score)} tasks`;
      case "streak":
        return `${Math.round(score)} days`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🏆 Weekly Leaderboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Compete with other users and climb the ranks
          </p>
        </div>

        {/* Metric Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow mb-6 p-1 flex gap-2 flex-wrap">
          <button
            onClick={() => setMetric("earnings")}
            className={`flex-1 min-w-max py-2 px-4 rounded transition-all ${
              metric === "earnings"
                ? "bg-purple-600 text-white"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
            }`}
          >
            💰 Earnings
          </button>
          <button
            onClick={() => setMetric("tasks")}
            className={`flex-1 min-w-max py-2 px-4 rounded transition-all ${
              metric === "tasks"
                ? "bg-purple-600 text-white"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
            }`}
          >
            ✅ Tasks Completed
          </button>
          <button
            onClick={() => setMetric("streak")}
            className={`flex-1 min-w-max py-2 px-4 rounded transition-all ${
              metric === "streak"
                ? "bg-purple-600 text-white"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
            }`}
          >
            <Flame className="w-4 h-4 inline mr-1" />
            Streak
          </button>
        </div>

        {/* Your Rank Card */}
        {userPosition && user && (
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow p-6 mb-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Your Rank</p>
                <p className="text-3xl font-bold">#{userPosition}</p>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">{getMetricLabel(metric)}</p>
                <p className="text-2xl font-bold">
                  {metric === "earnings" ? "$" : ""}
                  {metric === "streak"
                    ? user.currentStreak
                    : user.tasksCompleted}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">
                    Rank
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white">
                    User
                  </th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-900 dark:text-white">
                    {getMetricLabel(metric)}
                  </th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length > 0 ? (
                  leaderboard.map((entry) => (
                    <tr
                      key={entry.userId}
                      className={`border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors ${
                        entry.userId === user?.id
                          ? "bg-purple-50 dark:bg-slate-700/50"
                          : ""
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {getMedalIcon(entry.rank)}
                          <span className="font-bold text-gray-900 dark:text-white text-lg">
                            #{entry.rank}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {entry.avatar && (
                            <img
                              src={entry.avatar}
                              alt={entry.name}
                              className="w-10 h-10 rounded-full"
                            />
                          )}
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {entry.name}
                              {entry.userId === user?.id && (
                                <span className="ml-2 text-xs bg-purple-600 text-white px-2 py-1 rounded">
                                  You
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <p className="font-bold text-gray-900 dark:text-white">
                          {getMetricValue(metric, entry.score)}
                        </p>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-8 px-6 text-center">
                      <p className="text-gray-500 dark:text-gray-400">
                        Leaderboard will populate as users participate
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              How Leaderboards Work
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>📊 Leaderboards reset every week on Monday at 12:00 UTC</li>
              <li>🎯 Top 3 users each week get bonus rewards and badges</li>
              <li>⭐ You can track multiple metrics simultaneously</li>
              <li>🔄 Share your achievements on social media</li>
            </ul>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Weekly Rewards
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>🥇 1st Place: +10% bonus + Premium Badge</li>
              <li>🥈 2nd Place: +7% bonus + Silver Badge</li>
              <li>🥉 3rd Place: +5% bonus + Bronze Badge</li>
              <li>🎖️ Badges persist on your profile permanently</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
