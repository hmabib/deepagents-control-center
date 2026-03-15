import { requireAuth } from "@/lib/auth";
import { readJsonFile, writeJsonFile } from "@/lib/storage";
import { NextResponse } from "next/server";

type ProviderCfg = { id: string; name: string; keyName: string; baseUrl?: string; enabled: boolean };
const fallback: ProviderCfg[] = [];

export async function GET() {
  try {
    await requireAuth();
    const items = await readJsonFile<ProviderCfg[]>("providers.json", fallback);
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
    const items = await readJsonFile<ProviderCfg[]>("providers.json", fallback);
    const item: ProviderCfg = {
      id: body.id || crypto.randomUUID(),
      name: body.name || "provider",
      keyName: body.keyName || "API_KEY",
      baseUrl: body.baseUrl || "",
      enabled: body.enabled ?? true,
    };
    items.push(item);
    await writeJsonFile("providers.json", items);
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
    const items = await readJsonFile<ProviderCfg[]>("providers.json", fallback);
    const idx = items.findIndex((a) => a.id === body.id);
    if (idx === -1) return NextResponse.json({ ok: false, error: "Provider introuvable" }, { status: 404 });
    items[idx] = { ...items[idx], ...body };
    await writeJsonFile("providers.json", items);
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
    const items = (await readJsonFile<ProviderCfg[]>("providers.json", fallback)).filter((x) => x.id !== id);
    await writeJsonFile("providers.json", items);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return NextResponse.json({ ok: false }, { status: 401 });
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
