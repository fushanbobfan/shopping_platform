import { afterEach, describe, expect, it } from "vitest";
import { hashAdminPassword, loginFingerprint, verifyAdminPassword } from "./admin-password";

const originalHash = process.env.ADMIN_PASSWORD_HASH;
const originalPassword = process.env.ADMIN_PASSWORD;
const originalSecret = process.env.SESSION_SECRET;

afterEach(() => {
  process.env.ADMIN_PASSWORD_HASH = originalHash;
  process.env.ADMIN_PASSWORD = originalPassword;
  process.env.SESSION_SECRET = originalSecret;
});

describe("admin credentials", () => {
  it("verifies scrypt hashes without storing plaintext", () => {
    process.env.ADMIN_PASSWORD_HASH = hashAdminPassword("correct horse battery staple");
    delete process.env.ADMIN_PASSWORD;
    expect(verifyAdminPassword("correct horse battery staple")).toBe(true);
    expect(verifyAdminPassword("wrong password")).toBe(false);
  });

  it("creates a secret-bound login fingerprint", () => {
    process.env.SESSION_SECRET = "a".repeat(32);
    const first = loginFingerprint("127.0.0.1");
    process.env.SESSION_SECRET = "b".repeat(32);
    expect(loginFingerprint("127.0.0.1")).not.toBe(first);
  });

  it("rejects malformed password hashes without throwing", () => {
    process.env.ADMIN_PASSWORD_HASH = "scrypt$not-a-number$8$1$bad$bad";
    expect(verifyAdminPassword("anything")).toBe(false);
  });
});
