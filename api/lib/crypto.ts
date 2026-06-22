import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALG = "aes-256-gcm";

function keyBuffer(): Buffer {
  const k = process.env.VAULT_KEY ?? "";
  if (k.length !== 64) throw new Error("VAULT_KEY must be a 64-char hex string (32 bytes)");
  return Buffer.from(k, "hex");
}

export function encrypt(plain: string): string {
  const key = keyBuffer();
  const iv  = randomBytes(12);
  const cipher = createCipheriv(ALG, key, iv);
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${ct.toString("hex")}`;
}

export function decrypt(blob: string): string {
  const [ivHex, tagHex, ctHex] = blob.split(":");
  if (!ivHex || !tagHex || !ctHex) throw new Error("Invalid encrypted blob");
  const key = keyBuffer();
  const decipher = createDecipheriv(ALG, key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  const plain = Buffer.concat([decipher.update(Buffer.from(ctHex, "hex")), decipher.final()]);
  return plain.toString("utf8");
}
