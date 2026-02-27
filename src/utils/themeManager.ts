import { ThemeConfig } from '../types/index';
import { logger } from './logger';

const THEME_CONFIG_CACHE: Map<string, ThemeConfig | null> = new Map();

/** Classic is the only theme; theme selection is disabled. */
const ACTIVE_THEME = 'Classic';

/**
 * Get the active theme (always Classic).
 * Theme selection is disabled; this is kept for compatibility with existing theme loading logic.
 */
export function getSelectedTheme(): string {
  return ACTIVE_THEME;
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
        logger.warn(`Failed to load background files for ${themeName}: ${fileError}`);
      }
    }

    // Cache the result
    THEME_CONFIG_CACHE.set(themeName, themeConfig);
    return themeConfig;
  } catch (error) {
    logger.warn(`Failed to load theme config for ${themeName}: ${error}`);
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
