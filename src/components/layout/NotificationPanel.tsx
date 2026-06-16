import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCheck } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

const TYPE_ICONS: Record<string, string> = {
  task_completed: '✅',
  task_approved: '💰',
  task_rejected: '❌',
  deposit_success: '💳',
  withdrawal_processed: '💸',
  new_task: '🚀',
  welcome: '🎉',
};

interface NotificationPanelProps {
  onClose: () => void;
}

export default function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { notifications, markAllNotificationsRead, markNotificationRead } = useAppStore();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <motion.div
      ref={panelRef}
      initial={{ opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 card z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="font-sora font-bold text-sm">Notifications</span>
        <div className="flex items-center gap-2">
          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={markAllNotificationsRead}
              className="text-xs text-violet-light hover:text-white flex items-center gap-1 transition-colors"
            >
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="text-slatec hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-10 text-slatec">
            <div className="text-3xl mb-2">🔔</div>
            No notifications yet
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-white/5 ${
                  !n.isRead ? 'bg-violet/5' : ''
                }`}
              >
                <div className="text-xl flex-shrink-0 mt-0.5">
                  {TYPE_ICONS[n.type] ?? '🔔'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold leading-snug">{n.title}</span>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-violet flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-slatec leading-relaxed mt-0.5">{n.message}</p>
                  <p className="text-xs text-slatec/60 mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}