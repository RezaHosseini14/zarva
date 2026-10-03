const STORAGE_KEY = 'zarva.clientDeviceId';

export function getOrCreateClientDeviceId(): string {
  if (typeof window === 'undefined') {
    return 'server';
  }
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing && existing.length >= 8) return existing;
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    return `fallback-${Date.now()}`;
  }
}
