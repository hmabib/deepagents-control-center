"use client";

import { useEffect, useMemo, useState } from "react";

type ModelDef = { id: string; provider: string; label: string; model: string; category: string; recommended: boolean; enabled: boolean };

export default function ModelsPage() {
  const [items, setItems] = useState<ModelDef[]>([]);

  const load = async () => {
    const r = await fetch('/api/models');
    const d = await r.json();
    setItems(d.items || []);
  };

  useEffect(() => { load(); }, []);

  const grouped = useMemo(() => {
    return items.reduce<Record<string, ModelDef[]>>((acc, m) => {
      acc[m.provider] ||= [];
      acc[m.provider].push(m);
      return acc;
    }, {});
  }, [items]);

  const toggle = async (m: ModelDef) => {
    await fetch('/api/models', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: m.id, enabled: !m.enabled }) });
    load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Catalogue modèles (combos)</h1>
      <p className="text-sm text-zinc-600">Précharge les modèles récents (OpenAI, Codex, Anthropic, Google) et active/désactive les options disponibles pour l’équipe.</p>

      {Object.entries(grouped).map(([provider, list]) => (
        <div key={provider} className="rounded-xl bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-lg font-medium capitalize">{provider}</h2>
          <div className="space-y-2">
            {list.map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded border p-3">
                <div>
                  <p className="font-medium">{m.label}</p>
                  <p className="text-xs text-zinc-500">{m.model} • {m.category} {m.recommended ? '• recommandé' : ''}</p>
                </div>
                <button onClick={() => toggle(m)} className="rounded border px-2 py-1 text-sm">{m.enabled ? 'Actif' : 'Inactif'}</button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
