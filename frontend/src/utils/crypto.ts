/**
 * Hash a secret phrase using SHA-256
 * @param secret - The secret phrase as a string
 * @returns Promise<Uint8Array> - The 32-byte hash
 */
export async function hashSecret(secret: string): Promise<Uint8Array> {
  // Convert string to Uint8Array
  const encoder = new TextEncoder();
  const data = encoder.encode(secret);
  
  // Hash using Web Crypto API
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Convert to Uint8Array
  return new Uint8Array(hashBuffer);
}

/**
 * Convert a Uint8Array to hex string for display
 * @param bytes - The byte array
 * @returns string - Hex representation
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hex string to Uint8Array
 * @param hex - The hex string
 * @returns Uint8Array - The byte array
 */
export function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Verify a secret against a hash
 * @param secret - The secret phrase to verify
 * @param hash - The hash to compare against
 * @returns Promise<boolean> - Whether the secret matches
 */
export async function verifySecret(secret: string, hash: Uint8Array): Promise<boolean> {
  const computed = await hashSecret(secret);
  return bytesToHex(computed) === bytesToHex(hash);
}
