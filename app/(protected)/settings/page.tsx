"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [defaultModel, setDefaultModel] = useState("");
  const [shellAllowList, setShellAllowList] = useState("recommended");
  const [autoApprove, setAutoApprove] = useState(false);

  async function load() {
    const r = await fetch("/api/settings");
    const d = await r.json();
    const s = d.settings || {};
    setDefaultModel(s.defaultModel || "");
    setShellAllowList(s.shellAllowList || "recommended");
    setAutoApprove(!!s.autoApprove);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ defaultModel, shellAllowList, autoApprove }),
    });
    await load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Paramètres globaux</h1>
      <div className="rounded-xl bg-white p-4 shadow-sm space-y-3">
        <label className="block text-sm">Modèle par défaut</label>
        <input value={defaultModel} onChange={(e) => setDefaultModel(e.target.value)} className="w-full rounded border p-2" placeholder="ex: gpt-4o" />
        <label className="block text-sm">Shell allow list</label>
        <input value={shellAllowList} onChange={(e) => setShellAllowList(e.target.value)} className="w-full rounded border p-2" placeholder="recommended / all / ls,cat,grep" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={autoApprove} onChange={(e) => setAutoApprove(e.target.checked)} /> Auto-approve tool calls</label>
        <button onClick={save} className="rounded bg-zinc-900 px-3 py-2 text-white">Enregistrer</button>
      </div>
    </div>
  );
}
