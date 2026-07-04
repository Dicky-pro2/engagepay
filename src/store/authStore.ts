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

      login: (user, accessToken, refreshToken) => {
        set({ user, accessToken, refreshToken, isAuthenticated: true });
        useAppStore.getState().loadUserData(user.id);
      },

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
