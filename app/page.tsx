"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignInPage() {
  const [login, setLogin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const DOMAIN = (
    process.env.NEXT_PUBLIC_EMAIL_DOMAIN || "gmail.com"
  ).toLowerCase();

  function isValidEmailFormat(v: string) {
    // Very lightweight check: something@something.tld
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    let v = login.trim();
    if (!v) return;
    // If user didn't type a domain, append the configured one
    if (!v.includes("@")) {
      v = `${v}@${DOMAIN}`;
    } else {
      // If user typed a domain, require a valid email format and the correct domain
      if (!isValidEmailFormat(v)) {
        setError(
          "Enter your email address in the format: someone@example.com."
        );
        return;
      }
      const [, dom] = v.split("@");
      if (dom.toLowerCase() !== DOMAIN) {
        setError(`Use your ${DOMAIN} email address.`);
        return;
      }
    }
    setError(null);
    router.push(`/verify-code?login=${encodeURIComponent(v)}`);
  }

  return (
    <main className="min-h-dvh grid place-items-center p-6">
      <form onSubmit={onSubmit} className="signin-card rounded-sm p-8">
        <header className="flex items-center gap-3 mb-6">
          <Image
            src="/exp_logo.png"
            alt="GCT"
            width={35}
            height={35}
            priority
          />
          <span className="text-neutral-600 text-[16px] leading-none">
            Global Cad Technology
          </span>
        </header>

        <h1 className="text-3xl font-semibold mb-6">Sign in</h1>

        <label className="block mb-2 text-sm font-medium text-neutral-700">
          Email
        </label>
        <div className="mb-6">
          <input
            className={`ms-input${error ? " ms-input-error" : ""}`}
            placeholder="Email"
            type="email"
            autoFocus
            value={login}
            aria-invalid={!!error}
            onChange={(e) => {
              setLogin(e.target.value);
              if (error) setError(null);
            }}
          />
          {error ? (
            <p className="text-[#e34b4b] text-sm mt-2">{error}</p>
          ) : null}
        </div>

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
