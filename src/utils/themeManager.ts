const THEME_STORAGE_KEY = 'pokerthing-selected-theme';
const DEFAULT_THEME = 'Classic';

/**
 * Get available themes from the themes directory
 * For now, returns a hardcoded list. In production, this could scan the directory.
 */
export function getAvailableThemes(): string[] {
  // Themes will be discovered from src/themes directory
  // For now, return the default theme
  return [DEFAULT_THEME];
}

/**
 * Get the currently selected theme from localStorage
 */
export function getSelectedTheme(): string {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME;
  }
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored || DEFAULT_THEME;
}

/**
 * Save the selected theme to localStorage
 */
export function saveSelectedTheme(themeName: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(THEME_STORAGE_KEY, themeName);
}

/**
 * Apply theme class to body element
 */
export function applyThemeToBody(themeName: string): void {
  if (typeof document === 'undefined') {
    return;
  }
  
  // Remove all theme classes
  const body = document.body;
  const themeClasses = Array.from(body.classList).filter(cls => cls.startsWith('theme-'));
  themeClasses.forEach(cls => body.classList.remove(cls));
  
  // Add new theme class
  body.classList.add(`theme-${themeName.toLowerCase()}`);
}

/**
 * Initialize theme on app load
 */
export function initializeTheme(): void {
  const theme = getSelectedTheme();
  applyThemeToBody(theme);
}
