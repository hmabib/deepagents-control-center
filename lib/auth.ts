import { cookies } from "next/headers";

const COOKIE_NAME = "dacc_auth";

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

export async function isAuthenticated() {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  return Boolean(token && token === "ok");
}

export async function requireAuth() {
  const ok = await isAuthenticated();
  if (!ok) throw new Error("UNAUTHORIZED");
}

export { COOKIE_NAME };
