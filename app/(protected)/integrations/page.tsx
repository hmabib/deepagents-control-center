"use client";

import { useEffect, useState } from "react";

type Integration = { id: string; name: string; type: string; config: Record<string, string>; enabled: boolean };

export default function IntegrationsPage() {
  const [items, setItems] = useState<Integration[]>([]);

  const load = async () => {
    const r = await fetch('/api/integrations');
    const d = await r.json();
    setItems(d.items || []);
  };

  useEffect(() => { load(); }, []);

  const toggle = async (it: Integration) => {
    await fetch('/api/integrations', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: it.id, enabled: !it.enabled }) });
    load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Connexions MCP & API</h1>
      <p className="text-sm text-zinc-600">Active les intégrations (LangSmith, MCP, APIs). Les secrets restent configurés côté environnement (jamais en clair dans l’UI).</p>

      <div className="space-y-2">
        {items.map((it) => (
          <div key={it.id} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{it.name}</p>
                <p className="text-xs text-zinc-500">type: {it.type}</p>
              </div>
              <button onClick={() => toggle(it)} className="rounded border px-2 py-1 text-sm">{it.enabled ? 'Actif' : 'Inactif'}</button>
            </div>
            <pre className="mt-2 rounded bg-zinc-100 p-2 text-xs text-zinc-700">{JSON.stringify(it.config, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}
