// Files service for NestJS backend
// Handles file listing operations

const BASE = process.env.NEST_BASE_URL?.trim();
const DEV_ALLOW_ANY_OTP = process.env.DEV_ALLOW_ANY_OTP === "1";
const PATH_LIST = process.env.NEST_PATH_LIST_FILES || "/files";

type Json = Record<string, any>;

async function get<T extends Json>(
  path: string,
  params?: Record<string, string>
): Promise<T> {
  if (DEV_ALLOW_ANY_OTP && !BASE) return {} as T;
  const url = new URL(path, BASE);
  for (const [k, v] of Object.entries(params ?? {})) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (process.env.DEBUG_AUTH === "1") {
    console.log("[auth] GET", url.toString(), res.status);
  }
  return (await res.json().catch(() => ({}))) as T;
}

export async function listFiles(login: string) {
  try {
    if (DEV_ALLOW_ANY_OTP && !BASE) {
      return [
        { name: "Welcome.docx", opened: "Today", owner: login || "Me" },
        { name: "Budget.xlsx", opened: "Yesterday", owner: login || "Me" },
        { name: "Pitch.pptx", opened: "1 week ago", owner: login || "Me" },
      ];
    }
    const data = await get<Json>(PATH_LIST, { login });
    const d: any = data as any;
    return Array.isArray(d?.files) ? d.files : Array.isArray(d) ? d : [];
  } catch {
    if (DEV_ALLOW_ANY_OTP) {
      return [
        { name: "Welcome.docx", opened: "Today", owner: login || "Me" },
        { name: "Budget.xlsx", opened: "Yesterday", owner: login || "Me" },
        { name: "Pitch.pptx", opened: "1 week ago", owner: login || "Me" },
      ];
    }
    return [];
  }
}

