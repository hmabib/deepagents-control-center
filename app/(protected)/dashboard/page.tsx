"use client";

import { useEffect, useState } from "react";

type BgSession = { id: string; status: string; startedAt: string; output: string; command: string };

export default function DashboardPage() {
  const [agents, setAgents] = useState("");
  const [task, setTask] = useState("");
  const [result, setResult] = useState("");
  const [agent, setAgent] = useState("");
  const [sessions, setSessions] = useState<BgSession[]>([]);

  async function loadAgents() {
    const res = await fetch("/api/deepagents/agents");
    const data = await res.json();
    setAgents((data.stdout || data.error || "").toString());
  }

  async function loadSessions() {
    const res = await fetch("/api/deepagents/sessions");
    const data = await res.json();
    setSessions(data.sessions || []);
  }

  useEffect(() => {
    loadAgents();
    loadSessions();
    const i = setInterval(loadSessions, 2500);
    return () => clearInterval(i);
  }, []);

  async function runOneShot() {
    const res = await fetch("/api/deepagents/oneshot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task, agent }),
    });
    const data = await res.json();
    setResult((data.stdout || data.stderr || data.error || "").toString());
  }

  async function runBg() {
    await fetch("/api/deepagents/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task, agent }),
    });
    await loadSessions();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Pilotage DeepAgents</h1>

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-2 font-medium">Agents disponibles</h2>
        <pre className="max-h-60 overflow-auto rounded bg-zinc-900 p-3 text-xs text-zinc-100">{agents || "Chargement..."}</pre>
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-2 font-medium">Exécuter une tâche</h2>
        <input value={agent} onChange={(e) => setAgent(e.target.value)} className="mb-2 w-full rounded border p-2" placeholder="Agent (optionnel, ex: coder)" />
        <textarea value={task} onChange={(e) => setTask(e.target.value)} rows={4} className="w-full rounded border p-2" placeholder="Décris la tâche DeepAgent..." />
        <div className="mt-2 flex gap-2">
          <button onClick={runOneShot} className="rounded bg-zinc-900 px-3 py-2 text-white">Run one-shot</button>
          <button onClick={runBg} className="rounded border px-3 py-2">Lancer en arrière-plan</button>
        </div>
        <pre className="mt-3 max-h-72 overflow-auto rounded bg-zinc-900 p-3 text-xs text-zinc-100">{result || "Aucun résultat"}</pre>
      </section>

      <section className="rounded-xl bg-white p-4 shadow-sm">
        <h2 className="mb-2 font-medium">Sessions arrière-plan</h2>
        <div className="space-y-3">
          {sessions.map((s) => (
            <div key={s.id} className="rounded border p-3">
              <div className="flex items-center justify-between">
                <code className="text-xs">{s.id}</code>
                <span className="text-xs">{s.status}</span>
              </div>
              <p className="mt-1 text-xs text-zinc-500">{s.command}</p>
              <pre className="mt-2 max-h-40 overflow-auto rounded bg-zinc-900 p-2 text-xs text-zinc-100">{s.output || "..."}</pre>
            </div>
          ))}
          {sessions.length === 0 && <p className="text-sm text-zinc-500">Aucune session.</p>}
        </div>
      </section>
    </div>
  );
}
