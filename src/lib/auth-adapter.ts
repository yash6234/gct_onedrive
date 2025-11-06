// Minimal HTTP adapter for NestJS backend
// Reads only NEST_* env vars and performs fetches to your server.

const RAW_BASE = process.env.NEST_BASE_URL;
const BASE = RAW_BASE?.trim();
const DEV_ALLOW_ANY_OTP = process.env.DEV_ALLOW_ANY_OTP === "1";
const PATH_SEND = process.env.NEST_PATH_SEND_CODE || "/auth/otp/send";
const PATH_VERIFY = process.env.NEST_PATH_VERIFY_CODE || "/auth/otp/verify";
// Most Nest auth setups expose POST /auth/login for local strategy
const PATH_LOGIN_PW = process.env.NEST_PATH_PASSWORD_LOGIN || "/auth/login";
const PATH_ACCEPT = process.env.NEST_PATH_ACCEPT_TERMS || "/auth/accept-terms";
const PATH_LIST = process.env.NEST_PATH_LIST_FILES || "/files";

type Json = Record<string, any>;

function truthyFlag(v: unknown): boolean {
  if (v === true) return true;
  if (typeof v === "number") return v === 1;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    return (
      s === "ok" ||
      s === "success" ||
      s === "true" ||
      s === "1" ||
      s === "yes" ||
      s === "verified" ||
      s === "valid"
    );
  }
  return false;
}
function resolveUrl(path: string): string {
  if (!BASE) throw new Error("NEST_BASE_URL is not set");
  try {
    return new URL(path, BASE).toString();
  } catch {
    throw new Error(`Invalid NEST_BASE_URL: "${RAW_BASE}"`);
  }
}

async function post<T extends Json>(
  path: string,
  body: Json
): Promise<{ ok: boolean; data: T }> {
  // In dev bypass mode, short‑circuit with ok
  if (DEV_ALLOW_ANY_OTP && !BASE) {
    return { ok: true, data: {} as T };
  }
  const url = resolveUrl(path);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (process.env.DEBUG_AUTH === "1")
    console.log("[auth] POST", url, res.status);
  const data = (await res.json().catch(() => ({}))) as T;
  if (process.env.DEBUG_AUTH === "1")
    try { console.log("[auth] POST response", JSON.stringify(data)); } catch {}
  return { ok: res.ok, data };
}

async function get<T extends Json>(
  path: string,
  params?: Record<string, string>
): Promise<T> {
  // In dev bypass mode with no backend, return empty as JSON
  if (DEV_ALLOW_ANY_OTP && !BASE) return {} as T;
  const url = new URL(resolveUrl(path));
  for (const [k, v] of Object.entries(params ?? {})) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (process.env.DEBUG_AUTH === "1")
    console.log("[auth] GET", url.toString(), res.status);
  return (await res.json().catch(() => ({}))) as T;
}

export async function sendCode(login: string): Promise<boolean> {
  if (DEV_ALLOW_ANY_OTP) return true;
  const { ok, data } = await post<Json>(PATH_SEND, {
    login,
    email: login,
    username: login,
    identifier: login,
  });
  // For sending, accept HTTP ok or explicit success-like flags from the backend
  return (
    ok ||
    truthyFlag((data as any)?.ok) ||
    truthyFlag((data as any)?.success) ||
    truthyFlag((data as any)?.sent) ||
    truthyFlag((data as any)?.status)
  );
}

export async function verifyCode(
  login: string,
  code: string
): Promise<boolean> {
  if (DEV_ALLOW_ANY_OTP) return true;
  const { data } = await post<Json>(PATH_VERIFY, {
    login,
    email: login,
    username: login,
    identifier: login,
    code,
    otp: code,
    token: code,
  });
  // Strict: require explicit success-like flag values
  return (
    truthyFlag(data?.ok) ||
    truthyFlag(data?.valid) ||
    truthyFlag(data?.verified) ||
    truthyFlag(data?.success) ||
    truthyFlag(data?.status)
  );
}

