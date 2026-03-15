import { requireAuth } from "@/lib/auth";
import { ensureCronBootstrap, getCrons, runCronNow, saveCrons, syncCronTasks, type CronJobDef } from "@/lib/cron";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await requireAuth();
    await ensureCronBootstrap();
    const items = await getCrons();
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
    const items = await getCrons();
    const item: CronJobDef = {
      id: body.id || crypto.randomUUID(),
      name: body.name || "Nouveau cron",
      expression: body.expression || "*/30 * * * *",
      prompt: body.prompt || "",
      agent: body.agent || "",
      enabled: Boolean(body.enabled),
    };
    items.push(item);
    await saveCrons(items);
    await syncCronTasks();
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
    const items = await getCrons();
    const idx = items.findIndex((c) => c.id === body.id);
    if (idx === -1) return NextResponse.json({ ok: false, error: "Cron introuvable" }, { status: 404 });
    items[idx] = { ...items[idx], ...body };
    await saveCrons(items);
    await syncCronTasks();
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
    const items = (await getCrons()).filter((c) => c.id !== id);
    await saveCrons(items);
    await syncCronTasks();
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return NextResponse.json({ ok: false }, { status: 401 });
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await requireAuth();
    const { id } = await req.json();
    const items = await getCrons();
    const item = items.find((c) => c.id === id);
    if (!item) return NextResponse.json({ ok: false, error: "Cron introuvable" }, { status: 404 });
    await runCronNow(item);
    await saveCrons(items);
    return NextResponse.json({ ok: true, item });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return NextResponse.json({ ok: false }, { status: 401 });
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
