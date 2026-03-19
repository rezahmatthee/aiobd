/**
 * CSRF protection utilities.
 *
 * Implements the Double-Submit Cookie pattern:
 *   1. A random token is generated and stored in a Secure, SameSite=Strict cookie.
 *   2. The same token is included in every state-mutating request as the
 *      `X-CSRF-Token` request header.
 *   3. The server validates that the header value matches the cookie value.
 *
 * SameSite=Strict prevents the cookie from being sent on cross-site requests,
 * and the custom header requirement prevents simple-form CSRF attacks.
 */

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';

/**
 * Generates a cryptographically random hex string using the Web Crypto API.
 *
 * @param {number} bytes - Number of random bytes (default 32)
 * @returns {string} Hex-encoded random token
 */
function generateToken(bytes = 32) {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Reads the CSRF token from the cookie jar.
 * Returns null if no token is present.
 *
 * @returns {string|null}
 */
export function getCsrfToken() {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${CSRF_COOKIE_NAME}=`));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

/**
 * Ensures a CSRF token cookie exists.
 * If one is already set it is reused; otherwise a new token is generated and
 * stored as a Secure SameSite=Strict cookie.
 *
 * Call this once at application startup (e.g., in main.js / App.jsx).
 *
 * @returns {string} The current CSRF token
 */
export function ensureCsrfToken() {
  let token = getCsrfToken();
  if (!token) {
    token = generateToken();
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${CSRF_COOKIE_NAME}=${encodeURIComponent(token)}; SameSite=Strict; Path=/${secure}`;
  }
  return token;
}

/**
 * Returns the headers object required for state-mutating API requests,
 * including the X-CSRF-Token and Authorization headers.
 *
 * @param {string} [accessToken] - Bearer token from in-memory auth store
 * @returns {Record<string, string>}
 */
export function secureHeaders(accessToken) {
  const headers = {
    'Content-Type': 'application/json',
    [CSRF_HEADER_NAME]: ensureCsrfToken(),
  };
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return headers;
}
