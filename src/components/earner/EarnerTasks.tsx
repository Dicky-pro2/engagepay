import { useMemo, useState } from 'react';
import { useAppStore } from '../../store/appStore';
import { PLATFORMS, TASK_TYPES } from '../../services/mockData';
import EarnTaskCard from './EarnTaskCard';
import TaskModal from './TaskModal';
import { Icons } from '../icons/Icons';
import { PlatformIcon } from '../icons/PlatformIcons';
import type { Task } from '../../types';

type PlatformFilter = 'all' | string;
type TypeFilter = 'all' | string;

export default function EarnerTasks() {
  const tasks = useAppStore((s) => s.tasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const availableTasks = useMemo(
    () =>
      tasks.filter(
        (t) => t.status === 'active' && t.slotsLeft > 0 && !t.completedByCurrentUser
      ),
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
    <div className="space-y-4 sm:space-y-5">
      <div>
        <h1 className="font-sora font-bold text-xl sm:text-2xl mb-1">
          Browse Tasks
        </h1>
        <p className="text-slatec text-xs sm:text-sm">
          Complete tasks to earn coins instantly.
        </p>
      </div>

      {/* Platform filter — horizontal scroll on mobile */}
      <div>
        <div className="text-xs text-slatec uppercase tracking-wide mb-2 font-medium flex items-center gap-1.5">
          <Icons.Globe size={12} /> Platform
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <FilterChip
            active={platformFilter === 'all'}
            onClick={() => setPlatformFilter('all')}
          >
            All
          </FilterChip>
          {PLATFORMS.map((p) => (
            <FilterChip
              key={p}
              active={platformFilter === p}
              onClick={() => setPlatformFilter(p)}
            >
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <PlatformIcon platform={p} size={13} />
                {p}
              </span>
            </FilterChip>
          ))}
        </div>
      </div>

      {/* Task type filter */}
      <div>
        <div className="text-xs text-slatec uppercase tracking-wide mb-2 font-medium flex items-center gap-1.5">
          <Icons.Tasks size={12} /> Task Type
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <FilterChip
            active={typeFilter === 'all'}
            onClick={() => setTypeFilter('all')}
          >
            All Types
          </FilterChip>
          {TASK_TYPES.map((t) => (
            <FilterChip
              key={t}
              active={typeFilter === t}
              onClick={() => setTypeFilter(t)}
            >
              <span className="whitespace-nowrap">{t}</span>
            </FilterChip>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="text-xs text-slatec flex items-center gap-1.5">
        <Icons.Tasks size={12} />
        {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} available
      </div>

      {/* Task grid */}
      {filteredTasks.length === 0 ? (
        <div className="card p-8 sm:p-10 text-center text-slatec">
          <Icons.Tasks size={28} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">
            {availableTasks.length === 0
              ? 'No tasks available right now. Check back soon!'
              : 'No tasks match these filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredTasks.map((task) => (
            <EarnTaskCard
              key={task.id}
              task={task}
              onDoTask={() => setActiveTask(task)}
            />
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
      className={`rounded-xl border px-3 py-1.5 text-xs sm:text-sm font-medium transition-all flex-shrink-0 ${
        active
          ? 'border-emerald2 bg-emerald2/15 text-emerald2'
          : 'border-border text-slatec hover:border-white/20'
      }`}
    >
      {children}
    </button>
  );
}