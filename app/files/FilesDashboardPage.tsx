import { listFiles } from "@/lib/services/files.service";
import Image from "next/image";
import UserMenu from "./components/UserMenu";
import FilesTabs from "./components/FilesTabs";
import UserManagement from "./components/UserManagement";
import Accounts from "./components/Accounts";
import ProjectsSection from "./components/ProjectsSection";
import SidebarMenu from "./components/SidebarMenu";
import { Searchbar } from "./components/Searchbar";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const metadata = { title: "Files" };

export default async function FilesDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const loginRaw = sp?.login;
  const login = Array.isArray(loginRaw) ? loginRaw[0] : loginRaw ?? "";
  const viewRaw = (sp as any)?.view as string | string[] | undefined;
  const view = Array.isArray(viewRaw) ? viewRaw[0] : viewRaw || "files";
  const sectionRaw = (sp as any)?.section as string | string[] | undefined;
  const section = Array.isArray(sectionRaw)
    ? sectionRaw[0]
    : sectionRaw || "home";
  const queryRaw = (sp as any)?.q as string | string[] | undefined;
  const query = Array.isArray(queryRaw) ? queryRaw[0] : queryRaw || "";
  const files = await listFiles(login);
  const normalizedQuery = query.trim().toLowerCase();
  const hasQuery = normalizedQuery.length > 0;
  const filteredFiles = normalizedQuery
    ? files.filter((file: any) => {
        const name = String(file?.name ?? "").toLowerCase();
        const owner = String(file?.owner ?? "").toLowerCase();
        const opened = String(file?.opened ?? "").toLowerCase();
        return (
          name.includes(normalizedQuery) ||
          owner.includes(normalizedQuery) ||
          opened.includes(normalizedQuery)
        );
      })
    : files;

  // Superadmin visibility: prefer login_type from backend, then roles endpoint
  const cookieStore = await cookies();
  const loginTypeCookie = cookieStore.get("login_type")?.value;
  let isSuperAdmin =
    typeof loginTypeCookie === "string" &&
    loginTypeCookie.trim().toUpperCase() === "SUPERADMIN";

  const base = process.env.NEST_BASE_URL;
  if (!isSuperAdmin && base && login) {
    try {
      const url = new URL(
        `/users-public/is-superadmin?email=${encodeURIComponent(login)}`,
        base
      ).toString();
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (typeof (data as any)?.superadmin === "boolean") {
          isSuperAdmin = !!(data as any).superadmin;
        }
      }
    } catch {}
  }

  // Prevent direct access to admin-only sections for non-superadmins
  if (
    (section === "user" ||
      section === "projects" ||
      section === "accounts" ||
      section === "user management") &&
    !isSuperAdmin
  ) {
    redirect(`/files?login=${encodeURIComponent(login)}&section=home`);
  }

  return (
    <main className="drive-wrap min-h-dvh bg-[#0f1218] text-neutral-200">
      <header className="drive-topbar">
        <div className="drive-left">
          <Image
            src="/home_ph.png"
            alt="Explorer"
            width={50}
            height={50}
            className="rounded-[6px]"
            unoptimized
          />
          <FilesTabs login={login} />
        </div>
        <div className="drive-center">
          <Searchbar
            defaultValue={query}
            path="/files"
            params={{ login, view, section }}
            placeholder="Search"
          />
        </div>
        <div className="drive-right">
          <UserMenu login={login} />
        </div>
      </header>

      {/* <section className="drive-banner">
        <div className="drive-banner-text">Get 100 GB free for a month</div>
        <button className="drive-banner-btn">Start free trial</button>
      </section> */}

      <div className="drive-layout">
        <SidebarMenu
          login={login}
          section={section}
          isSuperAdmin={isSuperAdmin}
        />

        <section className="drive-content">
          {section === "home" ? (
            <>
              <div className="drive-recent">
                <div className="drive-recent-tabs">
                  <button className="chip active">All</button>
                  <button className="chip">Word</button>
                  <button className="chip">Excel</button>
                  <button className="chip">PowerPoint</button>
                  <button className="chip">OneNote</button>
                </div>
              </div>
              {view === "files" ? (
                <div className="drive-table">
                  <div className="drive-row head">
                  <div>Name</div>
                  <div>Opened</div>
                  <div>Owner</div>
                </div>
                  {filteredFiles.length ? (
                    filteredFiles.map((r: any, i: number) => (
                      <div key={i} className="drive-row">
                        <div>
                          <span className="file-icon" /> {r.name}
                          <div className="sub">My Files</div>
                        </div>
                        <div>{r.opened}</div>
                        <div>{r.owner}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-neutral-400 text-sm px-4 py-6">
                      {hasQuery
                        ? `No files match "${query}".`
                        : "No files to show."}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-neutral-400 text-sm">
                  No photos to show.
                </div>
              )}
            </>
          ) : null}

          {section === "projects" ? <ProjectsSection login={login} /> : null}

          {section === "user" ? <UserManagement login={login} /> : null}

          {section === "accounts" ? <Accounts login={login} /> : null}
        </section>
      </div>
    </main>
  );
}
