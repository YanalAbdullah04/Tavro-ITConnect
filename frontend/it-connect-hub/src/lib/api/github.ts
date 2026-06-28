import { apiRequest } from "@/lib/api/client";

type UnknownRecord = Record<string, unknown>;

export interface GitHubRepository {
  id: number | string;
  name: string;
  description?: string | null;
  full_name: string;
  html_url: string;
  language?: string | null;
  stargazers_count?: number;
  default_branch: string;
  updated_at?: string;
  private?: boolean;
  owner: {
    login: string;
    avatar_url?: string;
  };
}

export interface GitHubStatusResponse {
  isConnected: boolean;
  isStale: boolean;
  installationId?: number | null;
  accountLogin?: string | null;
  accountAvatarUrl?: string | null;
  accountHtmlUrl?: string | null;
  repositorySelection?: string | null;
}

export interface GitHubInstallUrlResponse {
  installUrl: string;
  stateExpiresAt: string;
}

export interface SelectedRepo {
  repoId: string;
  repoName: string;
  owner: string;
  fullName: string;
  htmlUrl: string;
  defaultBranch?: string | null;
  branch: string;
}

export interface GitHubBranch {
  name: string;
  commit?: unknown;
}

export interface GitHubContentItem {
  name: string;
  path: string;
  type: "file" | "dir" | string;
  size?: number;
  download_url?: string | null;
  content?: string;
  encoding?: string;
  html_url?: string;
}

export type GitHubContentResponse = GitHubContentItem | GitHubContentItem[];

function isRecord(value: unknown): value is UnknownRecord {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function asString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function asNumber(value: unknown) {
  return typeof value === "number" ? value : undefined;
}

function asBoolean(value: unknown) {
  return typeof value === "boolean" ? value : undefined;
}

function encodePathSegment(value: string) {
  return encodeURIComponent(value);
}

function encodeCatchAllPath(value: string) {
  return value.split("/").filter(Boolean).map(encodeURIComponent).join("/");
}

function getArrayPayload(data: unknown, key: string) {
  if (Array.isArray(data)) return data;
  if (isRecord(data) && Array.isArray(data[key])) return data[key];
  return [];
}

function normalizeRepository(value: unknown): GitHubRepository | null {
  if (!isRecord(value)) return null;

  const name = asString(value.name);
  const fullName = asString(value.full_name);
  const htmlUrl = asString(value.html_url);
  const defaultBranch = asString(value.default_branch);
  const ownerLogin = isRecord(value.owner) ? asString(value.owner.login) : undefined;
  if (!name || !fullName || !htmlUrl || !defaultBranch || !ownerLogin) return null;

  const id = typeof value.id === "number" || typeof value.id === "string" ? value.id : fullName;
  const owner = {
    login: ownerLogin,
    avatar_url: isRecord(value.owner) ? asString(value.owner.avatar_url) : undefined,
  };

  return {
    id,
    name,
    description: value.description === null ? null : asString(value.description),
    full_name: fullName,
    html_url: htmlUrl,
    language: value.language === null ? null : asString(value.language),
    stargazers_count: asNumber(value.stargazers_count),
    default_branch: defaultBranch,
    updated_at: asString(value.updated_at),
    private: asBoolean(value.private),
    owner,
  };
}

function normalizeBranch(value: unknown): GitHubBranch | null {
  if (!isRecord(value)) return null;

  const name = asString(value.name);
  if (!name) return null;

  return {
    name,
    commit: value.commit,
  };
}

function normalizeContentItem(value: unknown): GitHubContentItem | null {
  if (!isRecord(value)) return null;

  const name = asString(value.name);
  const path = asString(value.path);
  const type = asString(value.type);
  if (!name || !path || !type) return null;

  return {
    name,
    path,
    type,
    size: asNumber(value.size),
    download_url: value.download_url === null ? null : asString(value.download_url),
    content: asString(value.content),
    encoding: asString(value.encoding),
    html_url: asString(value.html_url),
  };
}

export function normalizeGitHubRepositories(data: unknown) {
  return getArrayPayload(data, "repositories")
    .map(normalizeRepository)
    .filter((repo): repo is GitHubRepository => repo !== null);
}

export function normalizeGitHubBranches(data: unknown) {
  return getArrayPayload(data, "branches")
    .map(normalizeBranch)
    .filter((branch): branch is GitHubBranch => branch !== null);
}

export function normalizeGitHubContentItems(data: unknown) {
  const payload = Array.isArray(data) ? data : isRecord(data) && Array.isArray(data.items) ? data.items : [data];

  return payload
    .map(normalizeContentItem)
    .filter((item): item is GitHubContentItem => item !== null);
}

function normalizeGitHubContentResponse(data: unknown): GitHubContentResponse {
  const items = normalizeGitHubContentItems(data);
  return Array.isArray(data) || (isRecord(data) && Array.isArray(data.items)) ? items : items[0] ? items[0] : [];
}

export const githubApi = {
  getStatus: () =>
    apiRequest<GitHubStatusResponse>("/api/GitHub/status", { method: "GET" }),

  getInstallUrl: () =>
    apiRequest<GitHubInstallUrlResponse>("/api/GitHub/install-url", { method: "GET" }),

  disconnect: () =>
    apiRequest<void>("/api/GitHub/disconnect", { method: "DELETE" }),

  getRepositories: async (traineeId: string) => {
    const data = await apiRequest<unknown>(`/api/GitHub/repositories/${encodePathSegment(traineeId)}`, { method: "GET" });
    return normalizeGitHubRepositories(data);
  },

  getBranches: async (traineeId: string, owner: string, repoName: string) => {
    const data = await apiRequest<unknown>(
      `/api/GitHub/branches/${encodePathSegment(traineeId)}/${encodePathSegment(owner)}/${encodePathSegment(repoName)}`,
      { method: "GET" },
    );
    return normalizeGitHubBranches(data);
  },

  getContent: async (traineeId: string, owner: string, repoName: string, branch: string) => {
    const data = await apiRequest<unknown>(
      `/api/GitHub/content/${encodePathSegment(traineeId)}/${encodePathSegment(owner)}/${encodePathSegment(repoName)}?branch=${encodeURIComponent(branch)}`,
      { method: "GET" },
    );
    return normalizeGitHubContentItems(data);
  },

  getContentByPath: async (traineeId: string, owner: string, repoName: string, branch: string, filePath: string) => {
    const data = await apiRequest<unknown>(
      `/api/GitHub/content/${encodePathSegment(traineeId)}/${encodePathSegment(owner)}/${encodePathSegment(repoName)}?branch=${encodeURIComponent(branch)}&filePath=${encodeURIComponent(filePath)}`,
      { method: "GET" },
    );
    return normalizeGitHubContentResponse(data);
  },
};

export function getGitHubCallbackOrigin() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? window.location.origin;
  return new URL(apiBaseUrl, window.location.origin).origin;
}

/**
 * Compare an incoming MessageEvent origin against the expected GitHub callback origin.
 * Normalises `localhost` / `127.0.0.1` so that minor hostname differences don't
 * silently prevent the postMessage from being recognised.
 */
export function isGitHubCallbackOriginMatch(eventOrigin: string): boolean {
  const expected = getGitHubCallbackOrigin();
  if (eventOrigin === expected) return true;

  try {
    const normalize = (o: string) => {
      const url = new URL(o);
      const host = url.hostname === "127.0.0.1" ? "localhost" : url.hostname;
      return `${url.protocol}//${host}:${url.port || (url.protocol === "https:" ? "443" : "80")}`;
    };
    return normalize(eventOrigin) === normalize(expected);
  } catch {
    return false;
  }
}
