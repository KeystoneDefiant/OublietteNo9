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
  animation: {
    transitionDuration: 300, // 300ms fade in/out for screen transitions
  },
  sounds: {
    buttonClick: 'button-click.ogg',
    shopPurchase: 'shop-purchase.ogg',
    screenTransition: 'screen-transition.ogg',
    returnToPreDraw: 'return-to-predraw.ogg',
    handScoring: {
      'royal-flush': 'royalflush.ogg',
      'straight-flush': 'straightflush.ogg',
      'four-of-a-kind': 'fourofakind.ogg',
      'full-house': 'fullhouse.ogg',
      flush: 'flush.ogg',
      straight: 'straight.ogg',
      'three-of-a-kind': 'threeofakind.ogg',
      'two-pair': 'twopair.ogg',
      'one-pair': 'onepair.ogg',
    },
  },
  music: {
    backgroundMusic: 'bgm1.mp3',
  },
};
