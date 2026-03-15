import { requireAuth } from "@/lib/auth";
import { removeBgSession } from "@/lib/deepagents";
import { NextResponse } from "next/server";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth();
    const { id } = await params;
    return NextResponse.json({ ok: true, removed: removeBgSession(id) });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return NextResponse.json({ ok: false }, { status: 401 });
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
