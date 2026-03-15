import Nav from "@/components/Nav";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <Nav />
      <main className="mx-auto max-w-6xl p-4">{children}</main>
    </div>
  );
}
