"use client";

import { useEffect, useMemo, useState } from "react";

type ModelDef = { id: string; provider: string; label: string; model: string; category: string; recommended: boolean; enabled: boolean };
type ProviderDef = { id: string; name: string; keyName: string; baseUrl?: string; enabled: boolean };

export default function SettingsPage() {
  const [defaultModel, setDefaultModel] = useState("");
  const [defaultProvider, setDefaultProvider] = useState("");
  const [defaultBaseUrl, setDefaultBaseUrl] = useState("");
  const [shellAllowList, setShellAllowList] = useState("recommended");
  const [autoApprove, setAutoApprove] = useState(false);
  const [models, setModels] = useState<ModelDef[]>([]);
  const [providers, setProviders] = useState<ProviderDef[]>([]);

  async function load() {
    const [rs, rm, rp] = await Promise.all([fetch("/api/settings"), fetch("/api/models"), fetch("/api/providers")]);
    const d = await rs.json();
    const m = await rm.json();
    const p = await rp.json();

    const s = d.settings || {};
    setDefaultModel(s.defaultModel || "");
    setDefaultProvider(s.defaultProvider || "");
    setDefaultBaseUrl(s.defaultBaseUrl || "");
    setShellAllowList(s.shellAllowList || "recommended");
    setAutoApprove(!!s.autoApprove);
    setModels((m.items || []).filter((x: ModelDef) => x.enabled));
    setProviders((p.items || []).filter((x: ProviderDef) => x.enabled));
  }

  useEffect(() => {
    load();
  }, []);

  const providerOptions = useMemo(() => providers.map((x) => x.name), [providers]);
  const selectedProvider = providers.find((x) => x.name === defaultProvider);

  async function save() {
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ defaultModel, defaultProvider, defaultBaseUrl, shellAllowList, autoApprove }),
    });
    await load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Paramètres globaux</h1>
      <div className="rounded-xl bg-white p-4 shadow-sm space-y-3">
        <label className="block text-sm">Modèle par défaut (combo préconfiguré)</label>
        <select value={defaultModel} onChange={(e) => setDefaultModel(e.target.value)} className="w-full rounded border p-2">
          <option value="">-- Choisir --</option>
          {models.map((m) => (
            <option key={m.id} value={m.model}>{m.label} ({m.model})</option>
          ))}
        </select>

        <label className="block text-sm">Provider par défaut</label>
        <select value={defaultProvider} onChange={(e) => setDefaultProvider(e.target.value)} className="w-full rounded border p-2">
          <option value="">-- Choisir --</option>
          {providerOptions.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <label className="block text-sm">Base URL (optionnelle)</label>
        <input value={defaultBaseUrl} onChange={(e) => setDefaultBaseUrl(e.target.value)} className="w-full rounded border p-2" placeholder={selectedProvider?.baseUrl || "https://api.openai.com/v1"} />

        <label className="block text-sm">Shell allow list</label>
        <select value={shellAllowList} onChange={(e) => setShellAllowList(e.target.value)} className="w-full rounded border p-2">
          <option value="recommended">recommended</option>
          <option value="all">all</option>
        </select>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={autoApprove} onChange={(e) => setAutoApprove(e.target.checked)} /> Auto-approve tool calls
        </label>
        <button onClick={save} className="rounded bg-zinc-900 px-3 py-2 text-white">Enregistrer</button>
      </div>
    </div>
  );
}
