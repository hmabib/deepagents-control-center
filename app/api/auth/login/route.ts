import { COOKIE_NAME, getAdminPassword } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { password } = await req.json();
  if (!password || password !== getAdminPassword()) {
    return NextResponse.json({ ok: false, error: "Mot de passe invalide" }, { status: 401 });
  }

  const store = await cookies();
  store.set(COOKIE_NAME, "ok", { httpOnly: true, sameSite: "lax", path: "/" });
  return NextResponse.json({ ok: true });
}
