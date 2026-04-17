/**
 * Formats an ISO timestamp into a human-readable string.
 */
export function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString();
}

/**
 * Constructs the full API URL for a given path.
 */
export function apiUrl(path: string, base = "http://localhost:3001"): string {
  return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

/**
 * Returns true if the value is a non-empty string.
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
