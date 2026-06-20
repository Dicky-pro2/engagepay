import { create } from 'zustand';
import type {
  Task,
  TaskSubmission,
  ActivityItem,
  Transaction,
  Withdrawal,
  Notification,
  Submission,
} from '../types';
import { mockTasks } from '../services/mockData';

interface UserAppData {
  tasks: Task[];
  myTasks: Task[];
  activity: ActivityItem[];
  transactions: Transaction[];
  withdrawals: Withdrawal[];
  notifications: Notification[];
  submissions: Submission[];
}

interface AppState extends UserAppData {
  currentUserId: string | null;

  loadUserData: (userId: string) => void;
  clearUserData: () => void;

  setTasks: (tasks: Task[]) => void;
  setMyTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  pushActivity: (msg: string, type?: 'violet' | 'green') => void;
  updateTaskStatus: (taskId: string, status: Task['status']) => Task | undefined;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  completeTask: (taskId: string, proof: string) => Task | undefined;
  addWithdrawal: (w: Omit<Withdrawal, 'id' | 'createdAt' | 'status'>) => void;
  addNotification: (n: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  markAllNotificationsRead: () => void;
  markNotificationRead: (id: string) => void;
  reviewTaskSubmission: (
    taskId: string,
    submissionId: string,
    action: 'approve' | 'reject',
    note?: string
  ) => void;
}

const STORAGE_PREFIX = 'engagepay-user-data:';

const defaultUserData = (): UserAppData => ({
  tasks: [...mockTasks],
  myTasks: [],
  activity: [],
  transactions: [],
  withdrawals: [],
  submissions: [],
  notifications: [
    {
      id: crypto.randomUUID(),
      type: 'welcome',
      title: 'Welcome to EngagePay! 🎉',
      message: 'Your account is ready. Start exploring tasks or post your first campaign.',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
  ],
});

// ── Persistence helpers ──
function loadFromStorage(userId: string): UserAppData {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + userId);
    if (raw) return JSON.parse(raw);
  } catch {
    // fall through to default
  }
  return defaultUserData();
}

function saveToStorage(userId: string | null, data: UserAppData) {
  if (!userId) return;
  try {
    localStorage.setItem(STORAGE_PREFIX + userId, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable — fail silently for demo purposes
  }
}

export const useAppStore = create<AppState>((set, get) => {
  const persistCurrent = (partial: Partial<UserAppData>) => {
    set(partial);
    const state = get();
    saveToStorage(state.currentUserId, {
      tasks: state.tasks,
      myTasks: state.myTasks,
      activity: state.activity,
      transactions: state.transactions,
      withdrawals: state.withdrawals,
      notifications: state.notifications,
      submissions: state.submissions,
    });
  };

  return {
    currentUserId: null,
    ...defaultUserData(),

    loadUserData: (userId) => {
      const data = loadFromStorage(userId);
      set({ currentUserId: userId, ...data });
    },

    clearUserData: () => {
      set({ currentUserId: null, ...defaultUserData() });
    },

    setTasks: (tasks) => persistCurrent({ tasks }),
    setMyTasks: (tasks) => persistCurrent({ myTasks: tasks }),

    addTask: (task) => {
      const state = get();
      persistCurrent({
        myTasks: [task, ...state.myTasks],
        tasks: [task, ...state.tasks],
      });
    },

    pushActivity: (msg, type = 'violet') => {
      const state = get();
      persistCurrent({
        activity: [
          { id: crypto.randomUUID(), msg, type, time: new Date().toLocaleTimeString() },
          ...state.activity,
        ].slice(0, 20),
      });
    },

    updateTaskStatus: (taskId, status) => {
      const state = get();
      let updatedTask: Task | undefined;

      const update = (list: Task[]) =>
        list.map((t) => {
          if (t.id !== taskId) return t;
          updatedTask = { ...t, status };
          return updatedTask;
        });

      persistCurrent({
        myTasks: update(state.myTasks),
        tasks: update(state.tasks),
      });

      return updatedTask;
    },

    addTransaction: (tx) => {
      const state = get();
      persistCurrent({
        transactions: [
          { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...tx },
          ...state.transactions,
        ],
      });
    },

    completeTask: (taskId, proof) => {
      const state = get();
      let updatedTask: Task | undefined;
      const task = state.tasks.find((t) => t.id === taskId);

      const newTaskSubmission: TaskSubmission = {
        id: crypto.randomUUID(),
        earnerName: 'Current Earner',
        earnerId: 'earner_current',
        proof,
        status: 'approved',
        createdAt: new Date().toISOString(),
      };

      const update = (list: Task[]) =>
        list.map((t) => {
          if (t.id !== taskId) return t;
          const slotsLeft = Math.max(0, t.slotsLeft - 1);
          updatedTask = {
            ...t,
            slotsLeft,
            completionCount: t.completionCount + 1,
            status: slotsLeft <= 0 ? 'completed' : t.status,
            completedByCurrentUser: true,
            taskSubmissions: [...(t.taskSubmissions ?? []), newTaskSubmission],
          };
          return updatedTask;
        });

      const newSubmission: Submission = {
        id: crypto.randomUUID(),
        taskId,
        taskTitle: task ? `${task.taskType} on ${task.platform}` : 'Unknown Task',
        platform: task?.platform ?? '',
        taskType: task?.taskType ?? '',
        reward: task?.reward ?? 0,
        proof,
        status: 'approved',
        createdAt: new Date().toISOString(),
      };

      persistCurrent({
        tasks: update(state.tasks),
        myTasks: update(state.myTasks),
        submissions: [newSubmission, ...state.submissions],
      });

      return updatedTask;
    },

    addWithdrawal: (w) => {
      const state = get();
      persistCurrent({
        withdrawals: [
          {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            status: 'pending',
            ...w,
          },
          ...state.withdrawals,
        ],
      });
    },

    addNotification: (n) => {
      const state = get();
      persistCurrent({
        notifications: [
          {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            isRead: false,
            ...n,
          },
          ...state.notifications,
        ],
      });
    },

    markAllNotificationsRead: () => {
      const state = get();
      persistCurrent({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      });
    },

    markNotificationRead: (id) => {
      const state = get();
      persistCurrent({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        ),
      });
    },

    reviewTaskSubmission: (taskId, submissionId, action, note) => {
      const state = get();

      const update = (list: Task[]) =>
        list.map((t) => {
          if (t.id !== taskId) return t;
          const updatedSubmissions = (t.taskSubmissions ?? []).map((s) => {
            if (s.id !== submissionId) return s;
            return {
              ...s,
              status: action === 'approve' ? ('approved' as const) : ('rejected' as const),
              reviewNote: note,
            };
          });
          const slotsLeft = action === 'reject' ? t.slotsLeft + 1 : t.slotsLeft;
          return {
            ...t,
            taskSubmissions: updatedSubmissions,
            slotsLeft,
            completionCount:
              action === 'reject' ? Math.max(0, t.completionCount - 1) : t.completionCount,
          };
        });

      persistCurrent({
        tasks: update(state.tasks),
        myTasks: update(state.myTasks),
      });
    },
  };
});