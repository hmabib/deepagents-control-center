"use client";

import { useEffect, useState } from "react";

type Tpl = { id: string; title: string; content: string };

export default function TemplatesPage() {
  const [items, setItems] = useState<Tpl[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  async function load() {
    const r = await fetch("/api/templates");
    const d = await r.json();
    setItems(d.templates || []);
  }
  useEffect(() => { load(); }, []);

  async function add() {
    await fetch("/api/templates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, content }) });
    setTitle(""); setContent(""); load();
  }

  async function remove(id: string) {
    await fetch(`/api/templates?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Templates</h1>
      <div className="rounded-xl bg-white p-4 shadow-sm space-y-2">
        <input className="w-full rounded border p-2" placeholder="Titre" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea className="w-full rounded border p-2" rows={4} placeholder="Contenu" value={content} onChange={(e) => setContent(e.target.value)} />
        <button onClick={add} className="rounded bg-zinc-900 px-3 py-2 text-white">Ajouter</button>
      </div>
      <div className="space-y-2">
        {items.map((t) => (
          <div key={t.id} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between"><h2 className="font-medium">{t.title}</h2><button onClick={() => remove(t.id)} className="text-sm text-red-600">Supprimer</button></div>
            <pre className="mt-2 whitespace-pre-wrap text-sm">{t.content}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}
