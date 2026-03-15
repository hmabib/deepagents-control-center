"use client";

import { useEffect, useState } from "react";

type Cron = { id: string; name: string; expression: string; prompt: string; agent?: string; enabled: boolean; lastRunAt?: string; lastStatus?: string };

export default function CronsPage() {
  const [items, setItems] = useState<Cron[]>([]);
  const [draft, setDraft] = useState<Partial<Cron>>({ name: "", expression: "*/30 * * * *", prompt: "", agent: "", enabled: true });

  const load = async () => {
    const r = await fetch('/api/crons');
    const d = await r.json();
    setItems(d.items || []);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    await fetch('/api/crons', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) });
    setDraft({ name: "", expression: "*/30 * * * *", prompt: "", agent: "", enabled: true });
    load();
  };

  const update = async (c: Cron, patch: Partial<Cron>) => {
    await fetch('/api/crons', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...c, ...patch }) });
    load();
  };

  const runNow = async (id: string) => {
    await fetch('/api/crons', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    load();
  };

  const remove = async (id: string) => {
    await fetch(`/api/crons?id=${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Cron / Automatisation</h1>
      <p className="text-sm text-zinc-600">Exemple: <code>*/30 * * * *</code> (toutes les 30 min). En serverless, les cron en mémoire peuvent se réinitialiser.</p>
      <div className="rounded-xl bg-white p-4 shadow-sm grid gap-2">
        <input className="rounded border p-2" placeholder="Nom" value={draft.name || ''} onChange={(e)=>setDraft({...draft,name:e.target.value})}/>
        <input className="rounded border p-2" placeholder="Expression cron" value={draft.expression || ''} onChange={(e)=>setDraft({...draft,expression:e.target.value})}/>
        <input className="rounded border p-2" placeholder="Agent (optionnel)" value={draft.agent || ''} onChange={(e)=>setDraft({...draft,agent:e.target.value})}/>
        <textarea className="rounded border p-2" rows={3} placeholder="Prompt à exécuter" value={draft.prompt || ''} onChange={(e)=>setDraft({...draft,prompt:e.target.value})}/>
        <button onClick={create} className="rounded bg-zinc-900 px-3 py-2 text-white">Ajouter cron</button>
      </div>

      <div className="space-y-2">
        {items.map((c) => (
          <div key={c.id} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-zinc-500">{c.expression} • agent: {c.agent || 'default'} • {c.enabled ? 'actif' : 'inactif'}</p>
                <p className="text-xs text-zinc-500">Dernier run: {c.lastRunAt || '-'} ({c.lastStatus || '-'})</p>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>update(c,{enabled:!c.enabled})} className="rounded border px-2 py-1 text-sm">{c.enabled ? 'Pause' : 'Activer'}</button>
                <button onClick={()=>runNow(c.id)} className="rounded border px-2 py-1 text-sm">Run now</button>
                <button onClick={()=>remove(c.id)} className="rounded bg-red-600 px-2 py-1 text-sm text-white">Supprimer</button>
              </div>
            </div>
            <pre className="mt-2 whitespace-pre-wrap rounded bg-zinc-100 p-2 text-xs text-zinc-700">{c.prompt}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}
