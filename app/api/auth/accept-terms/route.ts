import { NextRequest } from "next/server";
import * as adapter from "@/lib/auth-adapter";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { login } = (await req.json().catch(() => ({}))) as { login?: string };
  const ok = await adapter.acceptTerms(login ?? "");
  return Response.json({ ok });
}
