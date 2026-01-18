import { ThemeConfig } from '../../types/index';

/**
 * Classic Theme Configuration
 * Background animations are loaded from background.html and background.css files
 */
export const classicThemeConfig: ThemeConfig = {
  name: 'Classic',
  displayName: 'Classic',
  description: 'A classic poker theme with vibrant gradients and patterns',
  backgroundAnimation: {
    fromFiles: true, // Load HTML and CSS from separate files
  },
};
