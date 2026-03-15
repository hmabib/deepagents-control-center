"use client";

import { useEffect, useState } from "react";

type Provider = { id: string; name: string; keyName: string; baseUrl?: string; enabled: boolean };

export default function ProvidersPage() {
  const [items, setItems] = useState<Provider[]>([]);
  const [draft, setDraft] = useState<Partial<Provider>>({ name: "", keyName: "", baseUrl: "", enabled: true });

  const load = async () => {
    const r = await fetch('/api/providers');
    const d = await r.json();
    setItems(d.items || []);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    await fetch('/api/providers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) });
    setDraft({ name: "", keyName: "", baseUrl: "", enabled: true });
    load();
  };

  const toggle = async (p: Provider) => {
    await fetch('/api/providers', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: p.id, enabled: !p.enabled }) });
    load();
  };

  const remove = async (id: string) => {
    await fetch(`/api/providers?id=${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Providers & Clés (catalogue)</h1>
      <p className="text-sm text-zinc-600">Cette section documente les providers et variables attendues. Les secrets restent dans l'environnement serveur.</p>
      <div className="rounded-xl bg-white p-4 shadow-sm grid gap-2">
        <input className="rounded border p-2" placeholder="Provider (OpenAI, Anthropic...)" value={draft.name || ''} onChange={(e)=>setDraft({...draft,name:e.target.value})}/>
        <input className="rounded border p-2" placeholder="Nom variable (OPENAI_API_KEY)" value={draft.keyName || ''} onChange={(e)=>setDraft({...draft,keyName:e.target.value})}/>
        <input className="rounded border p-2" placeholder="Base URL (optionnel)" value={draft.baseUrl || ''} onChange={(e)=>setDraft({...draft,baseUrl:e.target.value})}/>
        <button onClick={create} className="rounded bg-zinc-900 px-3 py-2 text-white">Ajouter provider</button>
      </div>
      <div className="space-y-2">
        {items.map((p)=> (
          <div key={p.id} className="rounded-xl bg-white p-4 shadow-sm flex items-center justify-between">
            <div>
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-zinc-500">env: {p.keyName} {p.baseUrl ? `• ${p.baseUrl}` : ''}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>toggle(p)} className="rounded border px-2 py-1 text-sm">{p.enabled ? 'Désactiver' : 'Activer'}</button>
              <button onClick={()=>remove(p.id)} className="rounded bg-red-600 px-2 py-1 text-sm text-white">Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
