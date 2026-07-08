import { Cocobase, type AppUser, type Document } from "cocobase";
import env from "../config/env";
import { authAPI } from "./api";
import type { Role, Task, User } from "../types";

const hasCocobaseConfig = Boolean(
  env.COCOBASE_API_KEY && env.COCOBASE_PROJECT_ID,
);
const SHARED_TASKS_STORAGE_KEY = "zynk-shared-tasks";
const LOCAL_AUTH_USERS_STORAGE_KEY = "zynk-local-auth-users";

type LocalAuthUser = {
  id: string;
  name: string;
  nickname: string | null;
  email: string;
  password: string;
  role: Role;
  avatar: string | null;
  walletBalance: number;
  totalEarned: number;
  totalSpent: number;
  tasksCompleted: number;
  tasksPosted: number;
  isEmailVerified: boolean;
};

export const cocobaseClient = hasCocobaseConfig
  ? new Cocobase({
      apiKey: env.COCOBASE_API_KEY,
      projectId: env.COCOBASE_PROJECT_ID,
      baseURL: env.COCOBASE_BASE_URL || undefined,
      timeout: 60000,
    })
  : null;

export const isCocobaseEnabled = Boolean(cocobaseClient);

function readLocalAuthUsers(): LocalAuthUser[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(LOCAL_AUTH_USERS_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as Array<Partial<LocalAuthUser>>;
    return parsed.filter((entry): entry is LocalAuthUser =>
      Boolean(entry?.email && typeof entry.password === "string"),
    );
  } catch {
    return [];
  }
}

function writeLocalAuthUsers(users: LocalAuthUser[]) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      LOCAL_AUTH_USERS_STORAGE_KEY,
      JSON.stringify(users),
    );
  } catch {
    // Ignore storage issues and continue with in-memory fallback.
  }
}

function ensureDemoAuthUsers(): LocalAuthUser[] {
  const existing = readLocalAuthUsers();
  if (existing.length > 0) return existing;

  const demoUsers: LocalAuthUser[] = [
    {
      id: "demo-advertiser",
      name: "Demo Advertiser",
      nickname: "demoadv",
      email: "adv@test.com",
      password: "Password123!",
      role: "advertiser",
      avatar: null,
      walletBalance: 2500,
      totalEarned: 0,
      totalSpent: 0,
      tasksCompleted: 0,
      tasksPosted: 0,
      isEmailVerified: true,
    },
    {
      id: "demo-earner",
      name: "Demo Earner",
      nickname: "demoearn",
      email: "earner@test.com",
      password: "Password123!",
      role: "earner",
      avatar: null,
      walletBalance: 340,
      totalEarned: 1200,
      totalSpent: 0,
      tasksCompleted: 3,
      tasksPosted: 0,
      isEmailVerified: true,
    },
    {
      id: "demo-admin",
      name: "Demo Admin",
      nickname: "demoadmin",
      email: "admin@test.com",
      password: "Password123!",
      role: "admin",
      avatar: null,
      walletBalance: 0,
      totalEarned: 0,
      totalSpent: 0,
      tasksCompleted: 0,
      tasksPosted: 0,
      isEmailVerified: true,
    },
  ];

  writeLocalAuthUsers(demoUsers);
  return demoUsers;
}

