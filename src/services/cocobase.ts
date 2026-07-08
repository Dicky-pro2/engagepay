import { Cocobase, type AppUser, type Document } from "cocobase";
import env from "../config/env";
import { authAPI } from "./api";
import type { Role, Task, User } from "../types";

const hasCocobaseConfig = Boolean(
  env.COCOBASE_API_KEY && env.COCOBASE_PROJECT_ID,
);
const SHARED_TASKS_STORAGE_KEY = "zynk-shared-tasks";

export const cocobaseClient = hasCocobaseConfig
  ? new Cocobase({
      apiKey: env.COCOBASE_API_KEY,
      projectId: env.COCOBASE_PROJECT_ID,
      baseURL: env.COCOBASE_BASE_URL || undefined,
      timeout: 60000,
    })
  : null;

export const isCocobaseEnabled = Boolean(cocobaseClient);

function normalizeRole(value: unknown, fallback: Role = "earner"): Role {
  if (value === "advertiser" || value === "earner" || value === "admin") {
    return value;
  }
  return fallback;
}

export function normalizeUser(
  appUser?: AppUser | null,
  fallbackRole: Role = "earner",
): User | null {
  if (!appUser) return null;

  const data = appUser.data ?? {};
  const role = normalizeRole(
    data.role ?? data.userRole ?? appUser.roles?.[0],
    fallbackRole,
  );

  return {
    id: appUser.id,
    name: data.name ?? data.fullName ?? appUser.email?.split("@")[0] ?? "User",
    nickname: data.nickname ?? data.nickName ?? data.username ?? null,
    email: appUser.email,
    role,
    avatar: data.avatar ?? null,
    walletBalance: Number(data.walletBalance ?? 0),
    totalEarned: Number(data.totalEarned ?? 0),
    totalSpent: Number(data.totalSpent ?? 0),
    tasksCompleted: Number(data.tasksCompleted ?? 0),
    tasksPosted: Number(data.tasksPosted ?? 0),
    isEmailVerified: Boolean(data.isEmailVerified ?? true),
  };
}

// Purpose: convert raw Cocobase documents into the app's task shape so the earner UI can render them consistently.
function normalizeTask(document: Document<any>): Task {
  const data = document.data ?? {};
  const totalSlots = Number(data.totalSlots ?? 0);
  const completionCount = Number(data.completionCount ?? 0);
  const slotsLeft = Math.max(0, totalSlots - completionCount);
  const advertiserId = data.advertiserId ?? data.advertiser ?? "";
  const advertiserName =
    data.advertiserName ?? data.advertiserDisplayName ?? "Advertiser";

  return {
    id: document.id,
    advertiser: advertiserId,
    advertiserName,
    advertiserId,
    advertiserEmail: data.advertiserEmail ?? "",
    advertiserDisplayName: data.advertiserDisplayName ?? advertiserName,
    platform: data.platform ?? "",
    taskType: data.taskType ?? "",
    title: data.title ?? "Untitled task",
    instructions: data.instructions ?? "",
    url: data.url ?? "",
    reward: Number(data.reward ?? 0),
    totalSlots,
    slotsLeft,
    completionCount,
    status: data.status ?? "active",
    createdAt: data.createdAt ?? document.created_at,
  };
}

function normalizeBackendUser(
  payload: unknown,
  fallbackRole: Role = "earner",
): User | null {
  if (!payload || typeof payload !== "object") return null;

  const data = payload as Record<string, any>;
  const role = normalizeRole(
    data.role ?? data.userRole ?? data.roles?.[0] ?? data.type,
    fallbackRole,
  );

  return {
    id: data.id ?? data._id ?? data.userId ?? data.uuid ?? `user-${Date.now()}`,
    name:
      data.name ??
      data.fullName ??
      data.displayName ??
      data.username ??
      data.email?.split("@")[0] ??
      "User",
    nickname: data.nickname ?? data.nickName ?? data.username ?? null,
    email: data.email ?? data.username ?? "",
    role,
    avatar: data.avatar ?? data.profilePicture ?? null,
    walletBalance: Number(data.walletBalance ?? data.balance ?? 0),
    totalEarned: Number(data.totalEarned ?? 0),
    totalSpent: Number(data.totalSpent ?? 0),
    tasksCompleted: Number(data.tasksCompleted ?? data.tasks_completed ?? 0),
    tasksPosted: Number(data.tasksPosted ?? data.tasks_posted ?? 0),
    isEmailVerified: Boolean(
      data.isEmailVerified ?? data.emailVerified ?? data.verified ?? true,
    ),
  };
}

