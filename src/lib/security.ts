// Lightweight client-side credential hashing for the mock/demo data layer.
// PINs are never persisted in plain text, and never logged.

const SALT = "safebox.v1.mock";

export function hashPin(pin: string): string {
  const input = `${SALT}:${pin}`;
  // FNV-1a (32-bit) x2 rounds for a slightly wider digest
  let h1 = 0x811c9dc5;
  let h2 = 0x1000193;
  for (let i = 0; i < input.length; i++) {
    h1 ^= input.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ input.charCodeAt(input.length - 1 - i), 0x85ebca6b) >>> 0;
  }
  return `h1$${h1.toString(36)}${h2.toString(36)}`;
}

export function verifyPin(pin: string, stored: string): boolean {
  if (!stored) return false;
  return hashPin(pin) === stored;
}

export const isValidPin = (pin: string) => /^\d{4,6}$/.test(pin);
export const isValidPhone = (phone: string) => /^0\d{10}$/.test(phone.replace(/\s+/g, ""));
export const normalizePhone = (phone: string) =>
  phone.replace(/\s+/g, "").replace(/^\+?234/, "0");

// Basic input hygiene for free-text fields rendered back to the user
export const sanitizeText = (value: string, max = 120) =>
  value.replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, max);

export const isValidEmail = (email: string) => /^[^\s@]{1,64}@[^\s@]{1,190}\.[a-zA-Z]{2,}$/.test(email);

// Rate limiting for mock auth attempts (per identifier, in-memory + session)
const attempts = new Map<string, { count: number; until: number }>();
export function checkThrottle(key: string): { blocked: boolean; retryInSec?: number } {
  const rec = attempts.get(key);
  if (rec && rec.until > Date.now()) {
    return { blocked: true, retryInSec: Math.ceil((rec.until - Date.now()) / 1000) };
  }
  return { blocked: false };
}
export function registerFailure(key: string) {
  const rec = attempts.get(key) ?? { count: 0, until: 0 };
  rec.count += 1;
  if (rec.count >= 5) {
    rec.until = Date.now() + 60_000;
    rec.count = 0;
  }
  attempts.set(key, rec);
}
export function clearFailures(key: string) {
  attempts.delete(key);
}
