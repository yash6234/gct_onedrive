"use client";
import { useRouter, useSearchParams } from "next/navigation";

export default function FilesTabs({ login }: { login: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  const view = (sp.get("view") || "files").toLowerCase();

  function go(next: "photos" | "files") {
    const params = new URLSearchParams(sp.toString());
    if (login) params.set("login", login);
    params.set("view", next);
    router.replace(`/files?${params.toString()}`);
  }

  return (
    <div className="seg-group">
      {/* <button
        className={`seg ${view === "photos" ? "active" : ""}`}
        onClick={() => go("photos")}
        type="button"
      >
        Photos
      </button> */}
      <button
        className={`seg ${view === "files" ? "active" : ""}`}
        onClick={() => go("files")}
        type="button"
      >
        Files
      </button>
    </div>
  );
}
