import { useMemo } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import StatCard from '../shared/StatCard';
import CreateTaskForm from './CreateTaskForm';
import ActivityFeed from './ActivityFeed';

export default function AdvertiserOverview() {
  const user = useAuthStore((s) => s.user);
  const myTasks = useAppStore((s) => s.myTasks);

  const stats = useMemo(() => {
    const active = myTasks.filter((t) => t.status === 'active').length;
    const completions = myTasks.reduce((sum, t) => sum + t.completionCount, 0);
    return { active, completions };
  }, [myTasks]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sora font-bold text-2xl mb-1">Advertiser Dashboard</h1>
        <p className="text-slatec text-sm">Manage your tasks and grow your engagement.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Wallet Balance" value={`${(user?.walletBalance ?? 0).toLocaleString()} 🪙`} color="yellow" delay={0} />
        <StatCard label="Active Tasks" value={stats.active} color="violet" delay={0.05} />
        <StatCard label="Total Completions" value={stats.completions} color="green" delay={0.1} />
        <StatCard label="Coins Spent" value={`${(user?.totalSpent ?? 0).toLocaleString()} 🪙`} delay={0.15} />
      </div>

      <div className="grid lg:grid-cols-[1fr_1.3fr] gap-5">
        <div>
          <h2 className="font-sora font-bold text-base mb-3">📋 Create New Task</h2>
          <CreateTaskForm />
        </div>
        <div>
          <h2 className="font-sora font-bold text-base mb-3">⚡ Recent Activity</h2>
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}