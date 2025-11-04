import { NextRequest } from "next/server";
import * as adapter from "@/lib/auth-adapter";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const login = searchParams.get("login") ?? "";
  const files = await adapter.listFiles(login);
  return Response.json({ files });
}

