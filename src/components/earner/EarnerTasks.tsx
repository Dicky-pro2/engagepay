import { useMemo, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import EarnTaskCard from './EarnTaskCard';
import TaskModal from './TaskModal';
import type { Task } from '../../types';
import { PlatformIcon } from '../icons/PlatformIcons';

type PlatformFilter = 'all' | string;
type TypeFilter = 'all' | string;

const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Facebook'];
const TASK_TYPES = ['Follow', 'Like', 'Comment', 'Share', 'Subscribe'];

export default function EarnerTasks() {
  const tasks = useAppStore((s) => s.tasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const availableTasks = useMemo(
    () => tasks.filter((t) => t.status === 'active' && t.slotsLeft > 0 && !t.completedByCurrentUser),
    [tasks]
  );

  const filteredTasks = useMemo(() => {
    return availableTasks.filter((t) => {
      if (platformFilter !== 'all' && t.platform !== platformFilter) return false;
      if (typeFilter !== 'all' && t.taskType !== typeFilter) return false;
      return true;
    });
  }, [availableTasks, platformFilter, typeFilter]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-sora font-bold text-2xl mb-1">Browse Tasks</h1>
        <p className="text-slatec text-sm">Complete tasks to earn coins instantly.</p>
      </div>

      {/* Platform filter */}
      <div>
        <div className="text-xs text-slatec uppercase tracking-wide mb-2 font-medium">Platform</div>
        <div className="flex gap-2 flex-wrap">
          <FilterChip active={platformFilter === 'all'} onClick={() => setPlatformFilter('all')}>
            All Platforms
          </FilterChip>
          {PLATFORMS.map((p) => (
            <FilterChip key={p} active={platformFilter === p} onClick={() => setPlatformFilter(p)}>
              <PlatformIcon platform={p} size={15} className="opacity-80" />
              {p}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* Task type filter */}
      <div>
        <div className="text-xs text-slatec uppercase tracking-wide mb-2 font-medium">Task Type</div>
        <div className="flex gap-2 flex-wrap">
          <FilterChip active={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>
            All Types
          </FilterChip>
          {TASK_TYPES.map((t) => (
            <FilterChip key={t} active={typeFilter === t} onClick={() => setTypeFilter(t)}>
              {t}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* Results */}
      {filteredTasks.length === 0 ? (
        <div className="card p-10 text-center text-slatec">
          <div className="text-3xl mb-2">🎯</div>
          {availableTasks.length === 0
            ? 'No tasks available right now. Check back soon!'
            : 'No tasks match these filters.'}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <EarnTaskCard key={task.id} task={task} onDoTask={() => setActiveTask(task)} />
          ))}
        </div>
      )}

      <TaskModal task={activeTask} onClose={() => setActiveTask(null)} />
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border px-3.5 py-1.5 text-sm font-medium transition-all ${
        active
          ? 'border-emerald2 bg-emerald2/15 text-emerald2'
          : 'border-border text-slatec hover:border-white/20'
      }`}
    >
      {children}
    </button>
  );
}