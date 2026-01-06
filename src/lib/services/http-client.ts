// Shared HTTP client utilities for NestJS backend communication

function getBaseUrl(): string {
  const BASE_URL = process.env.NEST_BASE_URL?.trim();
  if (!BASE_URL) {
    throw new Error("NEST_BASE_URL is not set");
  }
  return BASE_URL;
}

let VOLATILE_BEARER = "";
export function setBearerToken(token?: string | null) {
  VOLATILE_BEARER = token || "";
  try {
    (globalThis as any).__NEST_BEARER_TOKEN__ = VOLATILE_BEARER;
  } catch {}
}

function authHeaders(): Record<string, string> {
  const h: Record<string, string> = {};
  const runtimeToken = (globalThis as any)?.__NEST_BEARER_TOKEN__ as
    | string
    | undefined;
  const token = (
    VOLATILE_BEARER ||
    runtimeToken ||
    process.env.NEST_BEARER ||
    ""
  ).trim();
  if (token) {
    h["authorization"] = token.toLowerCase().startsWith("bearer ")
      ? token
      : `Bearer ${token}`;
  }
  if (process.env.NEST_API_KEY) {
    h["x-api-key"] = process.env.NEST_API_KEY;
  }
  return h;
}

export async function httpRequest(
  path: string,
  init?: RequestInit
): Promise<{ ok: boolean; data: any; status: number }> {
  const cleaned = path.startsWith("/") ? path : "/" + path;
  const url = new URL(cleaned, getBaseUrl()).toString();
  const merged: RequestInit = { cache: "no-store", ...(init || {}) };
  const headers = { ...authHeaders(), ...(merged.headers as any) };
  merged.headers = headers;

  const res = await fetch(url, merged);
  const data = await res.json().catch(() => ({}));

  if (process.env.DEBUG_NEST === "1") {
    console.log("[nest]", merged.method || "GET", url, "->", res.status);
    try {
      console.log("[nest] body:", JSON.stringify(data));
    } catch {}
  }

  return { ok: res.ok, data, status: res.status };
}

export function resolveUrl(path: string): string {
  try {
    return new URL(path, getBaseUrl()).toString();
  } catch {
    throw new Error(`Invalid NEST_BASE_URL: "${getBaseUrl()}"`);
  }
}
