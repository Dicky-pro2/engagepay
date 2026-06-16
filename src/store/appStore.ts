import { create } from 'zustand';
import type { Task, ActivityItem, Transaction, Withdrawal } from '../types';
import { mockTasks } from '../services/mockData';

interface AppState {
  tasks: Task[];
  myTasks: Task[];
  activity: ActivityItem[];
  transactions: Transaction[];
  withdrawals: Withdrawal[];

  setTasks: (tasks: Task[]) => void;
  setMyTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  pushActivity: (msg: string, type?: 'violet' | 'green') => void;
  updateTaskStatus: (taskId: string, status: Task['status']) => Task | undefined;
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  completeTask: (taskId: string) => Task | undefined;
  addWithdrawal: (w: Omit<Withdrawal, 'id' | 'createdAt' | 'status'>) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  tasks: [...mockTasks],
  myTasks: [],
  activity: [],
  transactions: [],
  withdrawals: [],

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

  completeTask: (taskId) => {
    let updatedTask: Task | undefined;
    set((state) => {
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
      return {
        tasks: update(state.tasks),
        myTasks: update(state.myTasks),
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
}));