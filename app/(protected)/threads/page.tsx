"use client";

import { useEffect, useState } from "react";

export default function ThreadsPage() {
  const [raw, setRaw] = useState("");

  async function load() {
    const r = await fetch("/api/deepagents/threads");
    const d = await r.json();
    setRaw((d.stdout || d.error || "").toString());
  }

  useEffect(() => { load(); }, []);

  async function deleteThread() {
    const id = prompt("ID du thread à supprimer ?");
    if (!id) return;
    await fetch(`/api/deepagents/threads?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Threads</h1>
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="mb-2 flex gap-2">
          <button onClick={load} className="rounded border px-3 py-2">Rafraîchir</button>
          <button onClick={deleteThread} className="rounded bg-red-600 px-3 py-2 text-white">Supprimer un thread</button>
        </div>
        <pre className="max-h-[65vh] overflow-auto rounded bg-zinc-900 p-3 text-xs text-zinc-100">{raw || "Aucune donnée"}</pre>
      </div>
    </div>
  );
}
