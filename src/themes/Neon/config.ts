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
  animation: {
    transitionDuration: 250, // Faster transitions for energetic feel
  },
  sounds: {
    buttonClick: 'button-click.mp3',
    shopPurchase: 'shop-purchase.mp3',
    screenTransition: 'screen-transition.mp3',
    returnToPreDraw: 'return-to-predraw.mp3',
    handScoring: {
      'royal-flush': 'royal-flush.mp3',
      'straight-flush': 'straight-flush.mp3',
      'four-of-a-kind': 'four-of-a-kind.mp3',
      'full-house': 'full-house.mp3',
      flush: 'flush.mp3',
      straight: 'straight.mp3',
      'three-of-a-kind': 'three-of-a-kind.mp3',
      'two-pair': 'two-pair.mp3',
      'one-pair': 'one-pair.mp3',
    },
  },
  music: {
    backgroundMusic: 'background-music.mp3',
  },
};
