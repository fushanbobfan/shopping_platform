import {
  createHash,
  randomBytes,
  scryptSync,
  timingSafeEqual
} from "node:crypto";

const KEY_LENGTH = 64;
const SCRYPT_N = 16_384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;

export function hashAdminPassword(password: string) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
    maxmem: 64 * 1024 * 1024
  });
  return [
    "scrypt",
    SCRYPT_N,
    SCRYPT_R,
    SCRYPT_P,
    salt.toString("hex"),
    hash.toString("hex")
  ].join("$");
}

export function verifyAdminPassword(password: string) {
  const encoded = process.env.ADMIN_PASSWORD_HASH;
  if (encoded) {
    const [algorithm, n, r, p, saltHex, hashHex] = encoded.split("$");
    if (
      algorithm !== "scrypt" ||
      Number(n) !== SCRYPT_N ||
      Number(r) !== SCRYPT_R ||
      Number(p) !== SCRYPT_P ||
      !/^[0-9a-f]{32}$/i.test(saltHex || "") ||
      !/^[0-9a-f]{128}$/i.test(hashHex || "")
    ) {
      return false;
    }
    const expected = Buffer.from(hashHex, "hex");
    const actual = scryptSync(password, Buffer.from(saltHex, "hex"), KEY_LENGTH, {
      N: SCRYPT_N,
      r: SCRYPT_R,
      p: SCRYPT_P,
      maxmem: 64 * 1024 * 1024
    });
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  }

  const legacy = process.env.ADMIN_PASSWORD;
  if (!legacy) return false;
  const actual = Buffer.from(password);
  const expected = Buffer.from(legacy);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function loginFingerprint(ip: string) {
  return createHash("sha256")
    .update(`${process.env.SESSION_SECRET ?? "dev"}:${ip}`)
    .digest("hex");
}
