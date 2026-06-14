export type Role = 'advertiser' | 'earner' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string | null;
  walletBalance: number;
  totalEarned: number;
  totalSpent: number;
  tasksCompleted: number;
  tasksPosted: number;
  isEmailVerified: boolean;
}

export interface Task {
  id: string;
  advertiser: string;
  advertiserName: string;
  platform: string;
  taskType: string;
  title: string;
  instructions: string;
  url: string;
  reward: number;
  totalSlots: number;
  slotsLeft: number;
  completionCount: number;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  msg: string;
  type: 'violet' | 'green';
  time: string;
}