'use client';

import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'zarva.display:v1';

interface IDisplayPreferences {
  readonly compactUnits: boolean;
}

const DEFAULTS: IDisplayPreferences = {
  compactUnits: false,
};

let memoryPrefs: IDisplayPreferences = DEFAULTS;
let didHydrate = false;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

function readPreferences(): IDisplayPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<IDisplayPreferences>;
    return {
      compactUnits: Boolean(parsed.compactUnits),
    };
  } catch {
    return DEFAULTS;
  }
}

function writePreferences(prefs: IDisplayPreferences): void {
  memoryPrefs = prefs;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // quota / private mode
  }
  emit();
}

function subscribe(listener: () => void): () => void {
  if (!didHydrate) {
    didHydrate = true;
    memoryPrefs = readPreferences();
  }
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      memoryPrefs = readPreferences();
      emit();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

function getSnapshot(): IDisplayPreferences {
  return memoryPrefs;
}

function getServerSnapshot(): IDisplayPreferences {
  return DEFAULTS;
}

export function useDisplayPreferences() {
  const prefs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setCompactUnits = (compactUnits: boolean) => {
    writePreferences({ ...prefs, compactUnits });
  };

  return {
    compactUnits: prefs.compactUnits,
    setCompactUnits,
  };
}
