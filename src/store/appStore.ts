import { create } from 'zustand';
import type { Task, ActivityItem, Transaction, Withdrawal, Notification, Submission } from '../types';
import { mockTasks } from '../services/mockData';

interface AppState {
  tasks: Task[];
  myTasks: Task[];
  activity: ActivityItem[];
  transactions: Transaction[];
  withdrawals: Withdrawal[];
  notifications: Notification[];
  submissions: Submission[];

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
}

export const useAppStore = create<AppState>((set) => ({
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

  setTasks: (tasks) => set({ tasks }),
  setMyTasks: (tasks) => set({ myTasks: tasks }),

  addTask: (task) =>
    set((state) => ({
      myTasks: [task, ...state.myTasks],
      tasks: [task, ...state.tasks],
    })),

  pushActivity: (msg, type = 'violet') =>
    set((state) => ({
      activity: [
        { id: crypto.randomUUID(), msg, type, time: new Date().toLocaleTimeString() },
        ...state.activity,
      ].slice(0, 20),
    })),

  updateTaskStatus: (taskId, status) => {
    let updatedTask: Task | undefined;
    set((state) => {
      const update = (list: Task[]) =>
        list.map((t) => {
          if (t.id !== taskId) return t;
          updatedTask = { ...t, status };
          return updatedTask;
        });
      return {
        myTasks: update(state.myTasks),
        tasks: update(state.tasks),
      };
    });
    return updatedTask;
  },

  addTransaction: (tx) =>
    set((state) => ({
      transactions: [
        { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...tx },
        ...state.transactions,
      ],
    })),

  completeTask: (taskId, proof) => {
    let updatedTask: Task | undefined;

    set((state) => {
      const task = state.tasks.find((t) => t.id === taskId);

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

      return {
        tasks: update(state.tasks),
        myTasks: update(state.myTasks),
        submissions: [newSubmission, ...state.submissions],
      };
    });

    return updatedTask;
  },

  addWithdrawal: (w) =>
    set((state) => ({
      withdrawals: [
        {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          status: 'pending',
          ...w,
        },
        ...state.withdrawals,
      ],
    })),

  addNotification: (n) =>
    set((state) => ({
      notifications: [
        {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          isRead: false,
          ...n,
        },
        ...state.notifications,
      ],
    })),

  markAllNotificationsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    })),

  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    })),
}));