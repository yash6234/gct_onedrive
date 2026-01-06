"use client";

import { useEffect, useState } from "react";

type Account = {
  accountId?: string;
  clientName: string;
  accountName: string;
  gstNumber?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  status?: string;
};

export default function Accounts({ login }: { login: string }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [clientName, setClientName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/accounts", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        if (!active) return;
        const ok = res.ok && data?.ok !== false;
        if (!ok) {
          setLoadError(
            String(
              data?.error || `Couldn't load accounts (status ${res.status}).`
            )
          );
          return;
        }
        const rows = Array.isArray(data?.accounts)
          ? data.accounts
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];
        setAccounts(rows as Account[]);
        setLoadError(null);
      } catch (err: any) {
        if (active)
          setLoadError(String(err?.message || "Couldn't reach the server."));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  function resetForm() {
    setClientName("");
    setAccountName("");
    setGstNumber("");
    setContactEmail("");
    setContactPhone("");
    setFormError(null);
  }

  function isValidEmailFormat(v: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function onContactPhoneChange(raw: string) {
    const digits = raw.replace(/\D+/g, "").slice(0, 10);
    setContactPhone(digits);
  }

  async function onSave() {
    const c = clientName.trim();
    const a = accountName.trim();
    const g = gstNumber.trim();
    const e = contactEmail.trim();
    const p = contactPhone.trim();
    if (!c || !a || !g || !e || !p) {
      setFormError("All fields are required.");
      return;
    }
    if (!isValidEmailFormat(e)) {
      setFormError("Enter a valid contact email.");
      return;
    }
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: c,
          accountName: a,
          gstNumber: g,
          contactEmail: e,
          contactPhone: p,
        }),
      });
      const data = await res.json().catch(() => ({}));
      const ok = res.ok && data?.ok !== false;
      if (!ok) {
        setFormError(
          String(data?.error || `Couldn't save account (status ${res.status}).`)
        );
        return;
      }
      const saved = (data?.account as Account) ||
        (data?.data as Account) || {
          clientName: c,
          accountName: a,
          gstNumber: g,
          contactEmail: e,
          contactPhone: p,
          status: "Active",
        };
      setAccounts((prev) => [saved, ...prev]);
      setOpen(false);
      resetForm();
    } catch (err: any) {
      setFormError(String(err?.message || "Couldn't reach the server."));
    }
  }

  return (
    <div data-login={login || undefined}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-neutral-100">Accounts</h2>
        <button
          type="button"
          className="btn-add"
          onClick={() => {
            resetForm();
            setOpen(true);
          }}
        >
          + Add account
        </button>
      </div>
      <div className="user-table">
        <div className="user-row head">
          <div>SR No</div>
          <div>Account</div>
          <div>Status</div>
          {/* <div className="text-right">Actions</div> */}
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
          </div>
        ) : null}
        {!loading && !loadError && accounts.length === 0 ? (
          <div className="user-row">
            <div>—</div>
            <div>No accounts to show yet.</div>
            <div>—</div>
          </div>
        ) : null}
        {accounts.map((acc, i) => (
          <div key={`${acc.accountName}-${i}`} className="user-row">
            <div>{i + 1}</div>
            <div>
              {acc.accountName}
              <div className="sub">{acc.clientName}</div>
            </div>
            <div>{acc.status || "Active"}</div>
          </div>
        ))}
      </div>

      {open ? (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-header">Add account</div>
            <div className="modal-body">
              <label className="block mb-4">
                <span className="sr-only">Client name</span>
                <input
                  className="ms-input ms-input-dark"
                  placeholder="Client Name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </label>
              <label className="block mb-4">
                <span className="sr-only">Account name</span>
                <input
                  className="ms-input ms-input-dark"
                  placeholder="Account name"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                />
              </label>
              <label className="block mb-4">
                <span className="sr-only">GST number</span>
                <input
                  className="ms-input ms-input-dark"
                  placeholder="GST number"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                />
              </label>
              <label className="block mb-4">
                <span className="sr-only">Contact email</span>
                <input
                  className="ms-input ms-input-dark"
                  placeholder="Contact email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </label>
              <label className="block mb-1">
                <span className="sr-only">Contact phone</span>
                <input
                  className="ms-input ms-input-dark"
                  placeholder="Contact phone"
                  value={contactPhone}
                  type="tel"
                  inputMode="tel"
                  onChange={(e) => onContactPhoneChange(e.target.value)}
                />
              </label>
              {formError ? (
                <p className="text-[#ff8c8c] text-sm mt-2">{formError}</p>
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
              <button className="btn-primary" onClick={onSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
