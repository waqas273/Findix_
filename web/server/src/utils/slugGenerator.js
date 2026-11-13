import crypto from 'crypto';

/**
 * Generate a high-entropy, URL-safe, human-readable QR slug for Findix tags.
 * Default format: FDX-XXXX-XXXX (e.g. FDX-9K2M-7P4Q)
 * Uses high-entropy cryptographically secure random bytes without ambiguous characters.
 */
export const generateQrSlug = (prefix = 'FDX', length = 8) => {
  // Safe character set: excluding ambiguous characters (0, O, I, 1, L)
  const charset = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  const randomBytes = crypto.randomBytes(length);
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytes[i] % charset.length;
    result += charset[randomIndex];
  }

  // Format as FDX-XXXX-XXXX if length is 8
  if (length === 8) {
    return `${prefix}-${result.slice(0, 4)}-${result.slice(4, 8)}`;
  }

  return `${prefix}-${result}`;
};
