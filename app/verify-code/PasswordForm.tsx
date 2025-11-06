"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function PasswordForm({ login }: { login: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
      const data = await res.json().catch(() => ({}));
      const ok = !!(data?.ok ?? data?.authenticated ?? data?.success);
      if (ok) {
        router.push(`/accept-terms?login=${encodeURIComponent(login)}`);
      } else if (data?.needsVerification) {
        // Frontend flow preference: still proceed to Terms; OTP is available from fallback link
        toast("Proceeding to terms. You can verify via code from the link if needed.");
        router.push(`/accept-terms?login=${encodeURIComponent(login)}`);
      } else {
        setError(String(data?.error || "Incorrect password. Try again."));
      }
    } catch {
      setError("Couldn't reach the server. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="text-left w-full max-w-xs mx-auto">
      <label className="block mb-3">
        <span className="sr-only">Password</span>
        <input
          className="ms-input ms-input-dark"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
      </label>
      <div className="flex justify-center">
        <button className="primary-btn-dark" disabled={submitting} type="submit" style={{ width: 160 }}>
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </div>
      {error ? <p className="text-[#ff8c8c] text-sm mt-3 text-center">{error}</p> : null}
    </form>
  );
}
