import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];
if (!password || password.length < 12) {
  console.error('Usage: npm run admin:hash-password -- "a password of 12+ characters"');
  process.exit(1);
}

const salt = randomBytes(16);
const N = 16_384;
const r = 8;
const p = 1;
const hash = scryptSync(password, salt, 64, {
  N,
  r,
  p,
  maxmem: 64 * 1024 * 1024
});

console.log(
  ["scrypt", N, r, p, salt.toString("hex"), hash.toString("hex")].join("$")
);
