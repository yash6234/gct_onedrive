"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SendCodeButton({ login }: { login: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick(e: React.MouseEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login }),
      });
      const data = await res.json();
      if (data?.ok) {
        router.push(`/verify?login=${encodeURIComponent(login)}`);
      } else {
        setError("Couldn’t send the code. Check backend connection.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button className="primary-btn-dark" onClick={onClick} disabled={loading}>
        {loading ? "Sending..." : "Send code"}
      </button>
      {error ? <p className="text-[#ff8c8c] text-sm mt-3">{error}</p> : null}
    </div>
  );
}
