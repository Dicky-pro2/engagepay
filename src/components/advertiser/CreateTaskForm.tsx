import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { PLATFORMS, TASK_TYPES } from '../../services/mockData';
import { notify } from '../../utils/notify';
import { Icons } from '../icons/Icons';
import { PlatformIcon } from '../icons/PlatformIcons';
import type { Task } from '../../types';

const TASK_TYPE_LABELS: Record<string, string> = {
  Follow: 'Follow Account',
  Like: 'Like Post',
  Comment: 'Comment on Post',
  Share: 'Share / Retweet',
  Subscribe: 'Subscribe Channel',
  View: 'Watch Video (30s+)',
};

export default function CreateTaskForm() {
  const { user, updateWallet } = useAuthStore();
  const { addTask, pushActivity, addTransaction, addNotification } = useAppStore();

  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [taskType, setTaskType] = useState<string>(TASK_TYPES[0]);
  const [url, setUrl] = useState('');
  const [instructions, setInstructions] = useState('');
  const [reward, setReward] = useState(10);
  const [slots, setSlots] = useState(10);

  const totalCost = reward * slots;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      notify.error('Please enter a profile or post URL');
      return;
    }
    if (!user) return;

    if (user.walletBalance < totalCost) {
      notify.error(
        `Not enough coins! Need ${totalCost.toLocaleString()} but have ${user.walletBalance.toLocaleString()}`
      );
      return;
    }

    const task: Task = {
      id: `t${Date.now()}`,
      advertiser: user.id,
      advertiserName: user.name,
      platform,
      taskType,
      title: `${taskType} on ${platform}`,
      instructions:
        instructions.trim() ||
        `Go to the link and ${taskType.toLowerCase()} as instructed.`,
      url: url.trim(),
      reward,
      totalSlots: slots,
      slotsLeft: slots,
      completionCount: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    addTask(task);
    updateWallet(user.walletBalance - totalCost);
    pushActivity(
      `New task posted: ${taskType} on ${platform} · ${reward} coins x${slots}`,
      'violet'
    );
    addTransaction({
      type: 'task_payment',
      amount: -totalCost,
      description: `Task posted: ${taskType} on ${platform}`,
    });
    addNotification({
      type: 'new_task',
      title: 'Task Posted!',
      message: `Your ${taskType} task on ${platform} is now live with ${slots} slots.`,
    });
    notify.taskPosted(totalCost);

    setUrl('');
    setInstructions('');
  };

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-4">

      {/* Platform selector */}
      <div>
        <label className="label">Platform</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlatform(p)}
              className={`rounded-xl px-2 py-3 text-center text-xs font-medium transition-all border flex flex-col items-center gap-1.5 ${
                platform === p
                  ? 'border-violet bg-violet/15 text-violet-light'
                  : 'border-border text-slatec hover:border-white/20'
              }`}
            >
              <PlatformIcon
                platform={p}
                size={22}
                className={platform === p ? 'opacity-100' : 'opacity-60'}
              />
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Task type */}
      <div>
        <label className="label">Task Type</label>
        <select
          className="input"
          value={taskType}
          onChange={(e) => setTaskType(e.target.value)}
        >
          {TASK_TYPES.map((t) => (
            <option key={t} value={t}>
              {TASK_TYPE_LABELS[t] ?? t}
            </option>
          ))}
        </select>
      </div>

      {/* URL */}
      <div>
        <label className="label">Profile / Post URL</label>
        <div className="relative">
          <Icons.Link
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slatec pointer-events-none"
          />
          <input
            className="input pl-10"
            placeholder="https://instagram.com/yourprofile"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
      </div>

      {/* Instructions */}
      <div>
        <label className="label">Instructions for Earner</label>
        <textarea
          className="input min-h-[80px] resize-y"
          placeholder="e.g. Follow my account and stay for at least 7 days..."
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
        />
      </div>

      {/* Reward + Slots */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label flex items-center gap-1.5">
            <Icons.Wallet size={12} /> Reward per task (coins)
          </label>
          <input
            type="number"
            min={1}
            className="input"
            value={reward}
            onChange={(e) => setReward(Math.max(1, Number(e.target.value)))}
          />
        </div>
        <div>
          <label className="label flex items-center gap-1.5">
            <Icons.User size={12} /> Number of slots
          </label>
          <input
            type="number"
            min={1}
            className="input"
            value={slots}
            onChange={(e) => setSlots(Math.max(1, Number(e.target.value)))}
          />
        </div>
      </div>

      {/* Total cost preview */}
      <div className="bg-navy-2 border border-border rounded-xl px-4 py-2.5 flex items-center justify-between text-sm">
        <span className="text-slatec flex items-center gap-1.5">
          <Icons.CoinOut size={14} /> Total cost
        </span>
        <span className="font-sora font-bold text-amber-400 flex items-center gap-1.5">
          <Icons.Wallet size={14} />
          {totalCost.toLocaleString()} coins
        </span>
      </div>

      <button
        type="submit"
        className="btn-primary w-full font-sora flex items-center justify-center gap-2"
      >
        <Icons.Rocket size={16} /> Post Task
      </button>
    </form>
  );
}