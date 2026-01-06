// User management service for NestJS backend
// Handles CRUD operations for users

import { httpRequest, setBearerToken } from "./http-client";

export type DbUser = {
  id?: number;
  name: string;
  email: string;
  mobile: string;
  tempPassword: string | null;
};

function usersListPath() {
  return (
    process.env.NEST_PATH_USERS_LIST ||
    process.env.NEST_PATH_USERS ||
    "/users"
  );
}

function usersCreatePath() {
  return (
    process.env.NEST_PATH_USERS_CREATE ||
    process.env.NEST_PATH_USERS ||
    "/users"
  );
}

function usersUpdatePath(id?: number | string) {
  const p =
    process.env.NEST_PATH_USERS_UPDATE ||
    process.env.NEST_PATH_USERS ||
    "/users";
  if (!id) return p;
  return p.includes("{id}")
    ? p.replace("{id}", String(id))
    : p.endsWith("/")
    ? p + id
    : p + "/" + id;
}

function usersDeletePath(id?: number | string) {
  const p =
    process.env.NEST_PATH_USERS_DELETE ||
    process.env.NEST_PATH_USERS ||
    "/users";
  if (!id) return p;
  return p.includes("{id}")
    ? p.replace("{id}", String(id))
    : p.endsWith("/")
    ? p + id
    : p + "/" + id;
}

function notifyTempPath() {
  return process.env.NEST_PATH_NOTIFY_TEMP || process.env.NEST_PATH_USERS_NOTIFY || "";
}

