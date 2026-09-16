import crypto from "crypto";

// The encryption key MUST be stable across all environments (local dev,
// Hostinger, etc.). The Supabase service-role key is identical everywhere for
// a given project, so we derive the key from it ONLY. Using ADMIN_SECRET here
// caused a mismatch: passwords encrypted in one environment could not be
// decrypted in another, silently breaking SMTP auth.
function getSecret(): string {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY must be set for encryption.");
  }
  return secret;
}

function deriveKey(): Buffer {
  return crypto.createHash("sha256").update(getSecret()).digest();
}

/**
 * Encrypt a plaintext string with AES-256-GCM.
 * Returns `iv:tag:ciphertext` (base64 segments).
 */
export function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", deriveKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString("base64"), tag.toString("base64"), ciphertext.toString("base64")].join(":");
}

export function decrypt(payload: string | null | undefined): string {
  if (!payload) return "";
  try {
    const [ivB64, tagB64, dataB64] = payload.split(":");
    const iv = Buffer.from(ivB64, "base64");
    const tag = Buffer.from(tagB64, "base64");
    const data = Buffer.from(dataB64, "base64");
    const decipher = crypto.createDecipheriv("aes-256-gcm", deriveKey(), iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  } catch {
    return "";
  }
}

export function hashToken(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function randomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function generateOtp(length = 6): string {
  const digits = "0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += digits[crypto.randomInt(digits.length)];
  }
  return out;
}
