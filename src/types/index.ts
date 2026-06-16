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

export type TransactionType = 'deposit' | 'withdrawal' | 'task_payment' | 'task_earning' | 'refund' | 'bonus';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // positive = credit, negative = debit
  description: string;
  createdAt: string;
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
  completedByCurrentUser?: boolean; // NEW
}

export type WithdrawalMethod = 'bank_transfer' | 'paypal' | 'crypto' | 'mobile_money';

export type WithdrawalStatus = 'pending' | 'processing' | 'completed' | 'rejected';

export interface Withdrawal {
  id: string;
  amount: number;
  method: WithdrawalMethod;
  accountDetails: string;
  status: WithdrawalStatus;
  createdAt: string;
}