"use client";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import CodeBoxes from "../CodeBoxes";

export default function OtherWaysPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const login = useMemo(() => sp.get("login") || "", [sp]);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [verr, setVerr] = useState<string | null>(null);

  async function resend() {
    if (sending) return;
    setSending(true);
    setErr(null);
    setMsg(null);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login }),
      });
      const data = await res.json().catch(() => ({}));
      if (data?.ok) {
        setMsg(`Sent a new code to ${login}`);
        setTimeout(() => router.push(`/verify-code?login=${encodeURIComponent(login)}`), 600);
      } else {
        setErr("We couldn’t send a code. Try again.");
      }
    } catch {
      setErr("We couldn’t reach the server. Try again.");
    } finally {
      setSending(false);
    }
  }

  async function verify(code: string) {
    setVerr(null);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, code }),
      });
      const data = await res.json().catch(() => ({}));
      const ok = !!(data?.ok ?? data?.valid);
      if (ok) router.push(`/accept-terms?login=${encodeURIComponent(login)}`);
      else setVerr("That code didn’t work. Try again.");
    } catch {
      setVerr("Couldn’t reach the server. Try again.");
    }
  }

  return (
    <main className="night-wrap min-h-dvh grid place-items-center p-6">
      <section className="dark-card w-[680px] rounded-xl p-8 text-center relative">
        <div className="absolute left-4 top-4">
          <a className="back-btn" href={`/verify-code?login=${encodeURIComponent(login)}`} aria-label="Back">←</a>
        </div>

        <header className="flex items-center justify-center gap-3 mb-6">
          <Image src="/exp_logo.png" alt="GCT" width={35} height={35} />
          <span className="text-neutral-300 text-[16px] leading-none">Global Cad Technology</span>
        </header>

        <div className="inline-flex items-center gap-2 email-pill text-sm mb-4">
          <span className="opacity-90">{login}</span>
        </div>

        <h1 className="text-white text-2xl font-semibold mb-4">Verify with a code</h1>

        <div className="mb-4">
          <p className="text-neutral-300 text-sm mb-3">Enter the code we sent to <span className="font-semibold">{login}</span>.</p>
          <div className={verr ? "otp-error" : undefined}>
            <div className="flex justify-center">
              <CodeBoxes onComplete={verify} />
            </div>
            {verr ? <p className="text-[#ff8c8c] text-sm mt-2">{verr}</p> : null}
          </div>
        </div>

        <div className="alt-options mt-6">
          <button className="alt-option" onClick={resend} disabled={sending}>
            <span className="alt-icon" aria-hidden />
            <div className="alt-text">
              <div className="alt-title">Resend code to {login}</div>
            </div>
          </button>
          <a className="link-dark mt-3" href={`/verify-code?login=${encodeURIComponent(login)}`}>Use your password instead</a>
        </div>

        {msg ? <p className="text-neutral-300 text-sm mt-3">{msg}</p> : null}
        {err ? <p className="text-[#ff8c8c] text-sm mt-3">{err}</p> : null}
      </section>
    </main>
  );
}
