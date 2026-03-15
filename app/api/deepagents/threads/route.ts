import { requireAuth } from "@/lib/auth";
import { runThreadsDelete, runThreadsList } from "@/lib/deepagents";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireAuth();
    const out = await runThreadsList();
    return NextResponse.json({ ok: true, ...out });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return NextResponse.json({ ok: false }, { status: 401 });
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ ok: false, error: "id manquant" }, { status: 400 });
    const out = await runThreadsDelete(id);
    return NextResponse.json({ ok: true, ...out });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return NextResponse.json({ ok: false }, { status: 401 });
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
