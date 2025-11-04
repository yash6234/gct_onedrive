"use client";
import { useRouter } from "next/navigation";
import CodeBoxes from "./CodeBoxes";
import { useState } from "react";

export default function VerifyForm({ login }: { login: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpKey, setOtpKey] = useState(0);

  async function goNext(code: string) {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, code }),
      });
      const data = await res.json();
      const ok = !!(data?.ok ?? data?.valid);
      if (ok) {
        router.push(`/terms?login=${encodeURIComponent(login)}`);
      } else {
        setError("That code didn’t work. Try again.");
        setOtpKey((k) => k + 1);
      }
    } catch {
      setError("Couldn’t reach the server. Try again.");
      setOtpKey((k) => k + 1);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={error ? "otp-error" : undefined}>
      <div style={{ opacity: submitting ? 0.7 : 1 }}>
        <CodeBoxes key={otpKey} onComplete={goNext} />
      </div>
      {error ? (
        <p className="text-[#ff8c8c] text-sm mt-3">{error}</p>
      ) : null}
    </div>
  );
}
