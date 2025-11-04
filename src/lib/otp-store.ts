// Simple in-memory OTP store for dev/local mode
// Uses globalThis to persist across hot-reload within the same process

type Entry = { code: string; expiresAt: number };

function now() { return Date.now(); }

function getMap(): Map<string, Entry> {
  const g = globalThis as any;
  if (!g.__OTP_STORE__) g.__OTP_STORE__ = new Map<string, Entry>();
  return g.__OTP_STORE__ as Map<string, Entry>;
}

export function generateCode(digits = 5) {
  const max = Math.pow(10, digits);
  const n = Math.floor(Math.random() * max);
  return n.toString().padStart(digits, "0");
}

export function set(login: string, code: string, ttlMs = 10 * 60 * 1000) {
  const map = getMap();
  map.set(login.toLowerCase(), { code, expiresAt: now() + ttlMs });
}

export function verify(login: string, code: string): boolean {
  const map = getMap();
  const key = login.toLowerCase();
  const e = map.get(key);
  if (!e) return false;
  if (e.expiresAt < now()) { map.delete(key); return false; }
  const ok = e.code === code;
  if (ok) map.delete(key);
  return ok;
}

export function get(login: string): string | null {
  const map = getMap();
  const e = map.get(login.toLowerCase());
  if (!e) return null;
  if (e.expiresAt < now()) { map.delete(login.toLowerCase()); return null; }
  return e.code;
}

