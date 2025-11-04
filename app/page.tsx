"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Page() {
  const [login, setLogin] = useState("");
  const router = useRouter();
  const DOMAIN = (
    process.env.NEXT_PUBLIC_EMAIL_DOMAIN || "gmail.com"
  ).toLowerCase();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    let v = login.trim();
    if (!v) return;
    if (!v.includes("@")) {
      v = `${v}@${DOMAIN}`;
    } else {
      const [local, dom] = v.split("@");
      if (dom.toLowerCase() !== DOMAIN) v = `${local}@${DOMAIN}`;
    }
    router.push(`/code?login=${encodeURIComponent(v)}`);
  }

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <form onSubmit={onSubmit} className="signin-card rounded-sm p-8">
        <header className="flex items-center gap-3 mb-6">
          <Image src="/gctlogo.png" alt="GCT" width={26} height={26} priority />
          <span className="text-neutral-600 text-[16px] leading-none">GCT</span>
        </header>

        <h1 className="text-3xl font-semibold mb-6">Sign in</h1>

        <label className="block mb-6">
          <span className="sr-only">Email</span>
          <input
            className="ms-input"
            placeholder="Email"
            type="email"
            autoFocus
            value={login}
            onChange={(e) => setLogin(e.target.value)}
          />
        </label>

        <p className="text-sm text-neutral-700 mb-10">
          No account?{" "}
          <a className="subtle-link" href="/create">
            Create one!
          </a>
        </p>

        <div className="flex justify-end">
          <button className="primary-btn" type="submit">
            Next
          </button>
        </div>
      </form>
    </main>
  );
}
