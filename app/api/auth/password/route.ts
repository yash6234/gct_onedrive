import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import * as adapter from "@/lib/auth-adapter";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { login, password } = body as { login?: string; password?: string };
  const { ok, data } = await adapter.loginWithPasswordResult(
    login ?? "",
    password ?? ""
  );

  if (ok) {
    // Try to capture a login_type from the backend response and persist it
    const extractLoginType = (src: any): string | null => {
      if (!src || typeof src !== "object") return null;
      const candidates = [
        src.loginType,
        src.login_type,
        src.type,
        src.data?.loginType,
        src.data?.login_type,
        src.data?.type,
        src.data?.user?.loginType,
        src.data?.user?.login_type,
        src.data?.user?.type,
      ];
      for (const v of candidates) {
        if (typeof v === "string" && v.trim().length > 0) {
          return v.trim().toUpperCase();
        }
      }
      return null;
    };

    const loginType = extractLoginType(data);
    if (loginType) {
      try {
        const store = await cookies();
        const secure =
          process.env.NEXT_SECURE_COOKIE === "1" ||
          process.env.NODE_ENV === "production";
        store.set("login_type", loginType, {
          httpOnly: true,
          secure,
          sameSite: "lax",
          path: "/",
        });
      } catch {
        // ignore cookie write failures
      }
    }

    return Response.json({ ok: true, loginType });
  }

  const msg: string = String(
    (data?.message || data?.error || "Invalid credentials") as any
  ).toLowerCase();
  if (/email\s*not\s*verified/.test(msg)) {
    try {
      await adapter.sendCode(login ?? "");
    } catch {}
    return Response.json(
      {
        ok: false,
        error: "Email not verified",
        needsVerification: true,
      },
      { status: 401 }
    );
  }
  return Response.json(
    { ok: false, error: (data as any)?.message || (data as any)?.error || "Invalid credentials" },
    { status: 401 }
  );
}
