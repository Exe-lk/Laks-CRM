const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; 
const SESSION_EXPIRY_KEY = "sessionExpiry";

const SESSION_STORAGE_KEYS = [
  "token",
  "refresh_token",
  "sessionExpiry",
  "profile",
  "locumId",
  "practiceId",
  "branchId",
  "user_id",
];

export const setSessionExpiry = (
  durationMs: number = SESSION_DURATION_MS
): void => {
  if (typeof window === "undefined") return;

  const expiresAt = Date.now() + durationMs;
  window.localStorage.setItem(SESSION_EXPIRY_KEY, expiresAt.toString());
};

export const getSessionExpiry = (): number | null => {
  if (typeof window === "undefined") return null;

  const stored = window.localStorage.getItem(SESSION_EXPIRY_KEY);
  if (!stored) return null;

  const parsed = Number.parseInt(stored, 10);
  return Number.isFinite(parsed) ? parsed : null;
};

export const clearSessionStorage = (): void => {
  if (typeof window === "undefined") return;

  for (const key of SESSION_STORAGE_KEYS) {
    window.localStorage.removeItem(key);
  }
};

export const hasSessionExpired = (): boolean => {
  const expiry = getSessionExpiry();
  if (!expiry) return true;
  return Date.now() >= expiry;
};

export const SESSION_CONSTANTS = {
  SESSION_DURATION_MS,
  SESSION_EXPIRY_KEY,
};


