// Minimal HTTP adapter for NestJS backend
// Reads only NEST_* env vars and performs fetches to your server.

const BASE = process.env.NEST_BASE_URL;
const PATH_SEND = process.env.NEST_PATH_SEND_CODE || "/auth/otp/send";
const PATH_VERIFY = process.env.NEST_PATH_VERIFY_CODE || "/auth/otp/verify";
const PATH_ACCEPT = process.env.NEST_PATH_ACCEPT_TERMS || "/auth/accept-terms";
const PATH_LIST = process.env.NEST_PATH_LIST_FILES || "/files";

type Json = Record<string, any>;

async function post<T extends Json>(
  path: string,
  body: Json
): Promise<{ ok: boolean; data: T }> {
  if (!BASE) throw new Error("NEST_BASE_URL is not set");
  const url = new URL(path, BASE).toString();
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (process.env.DEBUG_AUTH === "1")
    console.log("[auth] POST", url, res.status);
  const data = (await res.json().catch(() => ({}))) as T;
  return { ok: res.ok, data };
}

async function get<T extends Json>(
  path: string,
  params?: Record<string, string>
): Promise<T> {
  if (!BASE) throw new Error("NEST_BASE_URL is not set");
  const url = new URL(path, BASE);
  for (const [k, v] of Object.entries(params ?? {})) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (process.env.DEBUG_AUTH === "1")
    console.log("[auth] GET", url.toString(), res.status);
  return (await res.json().catch(() => ({}))) as T;
}

export async function sendCode(login: string): Promise<boolean> {
  const { ok, data } = await post<Json>(PATH_SEND, {
    login,
    email: login,
    username: login,
    identifier: login,
  });
  return ok || !!(data?.ok ?? data?.success ?? data?.sent ?? data?.status);
}

export async function verifyCode(
  login: string,
  code: string
): Promise<boolean> {
  const { ok, data } = await post<Json>(PATH_VERIFY, {
    login,
    email: login,
    username: login,
    identifier: login,
    code,
    otp: code,
    token: code,
  });
  return (
    ok ||
    !!(
      data?.ok ??
      data?.valid ??
      data?.verified ??
      data?.success ??
      data?.status
    )
  );
}

export async function acceptTerms(login: string): Promise<boolean> {
  const { ok, data } = await post<Json>(PATH_ACCEPT, {
    login,
    email: login,
    accepted: true,
  });
  return ok || !!(data?.ok ?? data?.accepted ?? data?.success ?? data?.status);
}

export async function listFiles(login: string) {
  const data = await get<Json>(PATH_LIST, { login });
  return (data?.files as any[]) || (data as any[]).files || [];
}
