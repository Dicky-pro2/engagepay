import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types";
import { useAppStore } from "./appStore";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  updateWallet: (newBalance: number) => void;
  updateName: (name: string) => void;
  verifyEmail: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: (user, accessToken, refreshToken) =>
        set((state) => {
          // If this is the same user re-authenticating, keep the locally
          // tracked wallet/stat values instead of letting a stale login
          // payload (e.g. local demo storage) overwrite real progress.
          const preserved =
            state.user && state.user.id === user.id
              ? {
                  walletBalance: state.user.walletBalance,
                  totalEarned: state.user.totalEarned,
                  totalSpent: state.user.totalSpent,
                  tasksCompleted: state.user.tasksCompleted,
                  tasksPosted: state.user.tasksPosted,
                }
              : {};

          const nextUser = { ...user, ...preserved };

          useAppStore.getState().loadUserData(nextUser.id);

          return {
            user: nextUser,
            accessToken,
            refreshToken,
            isAuthenticated: true,
          };
        }),

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken, isAuthenticated: true }),

      updateWallet: (newBalance) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, walletBalance: newBalance }
            : state.user,
        })),

      updateName: (name) =>
        set((state) => ({
          user: state.user ? { ...state.user, name } : state.user,
        })),

      verifyEmail: () =>
        set((state) => ({
          user: state.user
            ? { ...state.user, isEmailVerified: true }
            : state.user,
        })),

      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
        useAppStore.getState().clearUserData();
      },
    }),
    {
      name: "zynk-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.user?.id) {
          useAppStore.getState().loadUserData(state.user.id);
        }
      },
    },
  ),
);