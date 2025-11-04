"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TermsActions({ login }: { login: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function next() {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/accept-terms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login }),
      });
      const data = await res.json();
      const ok = !!(data?.ok ?? data?.accepted ?? data?.success);
      if (ok) return router.push(`/drive?login=${encodeURIComponent(login)}`);
      setError("Couldn’t record your acceptance. Try again.");
    } catch {
      setError("Couldn’t reach the server. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-4">
      <button className="primary-btn-dark" onClick={next} disabled={loading}>{loading ? "Please wait…" : "Next"}</button>
      {error ? <p className="text-[#ff8c8c] text-sm mt-3">{error}</p> : null}
    </div>
  );
}
