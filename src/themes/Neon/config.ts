import { ThemeConfig } from '../../types/index';

/**
 * Example: Neon Theme Configuration
 * This demonstrates how to create a theme with a more vibrant background animation
 * To use this, create the Neon directory and import this config in getAvailableThemes()
 */
export const neonThemeConfig: ThemeConfig = {
  name: 'Neon',
  displayName: 'Neon',
  description: 'A vibrant neon-inspired theme with dynamic color shifts',
  backgroundAnimation: {
    html: `
      <div class="neon-bg-base"></div>
      <div class="neon-bg-accent-1"></div>
      <div class="neon-bg-accent-2"></div>
      <div class="neon-bg-grain"></div>
    `,
    css: `
      .neon-bg-base {
        position: fixed;
        inset: 0;
        z-index: -10;
        background: linear-gradient(135deg, 
          #0a0a2e 0%,
          #16213e 25%,
          #0f3460 50%,
          #16213e 75%,
          #0a0a2e 100%);
        background-size: 400% 400%;
        animation: neonShift 10s ease infinite;
      }
      
      .neon-bg-accent-1 {
        position: fixed;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        z-index: -9;
        background: radial-gradient(circle, rgba(0,255,150,0.1) 0%, transparent 70%);
        animation: neonFloat1 20s ease-in-out infinite;
      }
      
      .neon-bg-accent-2 {
        position: fixed;
        bottom: -50%;
        right: -50%;
        width: 200%;
        height: 200%;
        z-index: -9;
        background: radial-gradient(circle, rgba(255,0,150,0.1) 0%, transparent 70%);
        animation: neonFloat2 25s ease-in-out infinite;
      }
      
      .neon-bg-grain {
        position: fixed;
        inset: 0;
        z-index: -8;
        background-image: 
          repeating-linear-gradient(0deg, 
            rgba(255, 255, 255, 0.05), 
            rgba(255, 255, 255, 0.05) 1px, 
            transparent 1px, 
            transparent 2px);
        background-size: 100% 2px;
        pointer-events: none;
      }
      
      @keyframes neonShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      
      @keyframes neonFloat1 {
        0% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(30px, -30px) scale(1.1); }
        100% { transform: translate(0, 0) scale(1); }
      }
      
      @keyframes neonFloat2 {
        0% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(-40px, 40px) scale(1.15); }
        100% { transform: translate(0, 0) scale(1); }
      }
    `,
  },
};
