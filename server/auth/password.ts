/**
 * HEALTH.AI Password Hashing
 *
 * Uses Node's built-in scrypt (memory-hard KDF) instead of raw SHA-256.
 * Legacy SHA-256 hashes remain verifiable for existing accounts and are
 * transparently upgraded to scrypt on the next successful login.
 *
 * Format: scrypt$<salt-hex>$<derived-key-hex>
 */

import crypto from 'crypto';

const SCRYPT_KEYLEN = 64;
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 };

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(password, salt, SCRYPT_KEYLEN, SCRYPT_PARAMS);
  return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`;
}

export interface PasswordVerification {
  valid: boolean;
  /** True when the stored hash is a legacy format and should be re-hashed. */
  needsRehash: boolean;
}

export function verifyPassword(storedHash: string | undefined, password: string): PasswordVerification {
  if (!storedHash) return { valid: false, needsRehash: false };

  // Modern scrypt format
  if (storedHash.startsWith('scrypt$')) {
    const parts = storedHash.split('$');
    if (parts.length !== 3) return { valid: false, needsRehash: false };
    try {
      const salt = Buffer.from(parts[1], 'hex');
      const expected = Buffer.from(parts[2], 'hex');
      const derived = crypto.scryptSync(password, salt, expected.length, SCRYPT_PARAMS);
      return { valid: crypto.timingSafeEqual(expected, derived), needsRehash: false };
    } catch {
      return { valid: false, needsRehash: false };
    }
  }

  // Legacy raw SHA-256 (existing accounts) — verify and flag for upgrade
  const legacy = crypto.createHash('sha256').update(password).digest('hex');
  const legacyBuffer = Buffer.from(legacy, 'utf-8');
  const storedBuffer = Buffer.from(storedHash, 'utf-8');
  const valid =
    legacyBuffer.length === storedBuffer.length && crypto.timingSafeEqual(legacyBuffer, storedBuffer);
  return { valid, needsRehash: valid };
}
