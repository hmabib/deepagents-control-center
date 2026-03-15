import { requireAuth } from "@/lib/auth";
import { readJsonFile, writeJsonFile } from "@/lib/storage";
import { NextResponse } from "next/server";

type ModelDef = { id: string; provider: string; label: string; model: string; category: string; recommended: boolean; enabled: boolean };

const fallback: ModelDef[] = [];

export async function GET() {
  try {
    await requireAuth();
    const items = await readJsonFile<ModelDef[]>("models.json", fallback);
    return NextResponse.json({ ok: true, items });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await requireAuth();
    const body = await req.json();
    const items = await readJsonFile<ModelDef[]>("models.json", fallback);
    const idx = items.findIndex((x) => x.id === body.id);
    if (idx === -1) return NextResponse.json({ ok: false, error: "Model introuvable" }, { status: 404 });
    items[idx] = { ...items[idx], ...body };
    await writeJsonFile("models.json", items);
    return NextResponse.json({ ok: true, item: items[idx] });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
