import { requireAuth } from "@/lib/auth";
import { getBgSession } from "@/lib/deepagents";
import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const { id } = await params;
    const s = getBgSession(id);
    if (!s) return NextResponse.json({ ok: false, error: "Session introuvable" }, { status: 404 });
    return NextResponse.json({ ok: true, session: s });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return NextResponse.json({ ok: false }, { status: 401 });
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