function normalizeAuthResult(
  responseData: unknown,
  fallbackRole: Role = "earner",
) {
  const root = (responseData ?? {}) as Record<string, any>;
  const body = (root.data ?? root) as Record<string, any>;
  const userPayload = body.user ?? body.data?.user ?? body.profile ?? body;
  const accessToken =
    body.accessToken ??
    body.token ??
    body.data?.accessToken ??
    body.data?.token ??
    null;
  const refreshToken =
    body.refreshToken ?? body.data?.refreshToken ?? body.refresh_token ?? null;

  return {
    user: normalizeBackendUser(userPayload, fallbackRole),
    token: accessToken,
    refreshToken,
  };
}

function normalizeAuthError(error: unknown): Error {
  if (error instanceof Error) {
    const message = error.message?.toLowerCase() ?? "";
    if (message.includes("timeout") || message.includes("timed out")) {
      return new Error(
        "The sign-in service is taking too long. Please try again in a moment.",
      );
    }
    if (
      message.includes("unauthorized") ||
      message.includes("invalid") ||
      message.includes("credential")
    ) {
      return new Error("Incorrect email or password.");
    }
    return new Error(error.message);
  }
  return new Error("Unable to sign in right now.");
}

async function requestCocobase(
  path: string,
  options: { method: string; body?: unknown; useDataKey?: boolean },
) {
  if (!cocobaseClient) throw new Error("Cocobase is not configured");

  const baseUrl = (env.COCOBASE_BASE_URL || "https://api.cocobase.cc").replace(
    /\/$/,
    "",
  );
  const url = `${baseUrl}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (env.COCOBASE_API_KEY) {
    headers["x-api-key"] = env.COCOBASE_API_KEY;
  }

  const token = cocobaseClient.auth.getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: options.method,
    headers,
    ...(options.body !== undefined
      ? {
          body: JSON.stringify(
            options.useDataKey === false
              ? options.body
              : { data: options.body },
          ),
        }
      : {}),
  });

  if (!response.ok) {
    let errorDetail: unknown = null;
    try {
      errorDetail = await response.json();
    } catch {
      try {
        errorDetail = await response.text();
      } catch {
        errorDetail = null;
      }
    }

    const message =
      typeof errorDetail === "string"
        ? errorDetail
        : errorDetail && typeof errorDetail === "object"
          ? JSON.stringify(errorDetail)
          : "Cocobase request failed";

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  const text = await response.text();
  if (!text.trim()) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const cocobaseAuth = {
  async googleLogin(idToken: string, fallbackRole: Role = "earner") {
    try {
      const response = await authAPI.googleAuth(idToken, fallbackRole);
      const { user, token, refreshToken } = normalizeAuthResult(
        response.data,
        fallbackRole,
      );
      if (!user) throw new Error("Unable to sign in");
      return {
        user,
        token: token ?? "backend_token",
        refreshToken: refreshToken ?? "backend_refresh",
      };
    } catch (error) {
      throw normalizeAuthError(error);
    }
  },

  async login(email: string, password: string) {
    try {
      const response = await authAPI.login({ email, password });
      const { user, token, refreshToken } = normalizeAuthResult(
        response.data,
        "earner",
      );
      if (!user) throw new Error("Unable to sign in");
      return {
        user,
        token: token ?? "backend_token",
        refreshToken: refreshToken ?? "backend_refresh",
      };
    } catch (error) {
      throw normalizeAuthError(error);
    }
  },

  async register(payload: {
    name: string;
    nickname?: string;
    email: string;
    password: string;
    role: Role;
  }) {
    try {
      const response = await authAPI.register({
        name: payload.name,
        email: payload.email,
        password: payload.password,
        role: payload.role,
      });
      const { user, token, refreshToken } = normalizeAuthResult(
        response.data,
        payload.role,
      );
      if (!user) throw new Error("Unable to create account");
      return {
        user,
        token: token ?? "backend_token",
        refreshToken: refreshToken ?? "backend_refresh",
      };
    } catch (error) {
      throw normalizeAuthError(error);
    }
  },

  async getCurrentUser() {
    if (!cocobaseClient) return null;
    const user = await cocobaseClient.auth.getCurrentUser();
    return normalizeUser(user, "earner");
  },

  async requestEmailVerification() {
    await requestCocobase("/auth-collections/verify-email/send", {
      method: "POST",
      body: {},
      useDataKey: false,
    });
    return true;
  },

  async verifyEmail(token: string) {
    await requestCocobase("/auth-collections/verify-email/verify", {
      method: "POST",
      body: { token },
      useDataKey: false,
    });
    return true;
  },

  async resendVerificationEmail() {
    await requestCocobase("/auth-collections/verify-email/resend", {
      method: "POST",
      body: {},
      useDataKey: false,
    });
    return true;
  },

  async forgotPassword(email: string) {
    if (!cocobaseClient) return true;
    await cocobaseClient.auth.requestPasswordReset(email);
    return true;
  },
};

function readStoredTasksFromLocalStorage(): Task[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(SHARED_TASKS_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as Partial<{
      tasks?: Task[];
      myTasks?: Task[];
    }>;

    return Array.isArray(parsed.tasks) ? parsed.tasks : [];
  } catch {
    return [];
  }
}

function writeStoredTasksToLocalStorage(tasks: Task[]) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      SHARED_TASKS_STORAGE_KEY,
      JSON.stringify({ tasks, myTasks: [] }),
    );
  } catch {
    // localStorage is unavailable; continue with in-memory state only
  }
}

export const cocobaseTasks = {
  // Purpose: load task records from Cocobase for the earner browse page and other task-driven views.
  async list() {
    if (cocobaseClient) {
      try {
        const documents = await cocobaseClient.listDocuments<any>("tasks", {
          sort: "created_at",
          order: "desc",
        });
        return documents.map(normalizeTask);
      } catch (error) {
        console.warn(
          "Falling back to local task storage because CocoBase task list failed",
          error,
        );
      }
    }

    return readStoredTasksFromLocalStorage();
  },

  async create(
    payload: Omit<
      Task,
      "id" | "createdAt" | "slotsLeft" | "completionCount" | "status"
    > & {
      status?: Task["status"];
      completedByCurrentUser?: boolean;
      taskSubmissions?: any[];
      advertiserId?: string;
      advertiserEmail?: string;
      advertiserDisplayName?: string;
    },
  ) {
    const taskPayload = {
      ...payload,
      advertiser: payload.advertiser ?? payload.advertiserId ?? "",
      advertiserId: payload.advertiserId ?? payload.advertiser ?? "",
      advertiserName:
        payload.advertiserName ?? payload.advertiserDisplayName ?? "Advertiser",
      advertiserEmail: payload.advertiserEmail ?? "",
      advertiserDisplayName:
        payload.advertiserDisplayName ?? payload.advertiserName ?? "Advertiser",
      createdAt: new Date().toISOString(),
      completionCount: 0,
      slotsLeft: payload.totalSlots,
      status: payload.status ?? "active",
      taskSubmissions: payload.taskSubmissions ?? [],
    };

    if (!cocobaseClient) {
      const localTask: Task = {
        id: `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        advertiser: taskPayload.advertiser,
        advertiserName: taskPayload.advertiserName,
        platform: taskPayload.platform,
        taskType: taskPayload.taskType,
        title: taskPayload.title,
        instructions: taskPayload.instructions,
        url: taskPayload.url,
        reward: taskPayload.reward,
        totalSlots: taskPayload.totalSlots,
        slotsLeft: taskPayload.slotsLeft,
        completionCount: taskPayload.completionCount,
        status: taskPayload.status,
        createdAt: taskPayload.createdAt,
        completedByCurrentUser: payload.completedByCurrentUser ?? false,
        taskSubmissions: taskPayload.taskSubmissions,
      };

      const existingTasks = readStoredTasksFromLocalStorage();
      const nextTasks = [localTask, ...existingTasks];
      writeStoredTasksToLocalStorage(nextTasks);
      return localTask;
    }

    const document = await cocobaseClient.createDocument("tasks", taskPayload);
    const createdTask = normalizeTask(document);
    const existingTasks = readStoredTasksFromLocalStorage();
    const nextTasks = [createdTask, ...existingTasks];
    writeStoredTasksToLocalStorage(nextTasks);
    return createdTask;
  },
};
