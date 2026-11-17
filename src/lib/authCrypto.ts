// Cryptographic utilities for client-side password hashing and session tokens

const SALT = 'SEC_PRIME_SALT_2026';

export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${password}:${SALT}`);
  
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Simple fallback for environments without subtle crypto
  let hash = 0;
  const str = `${password}:${SALT}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'simple_' + Math.abs(hash).toString(16);
}

export async function verifyPassword(password: string, expectedHash: string): Promise<boolean> {
  const hash = await hashPassword(password);
  return hash === expectedHash;
}

export function generateToken(): string {
  return 'sec_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
}
