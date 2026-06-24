import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icons } from '../icons/Icons';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { notify } from '../../utils/notify';
import type { Task } from '../../types';

interface TaskModalProps {
  task: Task | null;
  onClose: () => void;
}

export default function TaskModal({ task, onClose }: TaskModalProps) {
  const { user, updateWallet } = useAuthStore();
  const { completeTask, addTransaction, pushActivity, addNotification } = useAppStore();
  const [proof, setProof] = useState('');

  const handleSubmit = () => {
    if (!proof.trim()) {
      notify.error('Please provide proof (your profile URL or screenshot link)');
      return;
    }
    if (!task || !user) return;

    completeTask(task.id, proof);
    updateWallet(user.walletBalance + task.reward);
    addTransaction({
      type: 'task_earning',
      amount: task.reward,
      description: `Earned from: ${task.taskType} on ${task.platform}`,
    });
    pushActivity(
      `Task completed: ${task.taskType} on ${task.platform} · 🪙${task.reward} paid out`,
      'green'
    );
    addNotification({
      type: 'task_approved',
      title: '💰 Task Approved!',
      message: `You earned 🪙${task.reward} for "${task.taskType} on ${task.platform}"`,
    });

    notify.coinsEarned(task.reward, `${task.taskType} on ${task.platform}`);
    setProof('');
    onClose();
  };

  return (
    <AnimatePresence>
      {task && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            onClick={(e) => e.stopPropagation()}
            className="card p-6 w-full max-w-md relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-slatec hover:text-white transition-colors"
            >
              <Icons.Close size={20} />
            </button>

            <h2 className="font-sora font-bold text-xl mb-1">
              {task.taskType} on {task.platform}
            </h2>
            <p className="text-slatec text-sm mb-4">
              Earn{' '}
              <span className="text-emerald2 font-semibold">🪙{task.reward}</span>{' '}
              for completing this task
            </p>

            <div className="bg-navy-2 border border-border rounded-xl p-4 mb-4 text-sm text-slatec leading-relaxed">
              {task.instructions}
              <br />
              
              <a
                href={task.url}
                target="_blank"
                rel="noreferrer"
                className="text-violet-light break-all hover:underline"
              >
                {task.url}
              </a>
            </div>

            <label className="label">
              Paste your profile URL / screenshot link as proof
            </label>
            <input
              className="input mb-4"
              placeholder="https://instagram.com/yourhandle"
              value={proof}
              onChange={(e) => setProof(e.target.value)}
            />

            <div className="flex gap-3">
              <button onClick={onClose} className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="btn-green flex-1 flex items-center justify-center gap-1.5"
              >
                <Icons.Confirm size={16} /> Submit & Earn
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}