import type { SessionOptions } from "iron-session";

export type AdminSession = {
  isAdmin?: boolean;
  authenticatedAt?: number;
};

const secret = process.env.SESSION_SECRET;

export function assertSessionConfigured() {
  if (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PHASE !== "phase-production-build" &&
    (!secret || secret.length < 32)
  ) {
    throw new Error("SESSION_SECRET must contain at least 32 characters in production.");
  }
}

export const sessionOptions: SessionOptions = {
  password: secret ?? "development-only-secret-change-before-deploying",
  cookieName: "mike_archive_admin",
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
    path: "/"
  }
};
