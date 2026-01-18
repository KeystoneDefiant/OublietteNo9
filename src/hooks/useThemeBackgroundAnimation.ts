import { useEffect } from 'react';
import { ThemeConfig } from '../types/index';

const THEME_BG_CONTAINER_ID = 'theme-bg-container';
const THEME_BG_STYLES_ID = 'theme-bg-styles';

/**
 * Hook to inject and manage theme-specific background animations
 * Handles HTML and CSS injection/removal as theme changes
 */
export function useThemeBackgroundAnimation(themeConfig: ThemeConfig | null) {
  useEffect(() => {
    if (!themeConfig?.backgroundAnimation) {
      removeThemeBackground();
      return;
    }

    applyThemeBackground(themeConfig.backgroundAnimation);

    return () => {
      // Cleanup is handled by removeThemeBackground on next theme change
    };
  }, [themeConfig]);
}

/**
 * Apply theme background animation by injecting HTML and CSS
 */
function applyThemeBackground(animation: ThemeConfig['backgroundAnimation']) {
  if (!animation || !animation.html || !animation.css) return;

  // Remove existing theme background if present
  removeThemeBackground();

  // Create container for background elements
  const container = document.createElement('div');
  container.id = THEME_BG_CONTAINER_ID;
  container.innerHTML = animation.html;
  document.body.insertBefore(container, document.body.firstChild);

  // Inject CSS styles
  const style = document.createElement('style');
  style.id = THEME_BG_STYLES_ID;
  style.textContent = animation.css;
  document.head.appendChild(style);
}

/**
 * Remove theme background animation
 */
function removeThemeBackground() {
  const container = document.getElementById(THEME_BG_CONTAINER_ID);
  const styles = document.getElementById(THEME_BG_STYLES_ID);

  if (container) {
    container.remove();
  }
  if (styles) {
    styles.remove();
  }
}
