import crypto from "crypto";

/**
 * Encryption utilities for sensitive financial data (at-rest encryption)
 * Uses AES-256-GCM for authenticated encryption
 */

const ALGORITHM = "aes-256-gcm";
const SALT_LENGTH = 16;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Derives a key from the master secret using PBKDF2
 */
function deriveKey(masterSecret: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(masterSecret, salt, 100000, 32, "sha256");
}

/**
 * Encrypts a numeric amount to a string
 * Format: salt:iv:authTag:encryptedData (all hex-encoded)
 */
export function encryptAmount(amount: string | number, masterSecret: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = deriveKey(masterSecret, salt);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const amountStr = String(amount);

  let encrypted = cipher.update(amountStr, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Format: salt:iv:authTag:encryptedData
  return [
    salt.toString("hex"),
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted,
  ].join(":");
}

/**
 * Decrypts an encrypted amount back to the original value
 */
export function decryptAmount(encryptedData: string, masterSecret: string): string {
  try {
    const parts = encryptedData.split(":");
    if (parts.length !== 4) {
      throw new Error("Invalid encrypted data format");
    }

    const [saltHex, ivHex, authTagHex, encrypted] = parts;
    const salt = Buffer.from(saltHex, "hex");
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const key = deriveKey(masterSecret, salt);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("[Encryption] Decryption failed:", error);
    throw new Error("Failed to decrypt amount");
  }
}

/**
 * Validates that encrypted data can be decrypted (for integrity checks)
 */
export function validateEncryption(encryptedData: string, masterSecret: string): boolean {
  try {
    decryptAmount(encryptedData, masterSecret);
    return true;
  } catch {
    return false;
  }
}
