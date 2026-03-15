import { requireAuth } from "@/lib/auth";
import { runDeepagentsList } from "@/lib/deepagents";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireAuth();
    const out = await runDeepagentsList();
    return NextResponse.json({ ok: true, ...out });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return NextResponse.json({ ok: false }, { status: 401 });
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
