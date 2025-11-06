import { listFiles } from "@/lib/auth-adapter";
import Image from "next/image";
import UserMenu from "./UserMenu";
import FilesTabs from "./FilesTabs";
import UserManagement from "./UserManagement";
import ProjectsSection from "./ProjectsSection";
import { redirect } from "next/navigation";

export const metadata = { title: "Files" };

export default async function DrivePage({
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
  const section = Array.isArray(sectionRaw) ? sectionRaw[0] : sectionRaw || "home";
  const files = await listFiles(login);

  // Superadmin visibility: env whitelist OR backend membership
  const allowedStr = process.env.NEXT_PUBLIC_SUPERADMINS || process.env.SUPERADMINS || "";
  const allowed = allowedStr
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  let isSuperAdmin = !!login && allowed.includes(login.toLowerCase());
  if (!isSuperAdmin) {
    const base = process.env.NEST_BASE_URL;
    if (base && login) {
      try {
        const url = new URL('/users/superadmin', base).toString();
        const res = await fetch(url, { cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        const emails: string[] = Array.isArray(data)
          ? (data as any[]).map((r: any) => String(r?.email || '').toLowerCase())
          : Array.isArray(data?.users)
          ? (data.users as any[]).map((r: any) => String(r?.email || '').toLowerCase())
          : [];
        isSuperAdmin = emails.includes(login.toLowerCase());
      } catch {}
    }
  }

  // Prevent direct access to admin-only sections for non-superadmins
  if ((section === "user" || section === "projects") && !isSuperAdmin) {
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
          <div className="drive-search">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11 4a7 7 0 105.292 12.292l3.707 3.707 1.414-1.414-3.707-3.707A7 7 0 0011 4zm0 2a5 5 0 110 10A5 5 0 0111 6z"
                fill="currentColor"
              />
            </svg>
            <input placeholder="Search" />
          </div>
        </div>
        <div className="drive-right">
          {/* <button className="drive-cta">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 3l2.4 4.8L20 9l-4 4 .9 5.6L12 16l-4.9 2.6L8 13 4 9l5.6-1.2L12 3z"
                fill="currentColor"
              />
            </svg>
            Get more storage
          </button> */}
          <button className="icon-btn" aria-label="Settings">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19.14 12.936a7.97 7.97 0 000-1.872l2.037-1.58-1.5-2.598-2.424.986A8.03 8.03 0 0015 5.34l-.36-2.6h-3.28l-.36 2.6a8.03 8.03 0 00-2.253 1.532l-2.424-.986-1.5 2.598 2.037 1.58a7.97 7.97 0 000 1.872l-2.037 1.58 1.5 2.598 2.424-.986A8.03 8.03 0 009 18.66l.36 2.6h3.28l.36-2.6a8.03 8.03 0 002.253-1.532l2.424.986 1.5-2.598-2.037-1.58zM12 15a3 3 0 110-6 3 3 0 010 6z"
                fill="currentColor"
              />
            </svg>
          </button>
          <UserMenu login={login} />
        </div>
      </header>

      {/* <section className="drive-banner">
        <div className="drive-banner-text">Get 100 GB free for a month</div>
        <button className="drive-banner-btn">Start free trial</button>
      </section> */}

      <div className="drive-layout">
        <aside className="drive-sidebar">
          <nav className="drive-nav">
            <a className={section === "home" ? "active" : undefined} href={`/files?login=${encodeURIComponent(login)}&section=home`}>
              <svg className="nav-ico" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 10.5l9-7 9 7V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z" fill="currentColor"/>
              </svg>
              Home
            </a>
            {isSuperAdmin ? (
              <a className={section === "projects" ? "active" : undefined} href={`/files?login=${encodeURIComponent(login)}&section=projects`}>
                <svg className="nav-ico" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 6a2 2 0 012-2h5l2 2h7a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" fill="currentColor"/>
                </svg>
                Projects
              </a>
            ) : null}
            {isSuperAdmin ? (
              <a className={section === "user" ? "active" : undefined} href={`/files?login=${encodeURIComponent(login)}&section=user`}>
                <svg className="nav-ico" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7 9a7 7 0 1114 0H5z" fill="currentColor"/>
                </svg>
                User Management
              </a>
            ) : null}
          </nav>
        </aside>

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
                  {files.map((r: any, i: number) => (
                    <div key={i} className="drive-row">
                      <div>
                        <span className="file-icon" /> {r.name}
                        <div className="sub">My Files</div>
                      </div>
                      <div>{r.opened}</div>
                      <div>{r.owner}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-neutral-400 text-sm">No photos to show.</div>
              )}
            </>
          ) : null}

          {section === "projects" ? (<ProjectsSection login={login} />) : null}

          {section === "user" ? (<UserManagement login={login} />) : null}
        </section>
      </div>
    </main>
  );
}