export async function notifyTempPassword(input: {
  email: string;
  tempPassword: string;
  name?: string;
}): Promise<boolean> {
  const p = notifyTempPath();
  if (!p) return false;
  const body: any = { email: input.email, tempPassword: input.tempPassword };
  if (input.name) body.name = input.name;
  const { ok, status } = await httpRequest(p, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (process.env.DEBUG_NEST === "1")
    console.log("[nest] notify temp", ok, "status", status);
  return ok;
}

export async function listUsers(): Promise<DbUser[]> {
  const { ok, data } = await httpRequest(usersListPath());
  if (!ok) return [];
  const arr = Array.isArray(data)
    ? data
    : (data?.users as any[]) || (data?.data as any[]) || [];
  return arr.map((r: any) => {
    const fallbackIdSources = [
      r?.id,
      r?.userId,
      r?.user_id,
      r?.userID,
      r?._id,
    ];
    const numericId = fallbackIdSources
      .map((val) => Number(val))
      .find((val) => Number.isFinite(val) && val > 0);
    return {
      id: numericId,
      name: String(r?.name ?? ""),
      email: String(r?.email ?? ""),
      mobile: String(r?.mobile ?? ""),
      tempPassword: r?.tempPassword ?? r?.temp_password ?? null,
    };
  });
}

export async function addUser(input: {
  name: string;
  email: string;
  mobile: string;
  tempPassword: string;
}): Promise<DbUser> {
  const nameKey = process.env.NEST_USER_NAME_KEY || "name";
  const emailKey = process.env.NEST_USER_EMAIL_KEY || "email";
  const mobileKey = process.env.NEST_USER_MOBILE_KEY || "mobile";
  const passKey = process.env.NEST_USER_TEMP_PASSWORD_KEY || "tempPassword";
  const body: any = {
    [nameKey]: input.name,
    [emailKey]: input.email,
    [mobileKey]: input.mobile,
    [passKey]: input.tempPassword,
  };
  const method = (process.env.NEST_METHOD_USERS_CREATE || "POST").toUpperCase();
  const primaryPath = usersCreatePath();
  const candidates: Array<{ path: string; method: string }> = [
    { path: primaryPath, method },
  ];
  const altMethod = method === "POST" ? "PUT" : "POST";
  candidates.push({ path: primaryPath, method: altMethod });

  if (!primaryPath.endsWith("/create")) {
    candidates.push({
      path: primaryPath.replace(/\/?$/, "/create"),
      method,
    });
  }

  let lastStatus = 0;
  let lastData: any = null;
  for (const cand of candidates) {
    const { ok, data, status } = await httpRequest(cand.path, {
      method: cand.method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    lastStatus = status;
    lastData = data;
    if (ok) {
      const r = data?.user ?? data?.data ?? data;
      return {
        id: Number(r?.id ?? 0),
        name: String(r?.name ?? r?.[nameKey] ?? input.name),
        email: String(r?.email ?? r?.[emailKey] ?? input.email),
        mobile: String(r?.mobile ?? r?.[mobileKey] ?? input.mobile),
        tempPassword:
          r?.tempPassword ?? r?.temp_password ?? r?.[passKey] ?? input.tempPassword,
      };
    }
    if (process.env.DEBUG_NEST === "1")
      console.log(
        "[nest] create fallback tried",
        cand.method,
        cand.path,
        "->",
        status
      );
    if (![404, 405].includes(status)) break;
  }
  const msg =
    lastData?.error ||
    lastData?.message ||
    `Nest addUser failed (status ${lastStatus})`;
  throw new Error(String(msg));
}

export async function updateUser(input: {
  id: number;
  name: string;
  email: string;
  mobile: string;
  tempPassword?: string;
}): Promise<DbUser> {
  const nameKey = process.env.NEST_USER_NAME_KEY || "name";
  const emailKey = process.env.NEST_USER_EMAIL_KEY || "email";
  const mobileKey = process.env.NEST_USER_MOBILE_KEY || "mobile";
  const passKey = process.env.NEST_USER_TEMP_PASSWORD_KEY || "tempPassword";
  const body: any = {
    [nameKey]: input.name,
    [emailKey]: input.email,
    [mobileKey]: input.mobile,
  };
  if (input.tempPassword) body[passKey] = input.tempPassword;
  const method = (process.env.NEST_METHOD_USERS_UPDATE || "PUT").toUpperCase();
  const id = input.id;
  const primaryPath = id > 0 ? usersUpdatePath(id) : usersUpdatePath();
  const candidates: Array<{ path: string; method: string }> = [
    { path: primaryPath, method },
  ];
  const altMethod = method === "PUT" ? "PATCH" : "PUT";
  candidates.push({ path: primaryPath, method: altMethod });
  candidates.push({ path: usersUpdatePath(), method });
  candidates.push({ path: usersCreatePath(), method: "POST" });

  let lastStatus = 0;
  let lastData: any = null;
  for (const cand of candidates) {
    const { ok, data, status } = await httpRequest(cand.path, {
      method: cand.method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...body }),
    });
    if (ok) {
      const r = data?.user ?? data?.data ?? data;
      return {
        id: Number(r?.id ?? id),
        name: String(r?.name ?? r?.[nameKey] ?? input.name),
        email: String(r?.email ?? r?.[emailKey] ?? input.email),
        mobile: String(r?.mobile ?? r?.[mobileKey] ?? input.mobile),
        tempPassword:
          r?.tempPassword ?? r?.temp_password ?? r?.[passKey] ?? null,
      };
    }
    lastStatus = status;
    lastData = data;
    if (process.env.DEBUG_NEST === "1")
      console.log(
        "[nest] update fallback tried",
        cand.method,
        cand.path,
        "->",
        status
      );
    if (![404, 405].includes(status)) break;
  }
  const msg =
    lastData?.error ||
    lastData?.message ||
    `Nest updateUser failed (status ${lastStatus})`;
  const err = new Error(String(msg)) as any;
  err.status = lastStatus;
  throw err;
}

export async function deleteUser(id: number): Promise<boolean> {
  const method = (process.env.NEST_METHOD_USERS_DELETE || "DELETE").toUpperCase();
  const primaryPath = usersDeletePath(id);
  const candidates: Array<{ path: string; method: string }> = [
    { path: primaryPath, method },
  ];
  candidates.push({ path: usersDeletePath(), method });
  const delSuffix = primaryPath.endsWith("/delete")
    ? primaryPath
    : primaryPath.replace(/\/?$/, "/delete");
  candidates.push({ path: delSuffix, method });
  const altMethod = method === "DELETE" ? "POST" : method;
  candidates.push({ path: delSuffix, method: altMethod });
  for (const cand of candidates) {
    const init: RequestInit = { method: cand.method };
    if (!cand.path.includes(String(id))) {
      init.headers = { "Content-Type": "application/json" };
      (init as any).body = JSON.stringify({ id });
    }
    const { ok, status } = await httpRequest(cand.path, init);
    if (ok) return true;
    if (process.env.DEBUG_NEST === "1")
      console.log(
        "[nest] delete fallback tried",
        cand.method,
        cand.path,
        "->",
        status
      );
    if (![404, 405].includes(status)) break;
  }
  return false;
}

// Re-export setBearerToken for convenience
export { setBearerToken };

