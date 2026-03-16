import { requireAuth } from "@/lib/auth";
import { AppSettings } from "@/lib/deepagents";
import { readJsonFile, writeJsonFile } from "@/lib/storage";
import { NextResponse } from "next/server";

const defaults: AppSettings = {
  defaultModel: "",
  defaultProvider: "",
  defaultBaseUrl: "",
  shellAllowList: "recommended",
  autoApprove: false,
};

export async function GET() {
  try {
    await requireAuth();
    const settings = await readJsonFile<AppSettings>("settings.json", defaults);
    return NextResponse.json({ ok: true, settings });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return NextResponse.json({ ok: false }, { status: 401 });
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    await requireAuth();
    const body = await req.json();
    const next: AppSettings = {
      defaultModel: body.defaultModel || "",
      defaultProvider: body.defaultProvider || "",
      defaultBaseUrl: body.defaultBaseUrl || "",
      shellAllowList: body.shellAllowList || "recommended",
      autoApprove: Boolean(body.autoApprove),
    };
    await writeJsonFile("settings.json", next);
    return NextResponse.json({ ok: true, settings: next });
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") return NextResponse.json({ ok: false }, { status: 401 });
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
