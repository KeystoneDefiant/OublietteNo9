# Theme Animation System Guide

This guide covers all animation systems in Pokerthing: background animations, screen transitions, hand evaluations, and audio integration.

## Overview

Pokerthing features a comprehensive animation system with three layers:

1. **Background Animations**: Custom animated backgrounds per theme (persistent during gameplay)
2. **Screen Transitions**: Fade in/out effects when moving between screens (theme-configurable timing)
3. **Hand Evaluations**: 1.25s floating card animations during poker hand scoring (fixed duration)
4. **Audio Integration**: Optional sound effects and music tied to animations (future implementation)

## Theme Animation Configuration

Each theme's `config.ts` exports comprehensive animation and audio settings:

```typescript
export const classicThemeConfig: ThemeConfig = {
  name: 'Classic',
  displayName: 'Classic',
  backgroundAnimation: {
    fromFiles: true, // Load from background.html and background.css
  },
  // Transition timing (milliseconds)
  animation: {
    transitionDuration: 300, // Screen fade duration
  },
  // Optional sound effects (graceful silence if missing)
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
  // Optional background music
  music: {
    backgroundMusic: 'background-music.mp3',
  },
};
```

## 1. Background Animation System

Background animations are persistent, theme-specific animated backgrounds that appear behind all game content.

### Two Approaches

#### Approach A: File-Based (Recommended)

Store animation HTML and CSS in separate files:

**src/themes/MyTheme/background.html:**

```html
<div class="my-theme-bg-main"></div>
<div class="my-theme-bg-accent"></div>
```

**src/themes/MyTheme/background.css:**

```css
.my-theme-bg-main {
  position: fixed;
  inset: 0;
  z-index: -10;
  background: linear-gradient(45deg, #1a1a2e, #16213e);
  background-size: 400% 400%;
  animation: myGradient 15s ease infinite;
}

@keyframes myGradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
```

**config.ts:**

```typescript
backgroundAnimation: {
  fromFiles: true,
}
```

#### Approach B: Inline (for simple themes)

```typescript
backgroundAnimation: {
  html: `<div class="my-theme-bg"></div>`,
  css: `.my-theme-bg { position: fixed; inset: 0; z-index: -10; background: linear-gradient(45deg, #1a1a2e, #16213e); }`,
}
```

### Z-Index Guidelines

- `-10` or lower: Main background layer
- `-9` or lower: Accent/pattern layers
- `0` or positive: All content stays on top

### Best Practices

- Use CSS transforms and opacity for smooth performance
- Keep animations infinite and looping
- Avoid layout changes that trigger reflow
- Test across different screen sizes

## 2. Screen Transition Animations

Screen transitions are fade in/out effects applied when the app changes between screens (Menu → Game, PreDraw → GameTable → Results → Shop, etc.).

### Timing Configuration

Each theme sets its own transition duration to match its personality:

```typescript
// Fast, energetic transitions (Neon)
animation: {
  transitionDuration: 250;
}

// Standard, balanced transitions (Classic)
animation: {
  transitionDuration: 300;
}

// Slow, elegant transitions (Bokeh)
animation: {
  transitionDuration: 350;
}
```

### CSS Animations

Located in `src/styles/screen-transitions.css`:

```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

.screen-enter {
  animation: fadeIn var(--transition-duration, 300ms) ease-in-out forwards;
}
```

### How It Works

1. **App Initialization**: App.tsx loads theme config and extracts `animation.transitionDuration`
2. **CSS Variable**: Duration is set as `--transition-duration` CSS custom property
3. **Screen Changes**: React conditional rendering applies fade effects via CSS classes
4. **Automatic**: No component-level animation code needed; CSS handles timing

### Timing Guidelines

- **250ms**: Neon (fast, snappy, energetic)
- **300ms**: Classic (standard, balanced)
- **350ms**: Bokeh (slow, elegant, luxurious)

Never use:

- Faster than 200ms: Feels jarring
- Slower than 500ms: Feels sluggish

## 3. Hand Evaluation Animations

Hand evaluations display parallel poker hands with a 1.25-second floating card animation, independent of theme transition timing.

### Component: screen-ParallelHandsAnimation

Located in `src/components/screen-ParallelHandsAnimation.tsx`:

```typescript
<ParallelHandsAnimation
  parallelHands={state.parallelHands}
  rewardTable={state.rewardTable}
  selectedHandCount={state.selectedHandCount}
  onAnimationComplete={moveToNextScreen}
/>
```

### Animation Details

- **Duration**: 1.25 seconds (fixed, independent of theme)
- **Effect**: Cards float upward with fade-out
- **Stagger**: Each hand has increasing delay for sequential reveal
  - Hand 1: 0ms
  - Hand 2: 100ms
  - Hand 3: 200ms
  - etc.

### CSS: screen-ParallelHandsAnimation.css

```css
@keyframes floatUp {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh);
    opacity: 0;
  }
}

