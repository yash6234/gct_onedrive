import { NextRequest } from "next/server";
import { listUsers, notifyTempPassword } from "@/lib/services/users.service";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, password, phone, mobile } = body || {};
    const phoneValue = String(phone || mobile || "").trim();
    if (!firstName || !lastName || !email || !password || !phoneValue)
      return Response.json({ ok: false, error: "Missing fields (firstName, lastName, email, password, phone)" }, { status: 400 });

    // Basic duplicate check against existing auth/users listing
    const existing = await listUsers();
    if (existing.some((u) => (u.email || "").toLowerCase() === String(email).toLowerCase()))
      return Response.json({ ok: false, error: "An account with this email already exists" }, { status: 409 });

    // Prefer UsersController create route which sets passwordSolid/tempPasswordHash
    const usersCreate = process.env.NEST_PATH_USERS_CREATE || process.env.NEST_PATH_USERS || "/users";
    const base = process.env.NEST_BASE_URL;
    if (!base) return Response.json({ ok: false, error: "NEST_BASE_URL is not set" }, { status: 500 });

    // Map to the UsersController body keys it supports
    const payload: any = {
      name: `${firstName} ${lastName}`.trim(),
      email,
      mobile: phoneValue,
      tempPassword: password,
    };

    const url = new URL(usersCreate.startsWith("/") ? usersCreate : "/" + usersCreate, base).toString();
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const upstream = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = upstream?.error || upstream?.message || `Registration failed (status ${res.status})`;
      return Response.json({ ok: false, error: msg }, { status: res.status });
    }

    // Optional: email the credentials via notify endpoint if configured
    try {
      await notifyTempPassword({ email, tempPassword: password, name: `${firstName} ${lastName}` });
    } catch {}

    return Response.json({ ok: true });
  } catch (e: any) {
    return Response.json({ ok: false, error: e?.message || "Server error" }, { status: 500 });
  }
}
