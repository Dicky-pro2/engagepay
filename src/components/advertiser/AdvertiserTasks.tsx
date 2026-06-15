import { useState, useMemo } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import AdvertiserTaskCard from './AdvertiserTaskCard';
import { notify } from '../../utils/notify';
import type { Task } from '../../types';

type FilterType = 'all' | 'active' | 'paused' | 'completed' | 'cancelled';

export default function AdvertiserTasks() {
  const { user, updateWallet } = useAuthStore();
  const { myTasks, updateTaskStatus, pushActivity, addTransaction } = useAppStore();
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredTasks = useMemo(() => {
    if (filter === 'all') return myTasks;
    return myTasks.filter((t) => t.status === filter);
  }, [myTasks, filter]);

  const handleUpdateStatus = (taskId: string, status: Task['status']) => {
    const task = myTasks.find((t) => t.id === taskId);
    if (!task || !user) return;

    // Refund unused slots on cancel
    if (status === 'cancelled' && task.status !== 'cancelled') {
      const refund = task.slotsLeft * task.reward;
      if (refund > 0) {
        updateWallet(user.walletBalance + refund);
        pushActivity(`Task cancelled — 🪙${refund.toLocaleString()} refunded`, 'green');
        addTransaction({
            type: 'refund',
            amount: refund,
            description: 'Refund for cancelled task: ${task.taskType} on ${task.platform}',
        });
        notify.success(`Task cancelled. 🪙${refund.toLocaleString()} refunded to your wallet.`);
      }
    } else if (status === 'paused') {
      notify.info('Task paused — no new submissions will be accepted.');
      pushActivity(`Task paused: ${task.taskType} on ${task.platform}`, 'violet');
    } else if (status === 'active' && task.status === 'paused') {
      notify.success('Task resumed!');
      pushActivity(`Task resumed: ${task.taskType} on ${task.platform}`, 'violet');
    }

    updateTaskStatus(taskId, status);
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All Tasks' },
    { key: 'active', label: 'Active' },
    { key: 'paused', label: 'Paused' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-sora font-bold text-2xl mb-1">My Tasks</h1>
        <p className="text-slatec text-sm">Manage tasks you've posted.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-xl border px-4 py-1.5 text-sm font-semibold transition-all ${
              filter === f.key
                ? 'border-violet bg-violet/15 text-violet-light'
                : 'border-border text-slatec hover:border-white/20'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Task list */}
      {filteredTasks.length === 0 ? (
        <div className="card p-10 text-center text-slatec">
          <div className="text-3xl mb-2">📋</div>
          {myTasks.length === 0 ? 'No tasks yet. Create your first task from the Overview tab!' : 'No tasks match this filter.'}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filteredTasks.map((task) => (
            <AdvertiserTaskCard key={task.id} task={task} onUpdateStatus={handleUpdateStatus} />
          ))}
        </div>
      )}
    </div>
  );
}