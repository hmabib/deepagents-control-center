"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Mot de passe invalide");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-xl bg-white p-6 shadow">
        <h1 className="text-xl font-semibold">Connexion admin</h1>
        <p className="mt-1 text-sm text-zinc-600">Plateforme de pilotage visuelle DeepAgents</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="ADMIN_PASSWORD"
          className="mt-4 w-full rounded border px-3 py-2"
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="mt-4 w-full rounded bg-zinc-900 px-4 py-2 text-white disabled:opacity-50">
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
