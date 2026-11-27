/**
 * SHA-256 of a File/Blob as lowercase hex, computed locally in the browser —
 * the file itself is never uploaded anywhere.
 */
export async function sha256Hex(file) {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Your browser blocks secure hashing on this address. Open the app via https:// or localhost.');
  }
  const digest = await crypto.subtle.digest('SHA-256', await file.arrayBuffer());
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

export function shortHash(hex, size = 10) {
  return hex ? `${hex.slice(0, size)}…${hex.slice(-6)}` : '';
}
