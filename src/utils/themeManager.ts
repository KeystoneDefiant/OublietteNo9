import { ThemeConfig } from '../types/index';

const THEME_STORAGE_KEY = 'pokerthing-selected-theme';
const DEFAULT_THEME = 'Classic';
const THEME_CONFIG_CACHE: Map<string, ThemeConfig | null> = new Map();
let AVAILABLE_THEMES: string[] | null = null;

/**
 * Automatically discover available themes by scanning the themes directory
 * Uses Vite's import.meta.glob to find all config.ts files
 */
async function discoverThemes(): Promise<string[]> {
  if (AVAILABLE_THEMES !== null) {
    return AVAILABLE_THEMES;
  }

  try {
    // Use Vite's glob to find all theme config files
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const configModules = (import.meta as any).glob('../themes/*/config.ts') as Record<
      string,
      () => Promise<unknown>
    >;
    const themes: string[] = [];

    // Extract theme names from the module paths
    for (const path of Object.keys(configModules)) {
      // Path format: '../themes/ThemeName/config.ts'
      const match = path.match(/\.\.\/themes\/([^/]+)\/config\.ts/);
      if (match && match[1]) {
        themes.push(match[1]);
      }
    }

    // Sort themes alphabetically, with Classic first if present
    themes.sort((a, b) => {
      if (a === DEFAULT_THEME) return -1;
      if (b === DEFAULT_THEME) return 1;
      return a.localeCompare(b);
    });

    AVAILABLE_THEMES = themes.length > 0 ? themes : [DEFAULT_THEME];
    return AVAILABLE_THEMES;
  } catch (error) {
    console.warn('Failed to discover themes:', error);
    AVAILABLE_THEMES = [DEFAULT_THEME];
    return AVAILABLE_THEMES;
  }
}

/**
 * Get available themes from the themes directory
 * Automatically discovers all themes on first call
 */
export async function getAvailableThemes(): Promise<string[]> {
  return discoverThemes();
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
  const themeClasses = Array.from(body.classList).filter((cls) => cls.startsWith('theme-'));
  themeClasses.forEach((cls) => body.classList.remove(cls));

  // Add new theme class
  body.classList.add(`theme-${themeName.toLowerCase()}`);
}

/**
 * Load theme configuration from theme module
 * Returns cached config if already loaded
 * If theme uses fromFiles flag, loads background.html and background.css from theme directory
 */
export async function loadThemeConfig(themeName: string): Promise<ThemeConfig | null> {
  // Check cache first
  if (THEME_CONFIG_CACHE.has(themeName)) {
    return THEME_CONFIG_CACHE.get(themeName) || null;
  }

  try {
    // Dynamically import theme config based on theme name
    const themeDir = themeName.charAt(0).toUpperCase() + themeName.slice(1).toLowerCase();
    const config = await import(`../themes/${themeDir}/config.ts`);

    // Find the exported config (e.g., classicThemeConfig)
    let themeConfig: ThemeConfig | null = null;
    for (const value of Object.values(config)) {
      if (typeof value === 'object' && value !== null && 'name' in value) {
        themeConfig = value as ThemeConfig;
        break;
      }
    }

    // If theme uses external files for background animation, load them
    if (themeConfig?.backgroundAnimation?.fromFiles) {
      try {
        // Dynamically import raw files using Vite's raw import
        const htmlModule = await import(`../themes/${themeDir}/background.html?raw`);
        const cssModule = await import(`../themes/${themeDir}/background.css?raw`);

        // Replace fromFiles flag with actual content
        themeConfig.backgroundAnimation = {
          html: htmlModule.default,
          css: cssModule.default,
        };
      } catch (fileError) {
        console.warn(`Failed to load background files for ${themeName}:`, fileError);
      }
    }

    // Cache the result
    THEME_CONFIG_CACHE.set(themeName, themeConfig);
    return themeConfig;
  } catch (error) {
    console.warn(`Failed to load theme config for ${themeName}:`, error);
    THEME_CONFIG_CACHE.set(themeName, null);
    return null;
  }
}

/**
 * Initialize theme on app load
 */
export function initializeTheme(): void {
  const theme = getSelectedTheme();
  applyThemeToBody(theme);
}
