"use client";

import { useEffect, useState } from "react";

type Agent = { id: string; name: string; role: string; model: string; enabled: boolean; systemPrompt?: string };

export default function AgentsPage() {
  const [items, setItems] = useState<Agent[]>([]);
  const [draft, setDraft] = useState<Partial<Agent>>({ name: "", role: "", model: "", enabled: true, systemPrompt: "" });

  const load = async () => {
    const r = await fetch('/api/agents');
    const d = await r.json();
    setItems(d.items || []);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    await fetch('/api/agents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) });
    setDraft({ name: "", role: "", model: "", enabled: true, systemPrompt: "" });
    load();
  };

  const toggle = async (a: Agent) => {
    await fetch('/api/agents', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: a.id, enabled: !a.enabled }) });
    load();
  };

  const remove = async (id: string) => {
    await fetch(`/api/agents?id=${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Agents & Règles</h1>
      <div className="rounded-xl bg-white p-4 shadow-sm grid gap-2">
        <input className="rounded border p-2" placeholder="Nom agent" value={draft.name || ''} onChange={(e)=>setDraft({...draft,name:e.target.value})}/>
        <input className="rounded border p-2" placeholder="Rôle (ex: researcher)" value={draft.role || ''} onChange={(e)=>setDraft({...draft,role:e.target.value})}/>
        <input className="rounded border p-2" placeholder="Modèle (ex: gpt-4o)" value={draft.model || ''} onChange={(e)=>setDraft({...draft,model:e.target.value})}/>
        <textarea className="rounded border p-2" rows={3} placeholder="Règles / prompt système" value={draft.systemPrompt || ''} onChange={(e)=>setDraft({...draft,systemPrompt:e.target.value})}/>
        <button onClick={create} className="rounded bg-zinc-900 px-3 py-2 text-white">Ajouter agent</button>
      </div>

      <div className="space-y-2">
        {items.map((a) => (
          <div key={a.id} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{a.name} <span className="text-xs text-zinc-500">({a.role})</span></p>
                <p className="text-xs text-zinc-500">model: {a.model || '-'}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>toggle(a)} className="rounded border px-2 py-1 text-sm">{a.enabled ? 'Désactiver' : 'Activer'}</button>
                <button onClick={()=>remove(a.id)} className="rounded bg-red-600 px-2 py-1 text-sm text-white">Supprimer</button>
              </div>
            </div>
            {a.systemPrompt && <pre className="mt-2 whitespace-pre-wrap rounded bg-zinc-100 p-2 text-xs text-zinc-700">{a.systemPrompt}</pre>}
          </div>
        ))}
      </div>
    </div>
  );
}
