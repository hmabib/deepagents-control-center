"use client";

import { useEffect, useState } from "react";

export default function SkillsPage() {
  const [raw, setRaw] = useState("");

  async function load() {
    const r = await fetch("/api/deepagents/skills");
    const d = await r.json();
    setRaw((d.stdout || d.error || "").toString());
  }

  useEffect(() => { load(); }, []);

  async function info() {
    const name = prompt("Nom de la skill ?");
    if (!name) return;
    const r = await fetch(`/api/deepagents/skills?name=${encodeURIComponent(name)}`);
    const d = await r.json();
    setRaw((d.stdout || d.error || "").toString());
  }

  async function remove() {
    const name = prompt("Nom de la skill à supprimer ?");
    if (!name) return;
    await fetch(`/api/deepagents/skills?name=${encodeURIComponent(name)}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Skills</h1>
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="mb-2 flex gap-2">
          <button onClick={load} className="rounded border px-3 py-2">Lister</button>
          <button onClick={info} className="rounded border px-3 py-2">Info skill</button>
          <button onClick={remove} className="rounded bg-red-600 px-3 py-2 text-white">Supprimer skill</button>
        </div>
        <pre className="max-h-[65vh] overflow-auto rounded bg-zinc-900 p-3 text-xs text-zinc-100">{raw || "Aucune donnée"}</pre>
      </div>
    </div>
  );
}
