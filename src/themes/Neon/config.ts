import { ThemeConfig } from '../../types/index';

/**
 * Neon Cyberpunk Theme Configuration
 * A vibrant neon-inspired theme with dynamic color shifts and cyberpunk aesthetic
 * Background animations are loaded from background.html and background.css files
 */
export const neonThemeConfig: ThemeConfig = {
  name: 'Neon',
  displayName: 'Neon',
  description: 'A vibrant cyberpunk theme with neon glows and dynamic animations',
  backgroundAnimation: {
    fromFiles: true, // Load HTML and CSS from separate files
  },
};
