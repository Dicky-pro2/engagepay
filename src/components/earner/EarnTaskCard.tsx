import { motion } from "framer-motion";
import { PLATFORM_ICONS } from "../../services/mockData";
import type { Task } from "../../types";

interface EarnTaskCardProps {
  task: Task;
  onDoTask: () => void;
}

export default function EarnTaskCard({ task, onDoTask }: EarnTaskCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      className="card p-5 transition-all hover:border-emerald2/40"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="font-sora font-extrabold text-2xl text-emerald2 flex items-baseline gap-1.5">
          {task.reward}
          <span className="text-xs text-slatec font-normal font-inter">
            coins
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-slatec">
          {PLATFORM_ICONS[task.platform]} {task.platform}
        </div>
      </div>

      <p className="text-sm mb-2">
        <strong>{task.taskType}</strong> · {task.instructions}
      </p>

      <a
        href={task.url}
        target="_blank"
        rel="noreferrer"
        className="text-xs text-violet-light break-all hover:underline"
      >
        {task.url}
      </a>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <span className="text-xs text-slatec">
          🪑 {task.slotsLeft} slots left
        </span>
        <button
          onClick={onDoTask}
          disabled={task.slotsLeft <= 0}
          className="btn-green text-xs px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Do Task
        </button>
      </div>
    </motion.div>
  );
}
