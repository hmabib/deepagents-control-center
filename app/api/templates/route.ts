import { requireAuth } from "@/lib/auth";
import { readJsonFile, writeJsonFile } from "@/lib/storage";
import { NextResponse } from "next/server";

type Template = { id: string; title: string; content: string };

const empty: Template[] = [];

export async function GET() {
  try {
    await requireAuth();
    const templates = await readJsonFile<Template[]>("templates.json", empty);
    return NextResponse.json({ ok: true, templates });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return NextResponse.json({ ok: false }, { status: 401 });
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAuth();
    const body = await req.json();
    const templates = await readJsonFile<Template[]>("templates.json", empty);
    const t: Template = { id: body.id || crypto.randomUUID(), title: body.title || "Sans titre", content: body.content || "" };
    templates.push(t);
    await writeJsonFile("templates.json", templates);
    return NextResponse.json({ ok: true, template: t });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return NextResponse.json({ ok: false }, { status: 401 });
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await requireAuth();
    const body = await req.json();
    const templates = await readJsonFile<Template[]>("templates.json", empty);
    const idx = templates.findIndex((t) => t.id === body.id);
    if (idx === -1) return NextResponse.json({ ok: false, error: "Template introuvable" }, { status: 404 });
    templates[idx] = { ...templates[idx], title: body.title ?? templates[idx].title, content: body.content ?? templates[idx].content };
    await writeJsonFile("templates.json", templates);
    return NextResponse.json({ ok: true, template: templates[idx] });
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
    const templates = await readJsonFile<Template[]>("templates.json", empty);
    const next = templates.filter((t) => t.id !== id);
    await writeJsonFile("templates.json", next);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return NextResponse.json({ ok: false }, { status: 401 });
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
