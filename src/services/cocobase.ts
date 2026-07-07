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

export const cocobaseAuth = {
  async login(email: string, password: string) {
    if (!cocobaseClient) throw new Error("Cocobase is not configured");
    const result = await cocobaseClient.auth.login({ email, password });
    return {
      user: normalizeUser(result.user ?? null, "earner"),
      token: cocobaseClient.auth.getToken(),
    };
  },

  async register(payload: {
    name: string;
    nickname?: string;
    email: string;
    password: string;
    role: Role;
  }) {
    if (!cocobaseClient) throw new Error("Cocobase is not configured");
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
  },

  async getCurrentUser() {
    if (!cocobaseClient) return null;
    const user = await cocobaseClient.auth.getCurrentUser();
    return normalizeUser(user, "earner");
  },

  async verifyEmail() {
    if (!cocobaseClient) return true;
    await cocobaseClient.auth.updateUser({ data: { isEmailVerified: true } });
    return true;
  },

  async forgotPassword(email: string) {
    if (!cocobaseClient) return true;
    await cocobaseClient.auth.requestPasswordReset(email);
    return true;
  },
};

export const cocobaseTasks = {
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
