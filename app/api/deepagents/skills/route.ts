import { requireAuth } from "@/lib/auth";
import { runSkillDelete, runSkillInfo, runSkillsList } from "@/lib/deepagents";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(req.url);
    const name = searchParams.get("name");
    const out = name ? await runSkillInfo(name) : await runSkillsList();
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
    const name = searchParams.get("name");
    if (!name) return NextResponse.json({ ok: false, error: "name manquant" }, { status: 400 });
    const out = await runSkillDelete(name);
    return NextResponse.json({ ok: true, ...out });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return NextResponse.json({ ok: false }, { status: 401 });
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
