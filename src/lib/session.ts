import type { SessionOptions } from "iron-session";

export type AdminSession = {
  isAdmin?: boolean;
};

export const sessionOptions: SessionOptions = {
  password:
    process.env.SESSION_SECRET ??
    "dev-secret-please-change-in-prod-min-32-chars!",
  cookieName: "shop_admin_session",
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  }
};
