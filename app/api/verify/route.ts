import { NextRequest } from "next/server";
import * as adapter from "@/lib/auth-adapter";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { login, code } = body as { login?: string; code?: string };

  const ok = await adapter.verifyCode(login ?? "", code ?? "");
  return Response.json({ ok });
}
