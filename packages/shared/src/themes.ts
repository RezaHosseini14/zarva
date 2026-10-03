export const THEME_PRESETS = [
  'zarva-gold',
  'zarva-noir',
  'zarva-emerald',
  'zarva-sapphire',
  'zarva-rose',
  'zarva-copper',
  'zarva-pearl',
  'zarva-obsidian',
  'zarva-amber',
  'zarva-slate',
] as const;

export type ThemePresetId = (typeof THEME_PRESETS)[number];

export const DEFAULT_THEME_PRESET: ThemePresetId = 'zarva-gold';

export function isThemePresetId(value: string): value is ThemePresetId {
  return (THEME_PRESETS as ReadonlyArray<string>).includes(value);
}

export interface IAssignThemeRequest {
  readonly themePreset: ThemePresetId;
  readonly themeTokens?: Record<string, string> | null;
}
