/**
 * URL Redirect Utilities
 *
 * Provides secure validation and handling of returnUrl parameters
 * to prevent open redirect vulnerabilities.
 */

const MAX_URL_LENGTH = 2048;

/**
 * Validates that a returnUrl is safe to redirect to
 *
 * Security checks:
 * - Must be a relative URL (starts with /)
 * - Cannot be a protocol-relative URL (no //)
 * - Cannot contain protocol prefixes (http://, https://, javascript:, data:, etc.)
 * - Must be reasonable length
 *
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if URL is safe, false otherwise
 */
export function isValidReturnUrl(url) {
  // Check for null/undefined/empty
  if (!url || typeof url !== 'string') {
    return false;
  }

  // Trim whitespace
  const trimmed = url.trim();

  // Must not be empty after trimming
  if (trimmed.length === 0) {
    return false;
  }

  // Check length to prevent DoS
  if (trimmed.length > MAX_URL_LENGTH) {
    return false;
  }

  // Must start with / (relative URL)
  if (!trimmed.startsWith('/')) {
    return false;
  }

  // Must NOT be a protocol-relative URL (//example.com)
  if (trimmed.startsWith('//')) {
    return false;
  }

  // Check for backslash tricks (/\evil.com)
  if (trimmed.includes('\\')) {
    return false;
  }

  // Check for protocol injections at the start of the URL
  // Note: We only check the start because query parameters can contain these strings safely
  // e.g., /search?q=javascript:alert(1) is safe - it's just a search query
  const lowerUrl = trimmed.toLowerCase();
  const dangerousProtocols = [
    'javascript:',
    'data:',
    'vbscript:',
    'file:',
    'about:',
  ];

  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return false;
    }
  }

  // Check for absolute URLs at the start (protocol-based)
  // Note: Similar to above, we only check the start of the URL
  if (lowerUrl.startsWith('http://') || lowerUrl.startsWith('https://')) {
    return false;
  }

  // Passed all checks
  return true;
}

/**
 * Encodes a URL for use as a returnUrl query parameter
 *
 * @param {string} url - The URL to encode
 * @returns {string} - The encoded URL
 */
export function encodeReturnUrl(url) {
  return encodeURIComponent(url);
}

/**
 * Decodes a returnUrl query parameter
 *
 * @param {string} encodedUrl - The encoded URL
 * @returns {string} - The decoded URL
 */
export function decodeReturnUrl(encodedUrl) {
  try {
    return decodeURIComponent(encodedUrl);
  } catch (e) {
    // If decoding fails, return empty string
    console.error('Failed to decode returnUrl:', e);
    return '';
  }
}
