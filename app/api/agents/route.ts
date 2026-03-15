import { requireAuth } from "@/lib/auth";
import { readJsonFile, writeJsonFile } from "@/lib/storage";
import { NextResponse } from "next/server";

type AgentCfg = { id: string; name: string; role: string; model: string; enabled: boolean; systemPrompt?: string };

const fallback: AgentCfg[] = [];

export async function GET() {
  try {
    await requireAuth();
    const items = await readJsonFile<AgentCfg[]>("agents.json", fallback);
    return NextResponse.json({ ok: true, items });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return NextResponse.json({ ok: false }, { status: 401 });
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAuth();
    const body = await req.json();
    const items = await readJsonFile<AgentCfg[]>("agents.json", fallback);
    const item: AgentCfg = {
      id: body.id || crypto.randomUUID(),
      name: body.name || "Nouvel agent",
      role: body.role || "general",
      model: body.model || "",
      enabled: body.enabled ?? true,
      systemPrompt: body.systemPrompt || "",
    };
    items.push(item);
    await writeJsonFile("agents.json", items);
    return NextResponse.json({ ok: true, item });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return NextResponse.json({ ok: false }, { status: 401 });
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await requireAuth();
    const body = await req.json();
    const items = await readJsonFile<AgentCfg[]>("agents.json", fallback);
    const idx = items.findIndex((a) => a.id === body.id);
    if (idx === -1) return NextResponse.json({ ok: false, error: "Agent introuvable" }, { status: 404 });
    items[idx] = { ...items[idx], ...body };
    await writeJsonFile("agents.json", items);
    return NextResponse.json({ ok: true, item: items[idx] });
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
    const items = (await readJsonFile<AgentCfg[]>("agents.json", fallback)).filter((x) => x.id !== id);
    await writeJsonFile("agents.json", items);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return NextResponse.json({ ok: false }, { status: 401 });
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
