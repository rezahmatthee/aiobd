/**
 * Input sanitization utilities.
 *
 * Uses the browser's built-in DOMParser to strip dangerous HTML without
 * depending on an external library (DOMPurify can be added later for richer
 * allowlists if the project adopts rich-text editing).
 *
 * These helpers should be applied to any user-supplied string before it is
 * rendered in the DOM (especially via dangerouslySetInnerHTML).
 */

/**
 * Escapes HTML special characters to prevent XSS in text contexts.
 * Safe for use inside element text content or attribute values.
 *
 * @param {string} value - Raw user-supplied string
 * @returns {string} HTML-escaped string
 */
export function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Strips all HTML tags from a string, leaving only plain text.
 * Suitable for inputs where no HTML is expected (names, VINs, etc.).
 *
 * @param {string} value - Raw user-supplied string
 * @returns {string} Plain text without any HTML markup
 */
export function stripHtml(value) {
  if (!value) return '';
  // Use DOMParser for safe, browser-native parsing
  const doc = new DOMParser().parseFromString(String(value), 'text/html');
  return doc.body.textContent || '';
}

/**
 * Validates that a URL uses an allowed scheme (http or https only).
 * Rejects javascript:, data:, vbscript: and other dangerous schemes.
 *
 * @param {string} url - URL to validate
 * @returns {boolean} True if safe
 */
export function isSafeUrl(url) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Sanitizes an object's string values by stripping HTML from each one.
 * Useful for sanitizing form payloads before submission.
 *
 * @param {Record<string, unknown>} obj - Form values object
 * @returns {Record<string, unknown>} Sanitized copy
 */
export function sanitizeFormValues(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  return Object.fromEntries(
    Object.entries(obj).map(([key, val]) => [
      key,
      typeof val === 'string' ? stripHtml(val) : val,
    ])
  );
}
