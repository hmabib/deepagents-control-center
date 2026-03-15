import { COOKIE_NAME } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
