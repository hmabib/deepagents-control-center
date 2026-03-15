import { requireAuth } from "@/lib/auth";
import { readJsonFile, writeJsonFile } from "@/lib/storage";
import { NextResponse } from "next/server";

type Integration = { id: string; name: string; type: string; config: Record<string, string>; enabled: boolean };
const fallback: Integration[] = [];

export async function GET() {
  try {
    await requireAuth();
    const items = await readJsonFile<Integration[]>("integrations.json", fallback);
    return NextResponse.json({ ok: true, items });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await requireAuth();
    const body = await req.json();
    const items = await readJsonFile<Integration[]>("integrations.json", fallback);
    const idx = items.findIndex((x) => x.id === body.id);
    if (idx === -1) return NextResponse.json({ ok: false, error: "Integration introuvable" }, { status: 404 });
    items[idx] = { ...items[idx], ...body };
    await writeJsonFile("integrations.json", items);
    return NextResponse.json({ ok: true, item: items[idx] });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
