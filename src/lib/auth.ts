import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  assertSessionConfigured,
  sessionOptions,
  type AdminSession
} from "./session";

export function getSession() {
  assertSessionConfigured();
  return cookies().then((cookieStore) =>
    getIronSession<AdminSession>(cookieStore, sessionOptions)
  );
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session.isAdmin) {
    redirect("/admin/login");
  }
  return session;
}

export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  return Boolean(session.isAdmin);
}
