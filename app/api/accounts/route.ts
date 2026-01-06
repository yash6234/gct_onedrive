import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { httpRequest, setBearerToken } from "@/lib/services/http-client";

export const runtime = "nodejs";

function accountPaths(): string[] {
  const fromEnv = (process.env.NEST_PATH_ACCOUNTS || "").trim();
  const candidates = [fromEnv, "/accounts", "/api/accounts"]
    .map((p) => p.trim())
    .filter(Boolean);
  return Array.from(new Set(candidates));
}

async function requestWithFallback(
  init?: RequestInit
): Promise<{ ok: boolean; data: any; status: number }> {
  const paths = accountPaths();
  let last = { ok: false, data: {}, status: 500 };
  for (const p of paths) {
    const res = await httpRequest(p, init);
    last = res;
    if (res.ok) return res;
    if (![404, 405].includes(res.status)) break;
  }
  return last;
}

export async function GET() {
  try {
    try {
      const t = (await cookies()).get("nest_token")?.value;
      if (t) setBearerToken(t);
    } catch {}
    const { ok, data, status } = await requestWithFallback();
    const upstreamOk = ok && data?.ok !== false;
    if (!upstreamOk) {
      const msg = data?.error || data?.message || "Upstream error";
      return Response.json(
        { ok: false, error: msg },
        { status: ok ? 400 : status }
      );
    }
    const accounts = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.accounts)
      ? data.accounts
      : Array.isArray(data)
      ? data
      : [];
    return Response.json({ ok: true, accounts });
  } catch (e: any) {
    console.error("[accounts][GET] error", e?.message || e);
    return Response.json(
      { ok: false, error: e?.message || "Upstream error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    try {
      const t = (await cookies()).get("nest_token")?.value;
      if (t) setBearerToken(t);
    } catch {}
    const body = await req.json();
    const { clientName, accountName, gstNumber, contactEmail, contactPhone } =
      body || {};
    if (!clientName || !accountName) {
      return Response.json(
        { ok: false, error: "Missing fields (clientName, accountName)" },
        { status: 400 }
      );
    }
    const payload = {
      client_name: clientName,
      account_name: accountName,
      gst_number: gstNumber || null,
      contact_email: contactEmail || null,
      contact_phone: contactPhone || null,
    };
    const { ok, data, status } = await requestWithFallback({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const upstreamOk = ok && data?.ok !== false;
    if (!upstreamOk) {
      const msg = data?.error || data?.message || "Upstream error";
      return Response.json(
        { ok: false, error: msg },
        { status: ok ? 400 : status }
      );
    }
    const account = data?.data ?? data?.account ?? data;
    return Response.json({ ok: true, account });
  } catch (e: any) {
    console.error("[accounts][POST] error", e?.message || e);
    return Response.json(
      { ok: false, error: e?.message || "Upstream error" },
      { status: 500 }
    );
  }
}