.floating-hand {
  animation: floatUp 1.25s ease-out forwards;
}
```

## 4. Audio Integration (Future)

The theme system is prepared for audio integration, though audio hooks are not yet implemented.

### Sound Events

Each theme can provide optional sound files for these events:

```typescript
sounds: {
  // UI interactions
  buttonClick: 'button-click.mp3',
  shopPurchase: 'shop-purchase.mp3',
  screenTransition: 'screen-transition.mp3',

  // Game flow
  returnToPreDraw: 'return-to-predraw.mp3',

  // Hand evaluation (per hand rank)
  handScoring: {
    'royal-flush': 'royal-flush.mp3',
    'straight-flush': 'straight-flush.mp3',
    'four-of-a-kind': 'four-of-a-kind.mp3',
    'full-house': 'full-house.mp3',
    'flush': 'flush.mp3',
    'straight': 'straight.mp3',
    'three-of-a-kind': 'three-of-a-kind.mp3',
    'two-pair': 'two-pair.mp3',
    'one-pair': 'one-pair.mp3',
  },
}
```

### Background Music

```typescript
music: {
  backgroundMusic: 'background-music.mp3', // Loops during gameplay
}
```

### Implementation Notes

- Audio files are relative to `src/themes/[ThemeName]/sounds/` directory
- Missing files result in graceful silence (no errors)
- Timing synchronized with `animation.transitionDuration` for screen transitions
- Volume controls managed by future `useThemeAudio` hook
- Background music loops indefinitely until game end

## Creating a Custom Theme with Full Animation Support

### Step 1: Directory Structure

```
src/themes/MyTheme/
├── background.html       # Background animation HTML
├── background.css        # Background animation styles
├── theme.scss            # Theme colors and styling
├── config.ts             # Theme configuration (animation, audio)
└── sounds/               # Optional audio files (future)
    ├── button-click.mp3
    ├── screen-transition.mp3
    ├── hand-scoring/
    │   ├── royal-flush.mp3
    │   └── ...
    └── background-music.mp3
```

### Step 2: Create config.ts

```typescript
import { ThemeConfig } from '../../types/index';

export const myThemeConfig: ThemeConfig = {
  name: 'MyTheme',
  displayName: 'My Custom Theme',
  description: 'A beautifully animated custom theme',

  // Background animation
  backgroundAnimation: {
    fromFiles: true,
  },

  // Screen transition timing (match your theme's personality)
  animation: {
    transitionDuration: 300, // Adjust for your theme
  },

  // Optional sound effects
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

  // Optional background music
  music: {
    backgroundMusic: 'background-music.mp3',
  },
};
```

### Step 3: Create background.html

```html
<div class="my-theme-bg-stars"></div>
<div class="my-theme-bg-glow"></div>
```

### Step 4: Create background.css

```css
.my-theme-bg-stars {
  position: fixed;
  inset: 0;
  z-index: -10;
  background: /* your starfield or pattern */;
  animation: myAnimation 10s ease infinite;
}

.my-theme-bg-glow {
  position: fixed;
  inset: 0;
  z-index: -9;
  background: radial-gradient(...);
  animation: glow 5s ease-in-out infinite;
}

@keyframes myAnimation {
  /* your animation */
}

@keyframes glow {
  /* your animation */
}
```

### Step 5: Create theme.scss

Define your theme's colors and styles for cards, buttons, text, etc.

### Step 6: Register Theme

**Note:** Theme selection is currently disabled. Classic is the only active theme. The steps below are for future reference if theme selection is re-enabled.

To add a new theme when selection is enabled, you would register it in `themeManager.ts` (e.g. via `getAvailableThemes()`).

### Step 7: Test

Launch the game to verify (theme selection is disabled; only Classic is used):

- Background animates smoothly
- Screen transitions use your specified timing
- All colors and styling apply correctly

## Files Reference

| File                                               | Purpose                                        |
| -------------------------------------------------- | ---------------------------------------------- |
| `src/themes/[ThemeName]/config.ts`                 | Theme configuration (animations, audio, music) |
| `src/themes/[ThemeName]/background.html`           | Background animation HTML                      |
| `src/themes/[ThemeName]/background.css`            | Background animation styles                    |
| `src/themes/[ThemeName]/theme.scss`                | Theme colors and component styling             |
| `src/styles/screen-transitions.css`                | Screen transition fade animations              |
| `src/components/screen-ParallelHandsAnimation.css` | Hand evaluation animations                     |
| `src/App.tsx`                                      | Loads theme config and sets CSS variables      |
| `src/hooks/useThemeBackgroundAnimation.ts`         | Injects/removes background HTML and CSS        |

## Testing Animations

### Background Animations

1. Launch game with a theme
2. Verify background animates smoothly
3. Switch themes and confirm old background is removed
4. Test on different screen sizes

### Screen Transitions

1. Navigate: Menu → Game → Shop → Results → Menu
2. Verify fade effects match theme timing:
   - Neon: Fast (250ms)
   - Classic: Standard (300ms)
   - Bokeh: Slow (350ms)

### Hand Evaluations

1. Play until hand evaluation
2. Observe 1.25s floating animation
3. Verify cards fade out and disappear
4. Confirm transition to Results after animation

## Common Issues and Solutions

| Issue                      | Solution                                          |
| -------------------------- | ------------------------------------------------- |
| Background doesn't animate | Check z-index values (use -10, -9) and file paths |
| Transitions feel janky     | Verify `transitionDuration` is 250-350ms          |
| Hand animation cuts off    | Check screen-ParallelHandsAnimation.css keyframes |
| Theme colors don't apply   | Verify theme.scss is imported in themeManager     |
| Audio not playing (future) | Check file paths relative to `sounds/` directory  |

## Related Documentation

- **Animation Types**: Fade transitions (screen), float-up (hands), gradient loops (background)
- **Theme System**: [Theme System Implementation Guide](./THEME_SYSTEM_IMPLEMENTATION.md)
- **Components**: screen-ParallelHandsAnimation, App.tsx, themeManager utility
- **Configuration**: themes/[ThemeName]/config.ts
