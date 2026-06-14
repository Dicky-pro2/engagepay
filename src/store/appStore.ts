import { create } from 'zustand';
import type { Task, ActivityItem } from '../types';

interface AppState {
  tasks: Task[];
  myTasks: Task[];
  activity: ActivityItem[];

  setTasks: (tasks: Task[]) => void;
  setMyTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  pushActivity: (msg: string, type?: 'violet' | 'green') => void;
}

export const useAppStore = create<AppState>((set) => ({
  tasks: [],
  myTasks: [],
  activity: [],

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
}));