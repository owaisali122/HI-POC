/**
 * Central Form.io configuration for use across admin and portals.
 *
 * Forms API URL is read from environment or derived so the same codebase
 * works in multiple portals with different backends.
 *
 * Environment variables (first set wins):
 * - NEXT_PUBLIC_FORMS_API_URL – full URL to the forms list API (e.g. https://admin.example.com/api/forms).
 *   Use in multi-portal setups where the React app fetches forms from a different origin.
 * - FORMS_API_URL – same, for server-side only (Node); use when you don’t want the URL on the client.
 *
 * Fallback when neither is set:
 * - Browser: current origin + '/api/forms' (same-origin).
 * - Node: http://localhost:3000/api/forms (local dev).
 */

const FORMS_API_PATH = '/api/forms'

/**
 * Returns the base URL of the app (origin) when running in a browser.
 * In Node, returns empty so callers can use a default.
 */
function getBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  if (typeof process !== 'undefined' && process.env?.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  return ''
}

/**
 * Forms list API URL used by App Detail Ref and form builder (fetch forms for dropdown and injection).
 * Set NEXT_PUBLIC_FORMS_API_URL or FORMS_API_URL in .env for production / multi-portal use.
 */
export function getFormsApiUrl(): string {
  const fromEnv =
    (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_FORMS_API_URL) ||
    (typeof process !== 'undefined' && process.env?.FORMS_API_URL)
  if (fromEnv && typeof fromEnv === 'string' && fromEnv.trim()) {
    return fromEnv.trim().replace(/\/+$/, '') // strip trailing slashes
  }
  const base = getBaseUrl()
  if (base) {
    return `${base}${FORMS_API_PATH}`
  }
  return `http://localhost:3000${FORMS_API_PATH}`
}

/** Default limit when listing forms (Payload default is 10; we need all for dropdown/injection). */
const FORMS_LIST_LIMIT = 500

/**
 * URL to fetch the forms list with a high limit so all forms appear in the App Detail Ref dropdown.
 */
export function getFormsListUrl(): string {
  const base = getFormsApiUrl()
  const sep = base.includes('?') ? '&' : '?'
  return `${base}${sep}limit=${FORMS_LIST_LIMIT}`
}
