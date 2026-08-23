/*
 * localStorage throws outright in Safari's private mode rather than merely
 * returning null, and it is unavailable when a browser blocks third-party
 * storage in a frame. Nothing kept here is worth losing the site over, so
 * every access is guarded and every read is validated before use.
 */

export function readJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

export function writeJSON(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* Not remembering is survivable; throwing here is not. */
  }
}

export function readString(key, allowed) {
  try {
    const value = window.localStorage.getItem(key)
    return allowed.includes(value) ? value : null
  } catch {
    return null
  }
}

export function writeString(key, value) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    /* See above. */
  }
}
