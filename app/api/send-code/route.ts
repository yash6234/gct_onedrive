import { NextRequest } from "next/server";
import * as adapter from "@/lib/auth-adapter";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { login } = (await req.json().catch(() => ({}))) as {
      login?: string;
    };

    if (!login) {
      return Response.json({ ok: false, error: "Missing login" }, { status: 400 });
    }

    const ok = await adapter.sendCode(login);
    return Response.json({ ok });
  } catch (error) {
    console.error("/api/send-code error", error);
    return Response.json(
      { ok: false, error: "Failed to send code" },
      { status: 500 }
    );
  }
}
