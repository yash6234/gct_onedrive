import { NextRequest } from "next/server";
import * as adapter from "@/lib/auth-adapter";
import * as otp from "@/lib/otp-store";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { login } = (await req.json().catch(() => ({}))) as {
      login?: string;
    };

    if (!login) {
      return Response.json({ ok: false, error: "Missing login" }, { status: 400 });
    }

    // Local OTP mode: generate+store a code and return ok
    const LOCAL = process.env.LOCAL_OTP_MODE === "1";
    if (LOCAL) {
      const digits = parseInt(process.env.OTP_DIGITS || "5", 10);
      const code = otp.generateCode(Number.isFinite(digits) ? digits : 5);
      otp.set(login, code);
      if (process.env.DEBUG_AUTH === "1") {
        console.log(`[otp] generated for ${login}:`, code);
      }
      const body: Record<string, any> = { ok: true };
      if (process.env.SHOW_DEV_OTP === "1") body.code = code;
      return Response.json(body);
    }

    // Otherwise, use backend adapter
    const ok = await adapter.sendCode(login);
    return Response.json({ ok });
  } catch (error) {
    console.error("/api/auth/otp/send error", error);
    return Response.json(
      { ok: false, error: "Failed to send code" },
      { status: 500 }
    );
  }
}