export async function loginWithPassword(
  login: string,
  password: string
): Promise<boolean> {
  const body = {
    login,
    email: login,
    username: login,
    identifier: login,
    password,
    pass: password,
  } as Json;

  // Try configured path first, then common fallbacks
  const candidates = [
    PATH_LOGIN_PW,
    '/auth/login',
    '/auth/signin',
    '/auth/password',
    '/login',
  ];

  for (const p of candidates) {
    try {
      const { data } = await post<Json>(p, body);
      const hasToken =
        (typeof (data as any)?.token === 'string' && (data as any).token.length > 0) ||
        (typeof (data as any)?.access_token === 'string' && (data as any).access_token.length > 0) ||
        (typeof (data as any)?.accessToken === 'string' && (data as any).accessToken.length > 0) ||
        (typeof (data as any)?.jwt === 'string' && (data as any).jwt.length > 0);

      const hasUser =
        (!!(data as any)?.user && typeof (data as any).user === 'object') ||
        (!!(data as any)?.account && typeof (data as any).account === 'object') ||
        (!!(data as any)?.profile && typeof (data as any).profile === 'object');

      const messageOk = typeof (data as any)?.message === 'string' && /(success|logged|authenticated)/i.test((data as any).message);

      const ok =
        truthyFlag((data as any)?.ok) ||
        truthyFlag((data as any)?.valid) ||
        truthyFlag((data as any)?.authenticated) ||
        truthyFlag((data as any)?.success) ||
        truthyFlag((data as any)?.status) ||
        hasToken ||
        (hasUser && !(data as any)?.error) ||
        messageOk;
      if (ok) return true;
    } catch {
      // ignore and try next
    }
  }
  return false;
}

export async function loginWithPasswordResult(
  login: string,
  password: string
): Promise<{ ok: boolean; data: any }> {
  const body = {
    login,
    email: login,
    username: login,
    identifier: login,
    password,
    pass: password,
  } as Json;
  const candidates = [PATH_LOGIN_PW, '/auth/login', '/auth/signin', '/auth/password', '/login'];
  for (const p of candidates) {
    try {
      const { data } = await post<Json>(p, body);
      const hasToken =
        (typeof (data as any)?.token === 'string' && (data as any).token.length > 0) ||
        (typeof (data as any)?.access_token === 'string' && (data as any).access_token.length > 0) ||
        (typeof (data as any)?.accessToken === 'string' && (data as any).accessToken.length > 0) ||
        (typeof (data as any)?.jwt === 'string' && (data as any).jwt.length > 0);
      const hasUser =
        (!!(data as any)?.user && typeof (data as any).user === 'object') ||
        (!!(data as any)?.account && typeof (data as any).account === 'object') ||
        (!!(data as any)?.profile && typeof (data as any).profile === 'object');
      const messageOk = typeof (data as any)?.message === 'string' && /(success|logged|authenticated)/i.test((data as any).message);
      const ok =
        truthyFlag((data as any)?.ok) ||
        truthyFlag((data as any)?.valid) ||
        truthyFlag((data as any)?.authenticated) ||
        truthyFlag((data as any)?.success) ||
        truthyFlag((data as any)?.status) ||
        hasToken ||
        (hasUser && !(data as any)?.error) ||
        messageOk;
      if (ok) return { ok: true, data };
      // return first non-empty data for diagnostics
      if (Object.keys(data || {}).length) return { ok: false, data };
    } catch {}
  }
  return { ok: false, data: {} };
}

export async function acceptTerms(login: string): Promise<boolean> {
  if (DEV_ALLOW_ANY_OTP) return true;
  const { data } = await post<Json>(PATH_ACCEPT, {
    login,
    email: login,
    accepted: true,
  });
  return (
    truthyFlag(data?.ok) ||
    truthyFlag(data?.accepted) ||
    truthyFlag(data?.success) ||
    truthyFlag(data?.status)
  );
}

export async function listFiles(login: string) {
  try {
    if (DEV_ALLOW_ANY_OTP && !BASE) {
      // Provide a simple mock list for dev/demo
      return [
        { name: "Welcome.docx", opened: "Today", owner: login || "Me" },
        { name: "Budget.xlsx", opened: "Yesterday", owner: login || "Me" },
        { name: "Pitch.pptx", opened: "1 week ago", owner: login || "Me" },
      ];
    }
    const data = await get<Json>(PATH_LIST, { login });
    const d: any = data as any;
    return Array.isArray(d?.files) ? d.files : Array.isArray(d) ? d : [];
  } catch {
    if (DEV_ALLOW_ANY_OTP) {
      return [
        { name: "Welcome.docx", opened: "Today", owner: login || "Me" },
        { name: "Budget.xlsx", opened: "Yesterday", owner: login || "Me" },
        { name: "Pitch.pptx", opened: "1 week ago", owner: login || "Me" },
      ];
    }
    return [];
  }
}
