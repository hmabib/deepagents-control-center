import { requireAuth } from "@/lib/auth";
import { readJsonFile } from "@/lib/storage";
import { AppSettings, runOneShot } from "@/lib/deepagents";
import { NextResponse } from "next/server";

const defaults: AppSettings = { defaultModel: "", shellAllowList: "recommended", autoApprove: false };

export async function POST(req: Request) {
  try {
    await requireAuth();
    const { task, agent, model } = await req.json();
    if (!task) return NextResponse.json({ ok: false, error: "Task manquante" }, { status: 400 });
    const settings = await readJsonFile<AppSettings>("settings.json", defaults);
    const out = await runOneShot(task, settings, { agent, model });
    return NextResponse.json({ ok: true, ...out });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return NextResponse.json({ ok: false }, { status: 401 });
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
