import { NextRequest } from "next/server";
import * as adapter from "@/lib/auth-adapter";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { login, password } = body as { login?: string; password?: string };
  const { ok, data } = await adapter.loginWithPasswordResult(login ?? "", password ?? "");
  if (ok) return Response.json({ ok: true });
  const msg: string = String((data?.message || data?.error || "Invalid credentials")).toLowerCase();
  if (/email\s*not\s*verified/.test(msg)) {
    try { await adapter.sendCode(login ?? ""); } catch {}
    return Response.json({ ok: false, error: "Email not verified", needsVerification: true }, { status: 401 });
  }
  return Response.json({ ok: false, error: data?.message || data?.error || "Invalid credentials" }, { status: 401 });
}
