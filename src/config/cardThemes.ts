/**
 * Card theme configuration.
 * Defines light (traditional white cards) and dark (moody casino) styles.
 */

export type CardThemeId = 'light' | 'dark';

export const CARD_THEME_STORAGE_KEY = 'cardTheme';

export const CARD_THEMES: { id: CardThemeId; label: string; description: string }[] = [
  { id: 'light', label: 'Light', description: 'White cards, traditional red and black suits' },
  { id: 'dark', label: 'Dark', description: 'Dark cards with red and light suit text' },
];

export function getStoredCardTheme(): CardThemeId {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem(CARD_THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return 'dark';
}

export function setStoredCardTheme(theme: CardThemeId): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CARD_THEME_STORAGE_KEY, theme);
}
