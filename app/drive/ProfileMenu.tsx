"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function ProfileMenu({ login }: { login: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  function signOut() {
    // No real session to clear in this demo. Navigate to sign-in.
    router.push("/");
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="drive-avatar"
        title={login || "Profile"}
      >
        YP
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-48 rounded-md border border-[#283247] bg-[#141923] shadow-lg z-50"
        >
          <div className="px-3 py-2 text-xs text-neutral-400 border-b border-[#21283a] truncate" title={login}>
            {login || "Signed in"}
          </div>
          <button
            role="menuitem"
            onClick={signOut}
            className="w-full text-left px-3 py-2 text-sm text-neutral-200 hover:bg-[#1b2230]"
          >
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}

