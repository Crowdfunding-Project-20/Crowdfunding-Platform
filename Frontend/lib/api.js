/**
 * Shared API helper — the one source of truth for all backend calls.
 *
 * - Calls same-origin /api/* paths; next.config.ts rewrites these to the
 *   backend (NEXT_PUBLIC_API_URL) server-to-server, so CORS never applies.
 * - Attaches the JWT from localStorage automatically
 * - On 401, clears the token and redirects to /login
 * - Throws a typed ApiError with status + backend error message
 * - Detects FormData (image uploads) and skips JSON Content-Type + stringify
 */

const API_URL = ''
export const TOKEN_KEY = 'nkoso_token'

/* ─── Typed error ─────────────────────────────────────────────────── */

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

/* ─── Token helpers (SSR-safe) ────────────────────────────────────── */

function getToken() {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function clearToken() {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* noop */
  }
}

/* ─── Core request ────────────────────────────────────────────────── */

async function request(endpoint, options = {}) {
  const { method = 'GET', body, headers = {}, ...rest } = options
  const url = `${API_URL}${endpoint}`

  // Build headers
  const fetchHeaders = new Headers(headers)

  const token = getToken()
  if (token) {
    fetchHeaders.set('Authorization', `Bearer ${token}`)
  }

  // Don't set Content-Type for FormData — the browser sets the multipart boundary
  const isFormData = body instanceof FormData
  if (!isFormData && body !== undefined && body !== null) {
    if (!fetchHeaders.has('Content-Type')) {
      fetchHeaders.set('Content-Type', 'application/json')
    }
  }

  const fetchOptions = {
    method,
    headers: fetchHeaders,
    ...rest,
  }

  if (body !== undefined && body !== null) {
    fetchOptions.body = isFormData ? body : JSON.stringify(body)
  }

  // Execute
  let response
  try {
    response = await fetch(url, fetchOptions)
  } catch (err) {
    throw new ApiError(
      'Network error — is the server running? Check your connection.',
      0,
      null,
    )
  }

  // 401 → session expired, redirect to login
  if (response.status === 401) {
    clearToken()
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
    if (currentPath !== '/login') {
      window.location.href = '/login'
    }
    throw new ApiError('Session expired. Please log in again.', 401)
  }

  // Parse response body
  let data = null
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    data = await response.json()
  } else if (response.status !== 204 && response.status !== 202) {
    const text = await response.text()
    if (text) data = text
  }

  // Non-2xx → throw
  if (!response.ok) {
    // Backend validation errors come back as { error, fields: { field: msg } }.
    // For consumers that only show one line (e.g. the signup banner), fall back
    // to the first field's message so they still show something specific.
    const message =
      (data?.fields && Object.values(data.fields)[0]) ||
      data?.error ||
      data?.message ||
      `Request failed with status ${response.status}`
    throw new ApiError(message, response.status, data)
  }

  return data
}

/* ─── Convenience methods ─────────────────────────────────────────── */

/**
 * @template T
 * @param {string} endpoint
 * @param {RequestInit & { method?: string }} [options]
 * @returns {Promise<T>}
 */
const get = (endpoint, options) => request(endpoint, { ...options, method: 'GET' })

/**
 * @template T
 * @param {string} endpoint
 * @param {unknown} body
 * @param {RequestInit & { method?: string }} [options]
 * @returns {Promise<T>}
 */
const post = (endpoint, body, options) =>
  request(endpoint, { ...options, method: 'POST', body })

/**
 * @template T
 * @param {string} endpoint
 * @param {unknown} body
 * @param {RequestInit & { method?: string }} [options]
 * @returns {Promise<T>}
 */
const put = (endpoint, body, options) =>
  request(endpoint, { ...options, method: 'PUT', body })

/**
 * @template T
 * @param {string} endpoint
 * @param {RequestInit & { method?: string }} [options]
 * @returns {Promise<T>}
 */
const del = (endpoint, options) =>
  request(endpoint, { ...options, method: 'DELETE' })

export const api = { get, post, put, delete: del }