import { ThemeConfig } from '../../types/index';

/**
 * Classic Theme Configuration
 * Background animations are loaded from background.html and background.css files
 */
export const bokehThemeConfig: ThemeConfig = {
  name: 'Bokeh',
  displayName: 'Bokeh',
  description: 'A bokeh-themed poker theme with soft focus effects',
  backgroundAnimation: {
    fromFiles: true, // Load HTML and CSS from separate files
  },
};
