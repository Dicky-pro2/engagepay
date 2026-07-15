// src/services/api.ts
// Real API service layer.
// Each function currently falls back to mock implementations.
// When backend is ready: set VITE_USE_MOCK=false in .env and
// uncomment the axios calls — no component changes needed.

import axios from "axios";
import env from "../config/env";
import { useAuthStore } from "../store/authStore";

// ── Axios instance ──
export const apiClient = axios.create({
  baseURL: env.API_BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Attach auth token to every request
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 — logout and redirect to login
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// ── Auth API ──
export const authAPI = {
  register: (data: {
    name: string;
    nickname?: string;
    email: string;
    password: string;
    role: string;
  }) => {
    if (env.IS_MOCK) return Promise.resolve({ data: { message: "mock" } });
    return apiClient.post("/auth/register", data);
  },

  login: (data: { email: string; password: string }) => {
    if (env.IS_MOCK) return Promise.resolve({ data: { message: "mock" } });
    return apiClient.post("/auth/login", data);
  },

  googleAuth: (token: string, role?: string) => {
    if (env.IS_MOCK) return Promise.resolve({ data: { message: "mock" } });
    return apiClient.post("/auth/google", { token, role });
  },

  verifyEmail: (token: string) => {
    if (env.IS_MOCK) return Promise.resolve({ data: { message: "mock" } });
    return apiClient.get(`/auth/verify-email/${token}`);
  },

  resendVerification: (email: string) => {
    if (env.IS_MOCK) return Promise.resolve({ data: { message: "mock" } });
    return apiClient.post("/auth/resend-verification", { email });
  },

  forgotPassword: (email: string) => {
    if (env.IS_MOCK) return Promise.resolve({ data: { message: "mock" } });
    return apiClient.post("/auth/forgot-password", { email });
  },

  resetPassword: (token: string, password: string) => {
    if (env.IS_MOCK) return Promise.resolve({ data: { message: "mock" } });
    return apiClient.post(`/auth/reset-password/${token}`, { password });
  },

  getMe: () => {
    if (env.IS_MOCK) return Promise.resolve({ data: { message: "mock" } });
    return apiClient.get("/auth/me");
  },
};

// ── Task API ──
export const taskAPI = {
  getAll: (params?: {
    platform?: string;
    taskType?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    if (env.IS_MOCK) return Promise.resolve({ data: { tasks: [], total: 0 } });
    return apiClient.get("/tasks", { params });
  },

  getOne: (id: string) => {
    if (env.IS_MOCK) return Promise.resolve({ data: { task: null } });
    return apiClient.get(`/tasks/${id}`);
  },

  create: (data: {
    platform: string;
    taskType: string;
    title: string;
    description: string;
    url: string;
    instructions: string;
    reward: number;
    totalSlots: number;
    autoApprove: boolean;
  }) => {
    if (env.IS_MOCK) return Promise.resolve({ data: { message: "mock" } });
    return apiClient.post("/tasks", data);
  },

  update: (id: string, data: { status: string }) => {
    if (env.IS_MOCK) return Promise.resolve({ data: { message: "mock" } });
    return apiClient.patch(`/tasks/${id}`, data);
  },

  submit: (id: string, proof: string) => {
    if (env.IS_MOCK) return Promise.resolve({ data: { message: "mock" } });
    return apiClient.post(`/tasks/${id}/submit`, { proof });
  },

  review: (
    id: string,
    submissionId: string,
    data: { action: "approve" | "reject"; note?: string },
  ) => {
    if (env.IS_MOCK) return Promise.resolve({ data: { message: "mock" } });
    return apiClient.post(`/tasks/${id}/review/${submissionId}`, data);
  },

  getMySubmissions: () => {
    if (env.IS_MOCK) return Promise.resolve({ data: { submissions: [] } });
    return apiClient.get("/tasks/my/submissions");
  },
};

// ── Wallet API ──
export const walletAPI = {
  getBalance: () => {
    if (env.IS_MOCK) return Promise.resolve({ data: { walletBalance: 0 } });
    return apiClient.get("/wallet/balance");
  },

  getTransactions: (params?: {
    page?: number;
    limit?: number;
    type?: string;
  }) => {
    if (env.IS_MOCK) return Promise.resolve({ data: { transactions: [] } });
    return apiClient.get("/wallet/transactions", { params });
  },

  initDeposit: (amount: number) => {
    if (env.IS_MOCK) return Promise.resolve({ data: { authorizationUrl: "" } });
    return apiClient.post("/wallet/initialize-deposit", { amount });
  },

  verifyDeposit: (reference: string) => {
    if (env.IS_MOCK) return Promise.resolve({ data: { message: "mock" } });
    return apiClient.post("/wallet/verify-deposit", { reference });
  },

  withdraw: (data: {
    amount: number;
    method: string;
    accountDetails: string;
  }) => {
    if (env.IS_MOCK) return Promise.resolve({ data: { message: "mock" } });
    return apiClient.post("/wallet/withdraw", data);
  },
};

// ── User API ──
export const userAPI = {
  getProfile: () => {
    if (env.IS_MOCK) return Promise.resolve({ data: { user: null } });
    return apiClient.get("/users/profile");
  },

  updateProfile: (data: { name?: string }) => {
    if (env.IS_MOCK) return Promise.resolve({ data: { message: "mock" } });
    return apiClient.patch("/users/profile", data);
  },

  getNotifications: (params?: { page?: number; limit?: number }) => {
    if (env.IS_MOCK)
      return Promise.resolve({ data: { notifications: [], unreadCount: 0 } });
    return apiClient.get("/users/notifications", { params });
  },

  markAllRead: () => {
    if (env.IS_MOCK) return Promise.resolve({ data: { message: "mock" } });
    return apiClient.patch("/users/notifications/read-all");
  },

  markRead: (id: string) => {
    if (env.IS_MOCK) return Promise.resolve({ data: { message: "mock" } });
    return apiClient.patch(`/users/notifications/${id}/read`);
  },
};

// ── Admin API ──
export const adminAPI = {
  getStats: () => {
    if (env.IS_MOCK) return Promise.resolve({ data: {} });
    return apiClient.get("/admin/stats");
  },

  getUsers: (params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }) => {
    if (env.IS_MOCK) return Promise.resolve({ data: { users: [], total: 0 } });
    return apiClient.get("/admin/users", { params });
  },

  banUser: (id: string, reason: string) => {
    if (env.IS_MOCK) return Promise.resolve({ data: { message: "mock" } });
    return apiClient.patch(`/admin/users/${id}/ban`, { reason });
  },

  unbanUser: (id: string) => {
    if (env.IS_MOCK) return Promise.resolve({ data: { message: "mock" } });
    return apiClient.patch(`/admin/users/${id}/unban`);
  },

  creditUser: (id: string, data: { amount: number; reason: string }) => {
    if (env.IS_MOCK) return Promise.resolve({ data: { message: "mock" } });
    return apiClient.post(`/admin/users/${id}/credit`, data);
  },

  getTasks: (params?: { page?: number; limit?: number; status?: string }) => {
    if (env.IS_MOCK) return Promise.resolve({ data: { tasks: [], total: 0 } });
    return apiClient.get("/admin/tasks", { params });
  },

  getWithdrawals: (params?: { status?: string; page?: number }) => {
    if (env.IS_MOCK)
      return Promise.resolve({ data: { withdrawals: [], total: 0 } });
    return apiClient.get("/admin/withdrawals", { params });
  },

  processWithdrawal: (
    id: string,
    data: { action: "complete" | "reject"; adminNote?: string },
  ) => {
    if (env.IS_MOCK) return Promise.resolve({ data: { message: "mock" } });
    return apiClient.patch(`/admin/withdrawals/${id}`, data);
  },
};

// ── Referral API ──
export const referralAPI = {
  getMyReferralData: () => {
    if (env.IS_MOCK)
      return Promise.resolve({
        data: {
          code: "ZNKTEST",
          level: 1,
          totalReferrals: 0,
          totalEarnings: 0,
          referredUsers: [],
        },
      });
    return apiClient.get("/referrals/me");
  },

  getReferralCode: () => {
    if (env.IS_MOCK) return Promise.resolve({ data: { code: "ZNKTEST" } });
    return apiClient.get("/referrals/code");
  },

  claimReferralBonus: () => {
    if (env.IS_MOCK) return Promise.resolve({ data: { message: "mock" } });
    return apiClient.post("/referrals/claim-bonus");
  },

  getReferralStats: () => {
    if (env.IS_MOCK)
      return Promise.resolve({
        data: { level: 1, bonus: 5, totalReferrals: 0 },
      });
    return apiClient.get("/referrals/stats");
  },
};

// ── Gamification API ──
export const gamificationAPI = {
  getLeaderboard: (
    metric: "earnings" | "tasks" | "streak",
    limit: number = 100,
  ) => {
    if (env.IS_MOCK) return Promise.resolve({ data: { entries: [] } });
    return apiClient.get(`/gamification/leaderboard/${metric}`, {
      params: { limit },
    });
  },

  getMyStreak: () => {
    if (env.IS_MOCK)
      return Promise.resolve({
        data: { current: 0, longest: 0, bonus: 0 },
      });
    return apiClient.get("/gamification/streak");
  },

  updateStreak: () => {
    if (env.IS_MOCK) return Promise.resolve({ data: { streak: 0 } });
    return apiClient.post("/gamification/streak/update");
  },

  getStreakHistory: () => {
    if (env.IS_MOCK) return Promise.resolve({ data: { history: [] } });
    return apiClient.get("/gamification/streak/history");
  },
};

// ── Quality Score API ──
export const qualityScoreAPI = {
  getMyScore: () => {
    if (env.IS_MOCK) return Promise.resolve({ data: { score: 100 } });
    return apiClient.get("/quality-score/me");
  },

  getScoreHistory: () => {
    if (env.IS_MOCK) return Promise.resolve({ data: { history: [] } });
    return apiClient.get("/quality-score/history");
  },

  updateScore: () => {
    if (env.IS_MOCK) return Promise.resolve({ data: { score: 100 } });
    return apiClient.post("/quality-score/update");
  },

  getFilteredTasks: (minQualityScore?: number) => {
    if (env.IS_MOCK) return Promise.resolve({ data: { tasks: [] } });
    return apiClient.get("/quality-score/filtered-tasks", {
      params: { minQualityScore },
    });
  },
};

// ── Analytics API ──
export const analyticsAPI = {
  getAdvertiserAnalytics: () => {
    if (env.IS_MOCK)
      return Promise.resolve({
        data: {
          totalTasksPosted: 0,
          totalCompletions: 0,
          completionRate: 0,
          totalClicks: 0,
          totalCostPerTask: 0,
          averageCostPerCompletion: 0,
          totalSpent: 0,
          tasksData: [],
        },
      });
    return apiClient.get("/analytics/advertiser");
  },

  getTaskAnalytics: (taskId: string) => {
    if (env.IS_MOCK)
      return Promise.resolve({
        data: {
          taskId,
          completions: 0,
          clicks: 0,
          revenue: 0,
        },
      });
    return apiClient.get(`/analytics/tasks/${taskId}`);
  },

  recordTaskClick: (taskId: string) => {
    if (env.IS_MOCK) return Promise.resolve({ data: { message: "mock" } });
    return apiClient.post(`/analytics/tasks/${taskId}/click`);
  },

  recordTaskCompletion: (taskId: string) => {
    if (env.IS_MOCK) return Promise.resolve({ data: { message: "mock" } });
    return apiClient.post(`/analytics/tasks/${taskId}/completion`);
  },

  getAnalyticsSummary: (period: "day" | "week" | "month" = "week") => {
    if (env.IS_MOCK)
      return Promise.resolve({
        data: {
          period,
          totalEarnings: 0,
          totalSpent: 0,
          totalTasks: 0,
          growth: 0,
        },
      });
    return apiClient.get("/analytics/summary", { params: { period } });
  },
};
