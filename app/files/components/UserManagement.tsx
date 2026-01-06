"use client";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-hot-toast";

type User = {
  id?: number;
  name: string;
  email: string;
  mobile: string;
  tempPassword: string;
};

export default function UserManagement({ login }: { login: string }) {
  const DOMAIN =
    (process.env.NEXT_PUBLIC_EMAIL_DOMAIN || "gmail.com").toLowerCase();
  const [users, setUsers] = useState<User[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [menuOpenFor, setMenuOpenFor] = useState<number | string | null>(null);
  const menuAnchor = useRef<HTMLDivElement | null>(null);

  // Load users from API
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/users", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (!active) return;
        const ok = res.ok && data?.ok !== false;
        if (!ok) {
          setLoadError(
            String(data?.error || `Couldn't load users (status ${res.status}).`)
          );
          return;
        }
        const rows = Array.isArray(data?.users)
          ? data.users
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];
        setUsers(rows as User[]);
        setLoadError(null);
      } catch (err: any) {
        if (active) setLoadError(String(err?.message || "Fetch failed."));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  function resetForm() {
    setName("");
    setEmail("");
    setMobile("");
    setTempPassword("");
    setError(null);
  }

  function onMobileChange(raw: string) {
    const digits = raw.replace(/\D+/g, "").slice(0, 10);
    setMobile(digits);
  }

  function isValidEmailFormat(v: string) {
    // Very lightweight check: something@something.tld
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  async function saveUser() {
    const n = name.trim();
    const e = email.trim();
    const m = mobile.trim();
    const p = tempPassword.trim();
    if (!e) {
      setError("Name, Email, Mobile and Temporary password are required");
      return;
    }
    if (!isValidEmailFormat(e)) {
      setError("Enter email in the format: someone@example.com.");
      return;
    }
    const [, dom] = e.split("@");
    if (dom.toLowerCase() !== DOMAIN) {
      setError(`Use your ${DOMAIN} email address.`);
      return;
    }
    if (!n || !e || !m || !p) {
      setError("Name, Email, Mobile and Temporary password are required");
      return;
    }
    if (m.length !== 10) {
      setError("Mobile number must be exactly 10 digits");
      return;
    }
    // Persist to API; close modal immediately and show a loading toast
    const isEdit = editingId != null;
    const toastId = toast.loading("Saving…");
    setOpen(false);
    try {
      const res = await fetch("/api/users", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isEdit
            ? { id: editingId, name: n, email: e, mobile: m, tempPassword: p }
            : { name: n, email: e, mobile: m, tempPassword: p }
        ),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.ok && data?.user) {
        setUsers((u) => {
          if (isEdit)
            return u.map((row) =>
              row.id === editingId ? (data.user as User) : row
            );
          return [...u, data.user as User];
        });
        resetForm();
        setEditingId(null);
        toast.dismiss(toastId);
        toast.success("Temporary password send successfully");
      } else {
        const msg = String(
          data?.error || `Couldn't save user (status ${res.status}).`
        );
        setError(msg);
        toast.dismiss(toastId);
        toast.error(msg);
      }
    } catch (err: any) {
      const msg = String(err?.message || "Couldn't reach the server.");
      setError(msg);
      toast.dismiss(toastId);
      toast.error(msg);
    }
  }

  function generateTempPassword() {
    const alphabet =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$";
    let out = "";
    for (let i = 0; i < 10; i++)
      out += alphabet[Math.floor(Math.random() * alphabet.length)];
    return out;
  }

  // Close menus when clicking outside
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node | null;
      if (menuAnchor.current && t && !menuAnchor.current.contains(t)) {
        setMenuOpenFor(null);
        menuAnchor.current = null;
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  // no notice state; using react-hot-toast instead

  return (
    <div data-login={login || undefined}>
      <div className="um-actions">
        <button
          className="btn-add"
          onClick={() => {
            setEditingId(null);
            setOpen(true);
          }}
        >
          + Add user
        </button>
      </div>

      <div className="user-table">
        <div className="user-row head">
          <div>SR No</div>
          <div>Email</div>
          <div>Mobile no.</div>
          <div className="text-right">Actions</div>
        </div>
        {loading ? (
          <div className="user-row">
            <div>—</div>
            <div>Loading…</div>
            <div>—</div>
          </div>
        ) : null}
        {!loading && loadError ? (
          <div className="user-row">
            <div>—</div>
            <div className="text-[#ff8c8c]">{loadError}</div>
            <div>—</div>
            <div className="text-right">—</div>
          </div>
        ) : null}
        {users.map((u, i) => (
          <div key={u.id ?? i} className="user-row">
            <div>{i + 1}</div>
            <div>{u.email}</div>
            <div>{u.mobile}</div>
            <div className="action-group relative">
              <button
                className="kebab-btn"
                aria-label="More actions"
                onClick={(e) => {
                  e.stopPropagation();
                  // anchor the menu to this row's action group
                  menuAnchor.current = (e.currentTarget as HTMLElement).closest(
                    ".action-group"
                  ) as HTMLDivElement | null;
                  setMenuOpenFor((prev) =>
                    prev === (u.id ?? i) ? null : u.id ?? i
                  );
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="5" cy="12" r="2" fill="currentColor" />
                  <circle cx="12" cy="12" r="2" fill="currentColor" />
                  <circle cx="19" cy="12" r="2" fill="currentColor" />
                </svg>
              </button>
              {menuOpenFor === (u.id ?? i) ? (
                <div className="menu-card" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="menu-item"
                    onClick={() => {
                      setEditingId(u.id ?? null);
                      setName(u.name || "");
                      setEmail(u.email || "");
                      setMobile(
                        (u.mobile || "").replace(/\D+/g, "").slice(0, 10)
                      );
                      setTempPassword("");
                      setOpen(true);
                      setMenuOpenFor(null);
                      menuAnchor.current = null;
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="menu-item danger"
                    onClick={async () => {
                      if (!u.id) return setError("Missing user id");
                      setMenuOpenFor(null);
                      menuAnchor.current = null;
                      if (!confirm("Delete this user?")) return;
                      try {
                        const res = await fetch(`/api/users?id=${u.id}`, {
                          method: "DELETE",
                        });
                        const data = await res.json().catch(() => ({}));
                        if (data?.ok)
                          setUsers((rows) => rows.filter((r) => r.id !== u.id));
                        else
                          setError(
                            String(
                              data?.error ||
                                `Delete failed (status ${res.status})`
                            )
                          );
                      } catch (err: any) {
                        setError(
                          String(err?.message || "Couldn't reach the server.")
                        );
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {open ? (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-header">Add user</div>
            <div className="modal-body">
              <label className="block mb-4">
                <span className="sr-only">Name</span>
                <input
                  className="ms-input ms-input-dark"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label className="block mb-4">
                <span className="sr-only">Email</span>
                <input
                  className="ms-input ms-input-dark"
                  placeholder="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <label className="block mb-1">
                <span className="sr-only">Mobile</span>
                <input
                  className="ms-input ms-input-dark"
                  placeholder="Mobile no."
                  value={mobile}
                  type="tel"
                  inputMode="numeric"
                  pattern="\\d*"
                  maxLength={10}
                  onChange={(e) => onMobileChange(e.target.value)}
                />
              </label>
              <div className="input-row mt-4">
                <input
                  className="ms-input ms-input-dark"
                  placeholder="Temporary password"
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="btn-mini"
                  onClick={() => setTempPassword(generateTempPassword())}
                >
                  Generate
                </button>
              </div>
              {error ? (
                <p className="text-[#ff8c8c] text-sm mt-2">{error}</p>
              ) : null}
            </div>
            <div className="modal-actions">
              <button
                className="btn-muted"
                onClick={() => {
                  setOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </button>
              <button className="btn-primary" onClick={saveUser}>
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
