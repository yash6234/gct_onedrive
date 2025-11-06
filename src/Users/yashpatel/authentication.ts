// NestJS backend client for user management
// Import path as requested: '@/Users/yashpatel/authentication'

export type DbUser = {
  id: number;
  name: string;
  email: string;
  mobile: string;
  tempPassword: string | null;
};

function base() {
  const b = process.env.NEST_BASE_URL;
  if (!b) throw new Error('NEST_BASE_URL is not set');
  return b;
}

function usersListPath() {
  return (
    process.env.NEST_PATH_USERS_LIST ||
    process.env.NEST_PATH_USERS ||
    '/users'
  );
}

function usersCreatePath() {
  return (
    process.env.NEST_PATH_USERS_CREATE ||
    process.env.NEST_PATH_USERS ||
    '/users'
  );
}

function usersUpdatePath(id?: number | string) {
  const p = (
    process.env.NEST_PATH_USERS_UPDATE ||
    process.env.NEST_PATH_USERS ||
    '/users'
  );
  if (!id) return p;
  return p.includes('{id}') ? p.replace('{id}', String(id)) : (p.endsWith('/') ? p + id : p + '/' + id);
}

function usersDeletePath(id?: number | string) {
  const p = (
    process.env.NEST_PATH_USERS_DELETE ||
    process.env.NEST_PATH_USERS ||
    '/users'
  );
  if (!id) return p;
  return p.includes('{id}') ? p.replace('{id}', String(id)) : (p.endsWith('/') ? p + id : p + '/' + id);
}

function authHeaders() {
  const h: Record<string, string> = {};
  if (process.env.NEST_BEARER) h['authorization'] = `Bearer ${process.env.NEST_BEARER}`;
  if (process.env.NEST_API_KEY) h['x-api-key'] = process.env.NEST_API_KEY;
  return h;
}

async function http(path: string, init?: RequestInit): Promise<{ ok: boolean; data: any; status: number }> {
  const cleaned = path.startsWith('/') ? path : '/' + path;
  const url = new URL(cleaned, base()).toString();
  const merged: RequestInit = { cache: 'no-store', ...(init || {}) };
  const hdr = { ...authHeaders(), ...(merged.headers as any) };
  merged.headers = hdr;
  const res = await fetch(url, merged);
  const data = await res.json().catch(() => ({}));
  if (process.env.DEBUG_NEST === '1') {
    console.log('[nest]', merged.method || 'GET', url, '->', res.status);
    try { console.log('[nest] body:', JSON.stringify(data)); } catch {}
  }
  return { ok: res.ok, data, status: res.status };
}

function notifyTempPath() {
  // If not configured explicitly, do not attempt notify to avoid 404s
  return process.env.NEST_PATH_NOTIFY_TEMP || process.env.NEST_PATH_USERS_NOTIFY || '';
}

