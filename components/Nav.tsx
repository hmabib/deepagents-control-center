"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  ["/dashboard", "Tableau de bord"],
  ["/templates", "Templates"],
  ["/threads", "Threads"],
  ["/skills", "Skills"],
  ["/settings", "Paramètres"],
] as const;

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="font-semibold">DeepAgent Control Center</div>
        <nav className="flex items-center gap-2 text-sm">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className={`rounded px-3 py-1 ${pathname === href ? "bg-zinc-900 text-white" : "hover:bg-zinc-100"}`}>
              {label}
            </Link>
          ))}
          <button onClick={logout} className="ml-2 rounded border px-3 py-1 hover:bg-zinc-100">
            Déconnexion
          </button>
        </nav>
      </div>
    </header>
  );
}
