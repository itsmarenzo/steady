/**
 * Μικρό wrapper πάνω από το localStorage.
 * Ό,τι κι αν πάει στραβά (private browsing, γεμάτος χώρος, SSR) απλά
 * αγνοείται — ποτέ δεν πρέπει να ρίξει την εφαρμογή.
 */

export function loadState<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<T>;
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
}

export function saveState<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // αγνοούμε: π.χ. quota exceeded ή αποκλεισμένο storage
  }
}

export function clearState(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // αγνοούμε
  }
}