export async function notifyTempPassword(input: { email: string; tempPassword: string; name?: string }): Promise<boolean> {
  const p = notifyTempPath();
  if (!p) return false; // silently skip when no path configured
  const body: any = { email: input.email, tempPassword: input.tempPassword };
  if (input.name) body.name = input.name;
  const { ok, status } = await http(p, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (process.env.DEBUG_NEST === '1') console.log('[nest] notify temp', ok, 'status', status);
  return ok;
}

export async function listUsers(): Promise<DbUser[]> {
  const { ok, data } = await http(usersListPath());
  if (!ok) return [];
  const arr = Array.isArray(data) ? data : (data?.users as any[]) || (data?.data as any[]) || [];
  return arr.map((r: any, i: number) => ({
    id: Number(r?.id ?? i + 1),
    name: String(r?.name ?? ''),
    email: String(r?.email ?? ''),
    mobile: String(r?.mobile ?? ''),
    tempPassword: r?.tempPassword ?? r?.temp_password ?? null,
  }));
}

export async function addUser(input: { name: string; email: string; mobile: string; tempPassword: string }): Promise<DbUser> {
  // Allow backend field name mapping via env for flexibility
  const nameKey = process.env.NEST_USER_NAME_KEY || 'name';
  const emailKey = process.env.NEST_USER_EMAIL_KEY || 'email';
  const mobileKey = process.env.NEST_USER_MOBILE_KEY || 'mobile';
  const passKey = process.env.NEST_USER_TEMP_PASSWORD_KEY || 'tempPassword';
  const body: any = { [nameKey]: input.name, [emailKey]: input.email, [mobileKey]: input.mobile, [passKey]: input.tempPassword };
  const method = (process.env.NEST_METHOD_USERS_CREATE || 'POST').toUpperCase();
  const primaryPath = usersCreatePath();
  // Try primary, then common fallbacks if 404/405
  const candidates: Array<{ path: string; method: string }> = [ { path: primaryPath, method } ];
  // Try POST/PUT alternates
  const altMethod = method === 'POST' ? 'PUT' : 'POST';
  candidates.push({ path: primaryPath, method: altMethod });

  // Also try appending '/create' if not present
  if (!primaryPath.endsWith('/create')) {
    candidates.push({ path: primaryPath.replace(/\/?$/, '/create'), method });
  }

  let lastStatus = 0;
  for (const cand of candidates) {
    const { ok, data, status } = await http(cand.path, {
      method: cand.method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    lastStatus = status;
    if (ok) {
      const r = data?.user ?? data?.data ?? data;
      return {
        id: Number(r?.id ?? 0),
        name: String(r?.name ?? r?.[nameKey] ?? input.name),
        email: String(r?.email ?? r?.[emailKey] ?? input.email),
        mobile: String(r?.mobile ?? r?.[mobileKey] ?? input.mobile),
        tempPassword: r?.tempPassword ?? r?.temp_password ?? r?.[passKey] ?? input.tempPassword,
      };
    }
    if (process.env.DEBUG_NEST === '1') console.log('[nest] create fallback tried', cand.method, cand.path, '->', status);
    // Only probe alternatives on 404/405
    if (![404, 405].includes(status)) break;
  }
  throw new Error(`Nest addUser failed (status ${lastStatus})`);
}

export async function updateUser(input: { id: number; name: string; email: string; mobile: string; tempPassword?: string }): Promise<DbUser> {
  const nameKey = process.env.NEST_USER_NAME_KEY || 'name';
  const emailKey = process.env.NEST_USER_EMAIL_KEY || 'email';
  const mobileKey = process.env.NEST_USER_MOBILE_KEY || 'mobile';
  const passKey = process.env.NEST_USER_TEMP_PASSWORD_KEY || 'tempPassword';
  const body: any = { [nameKey]: input.name, [emailKey]: input.email, [mobileKey]: input.mobile };
  if (input.tempPassword) body[passKey] = input.tempPassword;
  const method = (process.env.NEST_METHOD_USERS_UPDATE || 'PUT').toUpperCase();
  const id = input.id;
  const primaryPath = usersUpdatePath(id);
  const candidates: Array<{ path: string; method: string }> = [ { path: primaryPath, method } ];
  const altMethod = method === 'PUT' ? 'PATCH' : 'PUT';
  candidates.push({ path: primaryPath, method: altMethod });
  // Also try without id in path (id in body)
  candidates.push({ path: usersUpdatePath(), method });
  // And as a final fallback, reuse create endpoint with POST (your Nest POST upserts)
  candidates.push({ path: usersCreatePath(), method: 'POST' });
  for (const cand of candidates) {
    const { ok, data, status } = await http(cand.path, {
      method: cand.method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...body }),
    });
    if (ok) {
      const r = data?.user ?? data?.data ?? data;
      return {
        id: Number(r?.id ?? id),
        name: String(r?.name ?? r?.[nameKey] ?? input.name),
        email: String(r?.email ?? r?.[emailKey] ?? input.email),
        mobile: String(r?.mobile ?? r?.[mobileKey] ?? input.mobile),
        tempPassword: r?.tempPassword ?? r?.temp_password ?? r?.[passKey] ?? null,
      };
    }
    if (process.env.DEBUG_NEST === '1') console.log('[nest] update fallback tried', cand.method, cand.path, '->', status);
    if (![404,405].includes(status)) break;
  }
  throw new Error('Nest updateUser failed');
}

export async function deleteUser(id: number): Promise<boolean> {
  const method = (process.env.NEST_METHOD_USERS_DELETE || 'DELETE').toUpperCase();
  const primaryPath = usersDeletePath(id);
  const candidates: Array<{ path: string; method: string }> = [ { path: primaryPath, method } ];
  // Also try sending id in body to base path
  candidates.push({ path: usersDeletePath(), method });
  // Common convention: POST/DELETE to /users/delete
  const delSuffix = primaryPath.endsWith('/delete') ? primaryPath : (primaryPath.replace(/\/?$/, '/delete'));
  candidates.push({ path: delSuffix, method });
  // Try POST for services that don't allow DELETE
  const altMethod = (method === 'DELETE') ? 'POST' : method;
  candidates.push({ path: delSuffix, method: altMethod });
  for (const cand of candidates) {
    const init: RequestInit = { method: cand.method };
    if (!cand.path.includes(String(id))) {
      init.headers = { 'Content-Type': 'application/json' };
      (init as any).body = JSON.stringify({ id });
    }
    const { ok, status } = await http(cand.path, init);
    if (ok) return true;
    if (process.env.DEBUG_NEST === '1') console.log('[nest] delete fallback tried', cand.method, cand.path, '->', status);
    if (![404,405].includes(status)) break;
  }
  return false;
}
