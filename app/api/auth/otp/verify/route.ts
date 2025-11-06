import { NextRequest } from "next/server";
import * as adapter from "@/lib/auth-adapter";
import * as otp from "@/lib/otp-store";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { login, code } = body as { login?: string; code?: string };

  // Local OTP mode: compare against generated+stored code
  const LOCAL = process.env.LOCAL_OTP_MODE === "1";
  if (LOCAL) {
    const ok = !!login && !!code && otp.verify(login, code);
    return Response.json({ ok });
  }

  // If an expected OTP is configured, enforce it strictly here
  const expected = process.env.NEXT_EXPECTED_OTP;
  if (expected) {
    const ok = !!code && code === expected;
    return Response.json({ ok });
  }

  const ok = await adapter.verifyCode(login ?? "", code ?? "");
  return Response.json({ ok });
}
