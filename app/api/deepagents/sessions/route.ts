import { requireAuth } from "@/lib/auth";
import { AppSettings, listBgSessions, runBackground } from "@/lib/deepagents";
import { readJsonFile } from "@/lib/storage";
import { NextResponse } from "next/server";

const defaults: AppSettings = { defaultModel: "", shellAllowList: "recommended", autoApprove: false };

export async function GET() {
  try {
    await requireAuth();
    return NextResponse.json({ ok: true, sessions: listBgSessions() });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return NextResponse.json({ ok: false }, { status: 401 });
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAuth();
    const { task } = await req.json();
    if (!task) return NextResponse.json({ ok: false, error: "Task manquante" }, { status: 400 });
    const settings = await readJsonFile<AppSettings>("settings.json", defaults);
    const s = runBackground(task, settings);
    return NextResponse.json({ ok: true, session: s });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return NextResponse.json({ ok: false }, { status: 401 });
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
