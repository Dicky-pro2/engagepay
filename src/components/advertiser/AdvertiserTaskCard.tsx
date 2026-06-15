import { motion } from 'framer-motion';
import { Pause, Play, XCircle } from 'lucide-react';
import { PLATFORM_ICONS } from '../../services/mockData';
import type { Task } from '../../types';

interface AdvertiserTaskCardProps {
  task: Task;
  onUpdateStatus: (taskId: string, status: Task['status']) => void;
}

export default function AdvertiserTaskCard({ task, onUpdateStatus }: AdvertiserTaskCardProps) {
  const progressPct = task.totalSlots > 0 ? (task.completionCount / task.totalSlots) * 100 : 0;

  const statusBadge: Record<Task['status'], string> = {
    active: 'badge-green',
    paused: 'badge-yellow',
    completed: 'badge-violet',
    cancelled: 'badge-red',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4 sm:p-5"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-navy-2 flex items-center justify-center text-lg flex-shrink-0">
          {PLATFORM_ICONS[task.platform]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-slatec uppercase tracking-wide">{task.platform} · {task.taskType}</div>
          <div className="text-sm font-semibold truncate">{task.url}</div>
        </div>
        <span className={statusBadge[task.status]}>{task.status}</span>
      </div>

      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span className="badge-yellow">🪙 {task.reward} per task</span>
        <span className="badge-violet">{task.completionCount}/{task.totalSlots} done</span>
        <span className="text-xs text-slatec">
          Total cost: 🪙 {(task.reward * task.totalSlots).toLocaleString()}
        </span>
      </div>

      <div className="h-1.5 bg-border rounded-full overflow-hidden mb-1.5">
        <div
          className={`h-full rounded-full transition-all ${task.status === 'completed' ? 'bg-emerald2' : 'bg-violet'}`}
          style={{ width: `${progressPct}%` }}
        />
      </div>
      <div className="text-xs text-slatec mb-3">{task.slotsLeft} slots remaining</div>

      {/* Controls */}
      {(task.status === 'active' || task.status === 'paused') && (
        <div className="flex gap-2">
          {task.status === 'active' ? (
            <button
              onClick={() => onUpdateStatus(task.id, 'paused')}
              className="btn-secondary flex-1 text-xs flex items-center justify-center gap-1.5 py-2"
            >
              <Pause size={14} /> Pause
            </button>
          ) : (
            <button
              onClick={() => onUpdateStatus(task.id, 'active')}
              className="btn-secondary flex-1 text-xs flex items-center justify-center gap-1.5 py-2"
            >
              <Play size={14} /> Resume
            </button>
          )}
          <button
            onClick={() => onUpdateStatus(task.id, 'cancelled')}
            className="border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl flex-1 text-xs flex items-center justify-center gap-1.5 py-2 transition-all"
          >
            <XCircle size={14} /> Cancel
          </button>
        </div>
      )}
    </motion.div>
  );
}