function buildLocalAuthUser(payload: {
  name: string;
  nickname?: string;
  email: string;
  password: string;
  role: Role;
}): LocalAuthUser {
  return {
    id: `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: payload.name.trim() || "User",
    nickname: payload.nickname?.trim() || null,
    email: payload.email.trim().toLowerCase(),
    password: payload.password,
    role: payload.role,
    avatar: null,
    walletBalance: 0,
    totalEarned: 0,
    totalSpent: 0,
    tasksCompleted: 0,
    tasksPosted: 0,
    isEmailVerified: true,
  };
}

function createLocalAuthResult(user: LocalAuthUser) {
  const normalizedUser: User = {
    id: user.id,
    name: user.name,
    nickname: user.nickname,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    walletBalance: user.walletBalance,
    totalEarned: user.totalEarned,
    totalSpent: user.totalSpent,
    tasksCompleted: user.tasksCompleted,
    tasksPosted: user.tasksPosted,
    isEmailVerified: user.isEmailVerified,
  };

  return {
    user: normalizedUser,
    token: `local-token-${user.id}`,
    refreshToken: `local-refresh-${user.id}`,
  };
}

function loginLocalAuthUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = ensureDemoAuthUsers();
  const match = users.find(
    (user) =>
      user.email.toLowerCase() === normalizedEmail &&
      user.password === password,
  );

  if (!match) return null;
  return createLocalAuthResult(match);
}

function registerLocalAuthUser(payload: {
  name: string;
  nickname?: string;
  email: string;
  password: string;
  role: Role;
}) {
  const normalizedEmail = payload.email.trim().toLowerCase();
  const users = ensureDemoAuthUsers();
  const exists = users.some(
    (user) => user.email.toLowerCase() === normalizedEmail,
  );

  if (exists) {
    throw new Error("An account with this email already exists.");
  }

  const newUser = buildLocalAuthUser(payload);
  users.push(newUser);
  writeLocalAuthUsers(users);
  return createLocalAuthResult(newUser);
}

function normalizeRole(value: unknown, fallback: Role = "earner"): Role {
  if (value === "advertiser" || value === "earner" || value === "admin") {
    return value;
  }
  return fallback;
}

function pickFirstDefined<T>(
  ...values: Array<T | undefined | null>
): T | undefined {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    return value;
  }
  return undefined;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return undefined;
}

function asNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function asBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1" || normalized === "yes") {
      return true;
    }
    if (normalized === "false" || normalized === "0" || normalized === "no") {
      return false;
    }
  }
  return fallback;
}

export function normalizeUser(
  appUser?: AppUser | null,
  fallbackRole: Role = "earner",
): User | null {
  if (!appUser) return null;

  const data = asRecord(appUser.data);
  const role = normalizeRole(
    pickFirstDefined(
      asString(data.role),
      asString(data.userRole),
      appUser.roles?.[0],
    ),
    fallbackRole,
  );

  return {
    id: appUser.id,
    name:
      asString(data.name) ??
      asString(data.fullName) ??
      appUser.email?.split("@")[0] ??
      "User",
    nickname:
      pickFirstDefined(
        asString(data.nickname),
        asString(data.nickName),
        asString(data.username),
      ) ?? null,
    email: appUser.email,
    role,
    avatar: asString(data.avatar) ?? null,
    walletBalance: asNumber(data.walletBalance),
    totalEarned: asNumber(data.totalEarned),
    totalSpent: asNumber(data.totalSpent),
    tasksCompleted: asNumber(data.tasksCompleted),
    tasksPosted: asNumber(data.tasksPosted),
    isEmailVerified: asBoolean(data.isEmailVerified, true),
  };
}

// Purpose: convert raw Cocobase documents into the app's task shape so the earner UI can render them consistently.
function normalizeTask(document: Document<Record<string, unknown>>): Task {
  const data = asRecord(document.data);
  const totalSlots = asNumber(data.totalSlots);
  const completionCount = asNumber(data.completionCount);
  const slotsLeft = Math.max(0, totalSlots - completionCount);
  const advertiserId =
    asString(data.advertiserId) ?? asString(data.advertiser) ?? "";
  const advertiserName =
    asString(data.advertiserName) ??
    asString(data.advertiserDisplayName) ??
    "Advertiser";

  return {
    id: document.id,
    advertiser: advertiserId,
    advertiserName,
    advertiserId,
    advertiserEmail: asString(data.advertiserEmail) ?? "",
    advertiserDisplayName:
      asString(data.advertiserDisplayName) ?? advertiserName,
    platform: asString(data.platform) ?? "",
    taskType: asString(data.taskType) ?? "",
    title: asString(data.title) ?? "Untitled task",
    instructions: asString(data.instructions) ?? "",
    url: asString(data.url) ?? "",
    reward: asNumber(data.reward),
    totalSlots,
    slotsLeft,
    completionCount,
    status: (asString(data.status) as Task["status"] | undefined) ?? "active",
    createdAt: asString(data.createdAt) ?? asString(document.created_at) ?? "",
  };
}

function normalizeBackendUser(
  payload: unknown,
  fallbackRole: Role = "earner",
  fallbackName?: string,
  fallbackNickname?: string,
): User | null {
  if (!payload || typeof payload !== "object") return null;

  const directData = payload as Record<string, unknown>;
  const nestedData = asRecord(directData.data);
  const mergedData = { ...nestedData, ...directData } as Record<
    string,
    unknown
  >;
  const roleValues = Array.isArray(mergedData.roles)
    ? (mergedData.roles as unknown[])
    : [];
  const role = normalizeRole(
    pickFirstDefined(
      mergedData.role,
      mergedData.userRole,
      roleValues[0],
      mergedData.type,
      directData.role,
      directData.userRole,
      directData.type,
    ),
    fallbackRole,
  );

  const firstName = pickFirstDefined(
    asString(mergedData.firstName),
    asString(nestedData.firstName),
    asString(mergedData.name),
    asString(nestedData.name),
    asString(mergedData.fullName),
    asString(nestedData.fullName),
    asString(mergedData.displayName),
    asString(nestedData.displayName),
    asString(mergedData.username),
    asString(nestedData.username),
    fallbackName,
  );
  const lastName = pickFirstDefined(
    asString(mergedData.lastName),
    asString(nestedData.lastName),
  );
  const fullName = firstName
    ? [firstName, lastName].filter(Boolean).join(" ").trim()
    : undefined;

  return {
    id:
      asString(
        pickFirstDefined(
          mergedData.id,
          mergedData._id,
          mergedData.userId,
          mergedData.uuid,
        ),
      ) ?? `user-${Date.now()}`,
    name:
      fullName ??
      pickFirstDefined(
        asString(mergedData.name),
        asString(mergedData.fullName),
        asString(mergedData.displayName),
        asString(mergedData.username),
        asString(mergedData.email)?.split("@")[0],
        fallbackName,
      ) ??
      "User",
    nickname:
      pickFirstDefined(
        asString(mergedData.nickname),
        asString(mergedData.nickName),
        asString(mergedData.username),
        fallbackNickname,
      ) ?? null,
    email:
      pickFirstDefined(
        asString(mergedData.email),
        asString(mergedData.username),
      ) ?? "",
    role,
    avatar:
      pickFirstDefined(
        asString(mergedData.avatar),
        asString(mergedData.profilePicture),
      ) ?? null,
    walletBalance: asNumber(
      pickFirstDefined(mergedData.walletBalance, mergedData.balance),
    ),
    totalEarned: asNumber(pickFirstDefined(mergedData.totalEarned)),
    totalSpent: asNumber(pickFirstDefined(mergedData.totalSpent)),
    tasksCompleted: asNumber(
      pickFirstDefined(mergedData.tasksCompleted, mergedData.tasks_completed),
    ),
    tasksPosted: asNumber(
      pickFirstDefined(mergedData.tasksPosted, mergedData.tasks_posted),
    ),
    isEmailVerified: asBoolean(
      pickFirstDefined(
        mergedData.isEmailVerified,
        mergedData.emailVerified,
        mergedData.verified,
      ),
      true,
    ),
  };
}

function normalizeAuthResult(
  responseData: unknown,
  fallbackRole: Role = "earner",
  fallbackName?: string,
  fallbackNickname?: string,
) {
  const root = asRecord(responseData);
  const body = asRecord(root.data);
  const nestedBody = asRecord(body.data);
  const userPayload = body.user ?? nestedBody.user ?? body.profile ?? body;
  const accessToken =
    asString(body.accessToken) ??
    asString(body.token) ??
    asString(nestedBody.accessToken) ??
    asString(nestedBody.token) ??
    null;
  const refreshToken =
    asString(body.refreshToken) ??
    asString(nestedBody.refreshToken) ??
    asString(body.refresh_token) ??
    null;

  return {
    user: normalizeBackendUser(
      userPayload,
      fallbackRole,
      fallbackName,
      fallbackNickname,
    ),
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
        await response.text();
      } catch {
        // Ignore parse failures and fall back to the generic message below.
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
      const localResult = registerLocalAuthUser({
        name: "Google User",
        email: `google-${Date.now()}@local.dev`,
        password: `google-${Date.now()}`,
        role: fallbackRole,
      });
      return localResult;
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
      const localResult = loginLocalAuthUser(email, password);
      if (localResult) return localResult;
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
        nickname: payload.nickname,
        email: payload.email,
        password: payload.password,
        role: payload.role,
      });
      const { user, token, refreshToken } = normalizeAuthResult(
        response.data,
        payload.role,
        payload.name,
        payload.nickname,
      );
      if (!user) throw new Error("Unable to create account");
      return {
        user,
        token: token ?? "backend_token",
        refreshToken: refreshToken ?? "backend_refresh",
      };
    } catch (error) {
      const localResult = registerLocalAuthUser(payload);
      return localResult;
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
        const documents = await cocobaseClient.listDocuments<
          Record<string, unknown>
        >("tasks", {
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
      taskSubmissions?: Array<Record<string, unknown>>;
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
