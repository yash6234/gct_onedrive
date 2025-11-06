import { listFiles } from "@/lib/auth-adapter";
import UserMenu from "./UserMenu";

export const metadata = { title: "Files" };

export default async function DrivePage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const loginRaw = sp?.login;
  const login = Array.isArray(loginRaw) ? loginRaw[0] : loginRaw ?? "";
  const files = await listFiles(login);

  return (
    <main className="drive-wrap min-h-dvh bg-[#0f1218] text-neutral-200">
      <header className="drive-topbar">
        <div className="drive-left">
          <Image src="/exp_logo.png" alt="Explorer" width={28} height={28} className="rounded-[6px]" />
          <button className="drive-tab active">Photos</button>
          <button className="drive-tab">Files</button>
        </div>
        <div className="drive-center">
          <input className="drive-search" placeholder="Search" />
        </div>
        <div className="drive-right">
          <button className="drive-cta">Get more storage</button>
          <UserMenu login={login} />
        </div>
      </header>

      <section className="drive-banner">
        <div className="drive-banner-text">Get 100 GB free for a month</div>
        <button className="drive-banner-btn">Start free trial</button>
      </section>

      <div className="drive-layout">
        <aside className="drive-sidebar">
          <button className="drive-primary">+ Create or upload</button>
          <nav className="drive-nav">
            <a className="active">Home</a>
            <a>My files</a>
            <a>Shared</a>
            <a>Recycle bin</a>
          </nav>
          <div className="drive-storage">
            <button className="drive-buy">Buy storage</button>
            <div className="drive-usage">&lt; 0.1 GB used of 5 GB (1%)</div>
          </div>
        </aside>

        <section className="drive-content">
          <div className="drive-recent">
            <div className="drive-recent-tabs">
              <button className="chip active">All</button>
              <button className="chip">Word</button>
              <button className="chip">Excel</button>
              <button className="chip">PowerPoint</button>
              <button className="chip">OneNote</button>
            </div>
          </div>

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
        </section>
      </div>
    </main>
  );
}
