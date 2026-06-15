import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { PLATFORM_ICONS, PLATFORMS, TASK_TYPES } from '../../services/mockData';
import { notify } from '../../utils/notify';
import type { Task } from '../../types';

export default function CreateTaskForm() {
  const { user, updateWallet } = useAuthStore();
  const { addTask, pushActivity, addTransaction } = useAppStore();

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
      notify.error(`Not enough coins! Need 🪙${totalCost.toLocaleString()} but have 🪙${user.walletBalance.toLocaleString()}`);
      return;
    }

    const task: Task = {
      id: `t${Date.now()}`,
      advertiser: user.id,
      advertiserName: user.name,
      platform,
      taskType,
      title: `${taskType} on ${platform}`,
      instructions: instructions.trim() || `Go to the link and ${taskType.toLowerCase()} as instructed.`,
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
    pushActivity(`New task posted: ${taskType} on ${platform} · 🪙${reward} ×${slots}`, 'violet');
    addTransaction({
      type: 'task_payment',
      amount: -totalCost,
      description: `Task posted: ${taskType} on ${platform}`
    });
    notify.taskPosted(totalCost);

    // Reset form
    setUrl('');
    setInstructions('');
  };

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-4">
      {/* Platform selector */}
      <div>
        <label className="label">Platform</label>
        <div className="grid grid-cols-3 gap-2">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlatform(p)}
              className={`rounded-xl px-2 py-2.5 text-center text-xs font-medium transition-all border ${
                platform === p
                  ? 'border-violet bg-violet/15 text-violet-light'
                  : 'border-border text-slatec hover:border-white/20'
              }`}
            >
              <span className="block text-lg mb-0.5">{PLATFORM_ICONS[p]}</span>
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
              {t === 'Follow' ? 'Follow Account' : t === 'Like' ? 'Like Post' : t === 'Comment' ? 'Comment on Post' : t === 'Share' ? 'Share / Retweet' : t === 'Subscribe' ? 'Subscribe Channel' : 'Watch Video (30s+)'}
            </option>
          ))}
        </select>
      </div>

      {/* URL */}
      <div>
        <label className="label">Profile / Post URL</label>
        <input
          className="input"
          placeholder="https://instagram.com/yourprofile"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
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
          <label className="label">Reward per task (🪙)</label>
          <input
            type="number"
            min={1}
            className="input"
            value={reward}
            onChange={(e) => setReward(Math.max(1, Number(e.target.value)))}
          />
        </div>
        <div>
          <label className="label">Number of slots</label>
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
        <span className="text-slatec">Total cost</span>
        <span className="font-sora font-bold text-amber-400">🪙 {totalCost.toLocaleString()}</span>
      </div>

      <button type="submit" className="btn-primary w-full font-sora flex items-center justify-center gap-2">
        🚀 Post Task
      </button>
    </form>
  );
}