type SidebarMenuProps = {
  login: string;
  section: string;
  isSuperAdmin: boolean;
};

export default function SidebarMenu({
  login,
  section,
  isSuperAdmin,
}: SidebarMenuProps) {
  return (
    <aside className="drive-sidebar">
      <nav className="drive-nav">
        <a
          className={section === "home" ? "active" : undefined}
          href={`/files?login=${encodeURIComponent(login)}&section=home`}
        >
          <svg
            className="nav-ico"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 10.5l9-7 9 7V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z"
              fill="currentColor"
            />
          </svg>
          Home
        </a>

        {isSuperAdmin ? (
          <a
            className={section === "projects" ? "active" : undefined}
            href={`/files?login=${encodeURIComponent(login)}&section=projects`}
          >
            <svg
              className="nav-ico"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 6a2 2 0 012-2h5l2 2h7a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V6z"
                fill="currentColor"
              />
            </svg>
            Projects
          </a>
        ) : null}

        {isSuperAdmin ? (
          <a
            className={section === "user" ? "active" : undefined}
            href={`/files?login=${encodeURIComponent(login)}&section=user`}
          >
            <svg
              className="nav-ico"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7 9a7 7 0 1114 0H5z"
                fill="currentColor"
              />
            </svg>
            User Management
          </a>
        ) : null}

        {isSuperAdmin ? (
          <a
            className={section === "accounts" ? "active" : undefined}
            href={`/files?login=${encodeURIComponent(login)}&section=accounts`}
          >
            <svg
              className="nav-ico"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1zm3 3a2 2 0 100 4 2 2 0 000-4zm0 5c-1.657 0-3 1.343-3 3h6c0-1.657-1.343-3-3-3zm7-5h5v2h-5V8zm0 4h5v2h-5v-2z"
                fill="currentColor"
              />
            </svg>
            Accounts
          </a>
        ) : null}
      </nav>
    </aside>
  );
}
