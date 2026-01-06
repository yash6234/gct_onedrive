// Authentication service for NestJS backend
// Handles OTP, password login, and terms acceptance

import { httpRequest, resolveUrl } from "./http-client";

const DEV_ALLOW_ANY_OTP = process.env.DEV_ALLOW_ANY_OTP === "1";
const PATH_SEND = process.env.NEST_PATH_SEND_CODE || "/auth/otp/send";
const PATH_VERIFY = process.env.NEST_PATH_VERIFY_CODE || "/auth/otp/verify";
const PATH_LOGIN_PW = process.env.NEST_PATH_PASSWORD_LOGIN || "/auth/login";
const PATH_ACCEPT = process.env.NEST_PATH_ACCEPT_TERMS || "/auth/accept-terms";

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

async function post<T extends Json>(
  path: string,
  body: Json
): Promise<{ ok: boolean; data: T }> {
  if (DEV_ALLOW_ANY_OTP && !process.env.NEST_BASE_URL?.trim()) {
    return { ok: true, data: {} as T };
  }
  const url = resolveUrl(path);
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (process.env.DEBUG_AUTH === "1") {
    console.log("[auth] POST", url, res.status);
  }
  const data = (await res.json().catch(() => ({}))) as T;
  if (process.env.DEBUG_AUTH === "1") {
    try {
      console.log("[auth] POST response", JSON.stringify(data));
    } catch {}
  }
  return { ok: res.ok, data };
}

export async function sendCode(login: string): Promise<boolean> {
  if (DEV_ALLOW_ANY_OTP) return true;
  const { ok, data } = await post<Json>(PATH_SEND, {
    login,
    email: login,
    username: login,
    identifier: login,
  });
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

  const candidates = [
    PATH_LOGIN_PW,
    "/auth/login",
    "/auth/signin",
    "/auth/password",
    "/login",
  ];

  for (const p of candidates) {
    try {
      const { data } = await post<Json>(p, body);
      const hasToken =
        (typeof (data as any)?.token === "string" &&
          (data as any).token.length > 0) ||
        (typeof (data as any)?.access_token === "string" &&
          (data as any).access_token.length > 0) ||
        (typeof (data as any)?.accessToken === "string" &&
          (data as any).accessToken.length > 0) ||
        (typeof (data as any)?.jwt === "string" &&
          (data as any).jwt.length > 0);

      const hasUser =
        (!!(data as any)?.user && typeof (data as any).user === "object") ||
        (!!(data as any)?.account &&
          typeof (data as any).account === "object") ||
        (!!(data as any)?.profile &&
          typeof (data as any).profile === "object");

      const messageOk =
        typeof (data as any)?.message === "string" &&
        /(success|logged|authenticated)/i.test((data as any).message);

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
  const candidates = [
    PATH_LOGIN_PW,
    "/auth/login",
    "/auth/signin",
    "/auth/password",
    "/login",
  ];
  let fallbackData: any = null;
  for (const p of candidates) {
    try {
      const { data } = await post<Json>(p, body);
      const hasToken =
        (typeof (data as any)?.token === "string" &&
          (data as any).token.length > 0) ||
        (typeof (data as any)?.access_token === "string" &&
          (data as any).access_token.length > 0) ||
        (typeof (data as any)?.accessToken === "string" &&
          (data as any).accessToken.length > 0) ||
        (typeof (data as any)?.jwt === "string" &&
          (data as any).jwt.length > 0);
      const hasUser =
        (!!(data as any)?.user && typeof (data as any).user === "object") ||
        (!!(data as any)?.account &&
          typeof (data as any).account === "object") ||
        (!!(data as any)?.profile &&
          typeof (data as any).profile === "object");
      const messageOk =
        typeof (data as any)?.message === "string" &&
        /(success|logged|authenticated)/i.test((data as any).message);
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
      if (!fallbackData && Object.keys(data || {}).length) {
        fallbackData = data;
      }
    } catch {}
  }
  return { ok: false, data: fallbackData || {} };
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

