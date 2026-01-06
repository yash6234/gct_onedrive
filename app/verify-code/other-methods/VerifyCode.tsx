"use client";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import CodeBoxes from "../CodeBoxes";
import styles from "./verify-code.module.css";

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
      if (ok) router.push(`/files?login=${encodeURIComponent(login)}`);
      else setVerr("That code didn’t work. Try again.");
    } catch {
      setVerr("Couldn’t reach the server. Try again.");
    }
  }

  return (
    <main className={`${styles.shell} night-wrap`}>
      <section className={`${styles.card} dark-card`}>
        <div className={styles.back}>
          <a
            className="back-btn"
            href={`/verify-code?login=${encodeURIComponent(login)}`}
            aria-label="Back"
          >
            ←
          </a>
        </div>

        <header className={styles.header}>
          <Image src="/exp_logo.png" alt="GCT" width={35} height={35} />
          <span className={styles.brand}>Global Cad Technology</span>
        </header>

        <div className={`${styles.email} email-pill`}>
          <span className={styles.emailText}>{login}</span>
        </div>

        <h1 className={styles.title}>Verify with a code</h1>

        <div className={styles.block}>
          <p className={styles.subtitle}>
            Enter the code we sent to <span className={styles.bold}>{login}</span>.
          </p>
          <div className={verr ? `${styles.otpArea} otp-error` : styles.otpArea}>
            <div className={styles.otpRow}>
              <CodeBoxes onComplete={verify} />
            </div>
            {verr ? <p className={styles.error}>{verr}</p> : null}
          </div>
        </div>

        <div className={`${styles.altWrap} alt-options`}>
          <button className="alt-option" onClick={resend} disabled={sending}>
            <span className="alt-icon" aria-hidden />
            <div className="alt-text">
              <div className="alt-title">Resend code to {login}</div>
            </div>
          </button>
          <a
            className={`link-dark ${styles.linkSpacer}`}
            href={`/verify-code?login=${encodeURIComponent(login)}`}
          >
            Use your password instead
          </a>
        </div>

        {msg ? <p className={styles.note}>{msg}</p> : null}
        {err ? <p className={styles.error}>{err}</p> : null}
      </section>
    </main>
  );
}
