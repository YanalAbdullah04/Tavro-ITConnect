import { clearAuthSession, getToken } from "@/lib/api/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const UNEXPECTED_ERROR_MESSAGE = "Tavro could not complete this request right now. Please try again in a moment.";
const NETWORK_ERROR_MESSAGE = "Tavro services are unreachable. Please check your connection and try again.";

export class ApiError extends Error {
  status: number;
  errors: string[];

  constructor(status: number, errors: string[], message = "API request failed") {
    super(errors.length > 0 ? errors.join("\n") : message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  authenticated?: boolean;
};

function buildUrl(path: string, query?: Record<string, string | number | boolean | null | undefined>) {
  const baseUrl = API_BASE_URL.replace(/\/$/, "");
  const url = new URL(`${baseUrl}${path}`, window.location.origin);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

async function parseResponse(response: Response) {
  if (response.status === 204) return null;

  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getErrorMessages(data: unknown, fallback: string) {
  if (data && typeof data === "object" && "message" in data) {
    const message = (data as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return [message];
  }

  if (data && typeof data === "object" && "errors" in data) {
    const errors = (data as { errors?: unknown }).errors;
    if (Array.isArray(errors)) return errors.map(String);
    if (errors && typeof errors === "object") {
      const validationErrors = Object.values(errors).flatMap((value) => Array.isArray(value) ? value.map(String) : [String(value)]);
      if (validationErrors.length > 0) return validationErrors;
    }
  }

  if (typeof data === "string" && data.trim()) return [data];

  return [fallback];
}

function getSafeErrorMessages(status: number, data: unknown, fallback: string) {
  if (status === 0) return [NETWORK_ERROR_MESSAGE];
  if (status >= 500) return [UNEXPECTED_ERROR_MESSAGE];

  return getErrorMessages(data, fallback);
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
  query?: Record<string, string | number | boolean | null | undefined>,
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;

  if (!isFormData) {
    headers.set("Content-Type", "application/json");
  }
  headers.set("ngrok-skip-browser-warning", "69420");
  if (options.authenticated !== false && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(buildUrl(path, query), {
      ...options,
      headers,
      body: options.body === undefined ? undefined : isFormData ? options.body as FormData : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError(0, [NETWORK_ERROR_MESSAGE], "Network request failed");
  }

  const data = await parseResponse(response);

  if (response.status === 401) {
    clearAuthSession();
    if (window.location.pathname !== "/login") {
      window.location.assign("/login");
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, getSafeErrorMessages(response.status, data, response.statusText), response.statusText);
  }

  return data as T;
}

export function getApiErrorMessages(error: unknown) {
  if (error instanceof ApiError) return error.errors;
  if (error instanceof Error) return [error.message];
  return ["Something went wrong. Please try again."];
}
