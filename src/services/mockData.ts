import type { User } from '../types';
import type { Task } from '../types';

export const PLATFORM_ICONS: Record<string, string> = {
  Instagram: '📸',
  'Twitter/X': '🐦',
  TikTok: '🎵',
  YouTube: '▶️',
  Facebook: '👥',
  LinkedIn: '💼',
};

export const TASK_TYPES = ['Follow', 'Like', 'Comment', 'Share', 'Subscribe', 'View'] as const;
export const PLATFORMS = Object.keys(PLATFORM_ICONS);

export const mockUsers: Record<'advertiser' | 'earner', User> = {
  advertiser: {
    id: 'adv_1',
    name: 'Tunde Adesanya',
    email: 'tunde@example.com',
    role: 'advertiser',
    avatar: null,
    walletBalance: 2500,
    totalEarned: 0,
    totalSpent: 800,
    tasksPosted: 3,
    tasksCompleted: 0,
    isEmailVerified: true,
  },
  earner: {
    id: 'earn_1',
    name: 'Aisha Bello',
    email: 'aisha@example.com',
    role: 'earner',
    avatar: null,
    walletBalance: 340,
    totalEarned: 340,
    totalSpent: 0,
    tasksPosted: 0,
    tasksCompleted: 17,
    isEmailVerified: true,
  },
};



export const mockTasks: Task[] = [
  {
    id: 't1',
    advertiser: 'adv_1',
    advertiserName: 'Tunde Adesanya',
    platform: 'Instagram',
    taskType: 'Follow',
    title: 'Follow our brand page',
    instructions: 'Follow the account and stay for at least 7 days.',
    url: 'https://instagram.com/demo_brand',
    reward: 15,
    totalSlots: 50,
    slotsLeft: 32,
    completionCount: 18,
    status: 'active',
    createdAt: '2026-06-10T10:00:00Z',
  },
  {
    id: 't2',
    advertiser: 'adv_1',
    advertiserName: 'Tunde Adesanya',
    platform: 'Twitter/X',
    taskType: 'Like',
    title: 'Like our launch tweet',
    instructions: 'Like the pinned tweet on this profile.',
    url: 'https://twitter.com/i/web/status/1234567890',
    reward: 8,
    totalSlots: 100,
    slotsLeft: 64,
    completionCount: 36,
    status: 'active',
    createdAt: '2026-06-11T08:30:00Z',
  },
];