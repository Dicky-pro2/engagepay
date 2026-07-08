import { Cocobase, type AppUser, type Document } from "cocobase";
import env from "../config/env";
import type { Role, Task, User } from "../types";

const hasCocobaseConfig = Boolean(
  env.COCOBASE_API_KEY && env.COCOBASE_PROJECT_ID,
);

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

function createLocalUser(
  email: string,
  fallbackRole: Role = "earner",
  overrides?: Partial<User>,
): User {
  const safeName = overrides?.name?.trim() || email.split("@")[0] || "User";
  const safeNickname = overrides?.nickname?.trim() || safeName;

  return {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: safeName,
    nickname: safeNickname,
    email,
    role: overrides?.role ?? fallbackRole,
    avatar: null,
    walletBalance: 0,
    totalEarned: 0,
    totalSpent: 0,
    tasksCompleted: 0,
    tasksPosted: 0,
    isEmailVerified: false,
  };
}

function shouldUseFallback(error: unknown): boolean {
  if (!import.meta.env.DEV) return false;

  if (error instanceof Error) {
    const message = error.message?.toLowerCase() ?? "";
    return (
      message.includes("timeout") ||
      message.includes("timed out") ||
      message.includes("network") ||
      message.includes("fetch") ||
      message.includes("gateway") ||
      message.includes("504")
    );
  }

  return false;
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

  return {
    id: document.id,
    advertiser: data.advertiser ?? "",
    advertiserName: data.advertiserName ?? "Advertiser",
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
    if (!cocobaseClient) {
      const fallbackUser = createLocalUser(
        "google-user@example.com",
        fallbackRole,
        {
          name: "Google User",
          role: fallbackRole,
        },
      );
      console.warn("Cocobase auth unavailable; using local fallback session");
      return {
        user: fallbackUser,
        token: `local-token-${fallbackUser.id}`,
      };
    }
    try {
      const user = await cocobaseClient.auth.loginWithGoogle({
        idToken,
        platform: "web",
      });
      return {
        user: normalizeUser(user ?? null, fallbackRole),
        token: cocobaseClient.auth.getToken(),
      };
    } catch (error) {
      if (shouldUseFallback(error)) {
        const fallbackUser = createLocalUser(
          "google-user@example.com",
          fallbackRole,
          {
            name: "Google User",
            role: fallbackRole,
          },
        );
        return {
          user: fallbackUser,
          token: `local-token-${fallbackUser.id}`,
        };
      }
      throw normalizeAuthError(error);
    }
  },

  async login(email: string, password: string) {
    if (!cocobaseClient) {
      const fallbackUser = createLocalUser(email, "earner", {
        name: email.split("@")[0],
      });
      console.warn("Cocobase auth unavailable; using local fallback session");
      return {
        user: fallbackUser,
        token: `local-token-${fallbackUser.id}`,
      };
    }
    try {
      const result = await cocobaseClient.auth.login({ email, password });
      return {
        user: normalizeUser(result.user ?? null, "earner"),
        token: cocobaseClient.auth.getToken(),
      };
    } catch (error) {
      if (shouldUseFallback(error)) {
        const fallbackUser = createLocalUser(email, "earner", {
          name: email.split("@")[0],
        });
        return {
          user: fallbackUser,
          token: `local-token-${fallbackUser.id}`,
        };
      }
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
    if (!cocobaseClient) {
      const fallbackUser = createLocalUser(payload.email, payload.role, {
        name: payload.name,
        nickname: payload.nickname,
        role: payload.role,
      });
      console.warn("Cocobase auth unavailable; using local fallback session");
      return {
        user: fallbackUser,
        token: `local-token-${fallbackUser.id}`,
      };
    }
    try {
      const result = await cocobaseClient.auth.register({
        email: payload.email,
        password: payload.password,
        data: {
          name: payload.name,
          nickname: payload.nickname ?? null,
          role: payload.role,
          isEmailVerified: false,
        },
      });
      return {
        user: normalizeUser(result.user ?? null, payload.role),
        token: cocobaseClient.auth.getToken(),
      };
    } catch (error) {
      if (shouldUseFallback(error)) {
        const fallbackUser = createLocalUser(payload.email, payload.role, {
          name: payload.name,
          nickname: payload.nickname,
          role: payload.role,
        });
        console.warn(
          "Cocobase auth failed, using local fallback session",
          error,
        );
        return {
          user: fallbackUser,
          token: `local-token-${fallbackUser.id}`,
        };
      }
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

export const cocobaseTasks = {
  // Purpose: load task records from Cocobase for the earner browse page and other task-driven views.
  async list() {
    if (!cocobaseClient) return [] as Task[];
    const documents = await cocobaseClient.listDocuments<any>("tasks", {
      sort: "created_at",
      order: "desc",
    });
    return documents.map(normalizeTask);
  },

  async create(
    payload: Omit<
      Task,
      "id" | "createdAt" | "slotsLeft" | "completionCount" | "status"
    > & {
      status?: Task["status"];
      completedByCurrentUser?: boolean;
      taskSubmissions?: any[];
    },
  ) {
    if (!cocobaseClient) return null;
    const document = await cocobaseClient.createDocument("tasks", {
      ...payload,
      createdAt: new Date().toISOString(),
      completionCount: 0,
      slotsLeft: payload.totalSlots,
      status: payload.status ?? "active",
      taskSubmissions: payload.taskSubmissions ?? [],
    });
    return normalizeTask(document);
  },
};
