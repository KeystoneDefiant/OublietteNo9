# Theme Audio System Implementation Guide

This document describes how to integrate audio into Pokerthing themes, including sound effects and background music.

## Overview

The audio system allows themes to provide:

- **Sound effects** for UI interactions and game events (graceful silence if missing)
- **Background music** that loops during gameplay
- **Per-hand audio** for poker hand evaluations
- **Volume control** managed centrally

Audio files are optional - missing files result in silent operation without errors.

## Audio Hook: `useThemeAudio()`

The `useThemeAudio()` hook (located in `src/hooks/useThemeAudio.ts`) manages all audio playback.

### Basic Usage

```typescript
import { useThemeAudio } from '../hooks/useThemeAudio';

export function MyComponent() {
  const { playSound, playMusic, stopMusic, setVolume, stopAll } = useThemeAudio();

  // Play a sound effect
  const handleButtonClick = () => {
    playSound('buttonClick');
  };

  // Play background music
  const startGame = () => {
    playMusic();
  };

  // Stop music
  const endGame = () => {
    stopMusic();
  };

  return (
    <button onClick={handleButtonClick}>Click me</button>
  );
}
```

### API Reference

#### `playSound(event: SoundEvent, handRank?: HandRank): void`

Play a sound effect for a game event.

**Parameters:**

- `event`: Type of event ('buttonClick', 'shopPurchase', 'screenTransition', 'returnToPreDraw')
- `handRank`: (Optional) Poker hand rank for hand evaluation sounds

**Examples:**

```typescript
// UI interaction
playSound('buttonClick');
playSound('shopPurchase');

// Game flow
playSound('screenTransition');
playSound('returnToPreDraw');

// Hand evaluation
playSound('buttonClick');
playSound('shopPurchase', 'royal-flush');
playSound('shopPurchase', 'full-house');
```

#### `playMusic(): void`

Start playing background music. Music loops indefinitely.

```typescript
playMusic(); // Starts background music from theme config
```

#### `stopMusic(): void`

Stop background music and reset playback position.

```typescript
stopMusic();
```

#### `setVolume(volume: number): void`

Set volume for all audio (sound effects and music).

**Parameters:**

- `volume`: Number from 0.0 (silent) to 1.0 (full volume)

```typescript
setVolume(0.5); // 50% volume
setVolume(0.0); // Mute
setVolume(1.0); // Full volume
```

#### `stopAll(): void`

Stop all audio (sound effects and background music).

```typescript
stopAll();
```

## Theme Audio Configuration

Each theme specifies audio in its `config.ts` file:

```typescript
export const classicThemeConfig: ThemeConfig = {
  name: 'Classic',
  displayName: 'Classic',

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
```

### File Organization

Audio files for each theme are stored relative to the theme directory:

```
src/themes/Classic/
├── theme.scss
├── config.ts
├── background.html
├── background.css
└── sounds/
    ├── button-click.mp3
    ├── shop-purchase.mp3
    ├── screen-transition.mp3
    ├── return-to-predraw.mp3
    ├── background-music.mp3
    └── hand-scoring/
        ├── royal-flush.mp3
        ├── straight-flush.mp3
        ├── four-of-a-kind.mp3
        ├── full-house.mp3
        ├── flush.mp3
        ├── straight.mp3
        ├── three-of-a-kind.mp3
        ├── two-pair.mp3
        └── one-pair.mp3
```

## Sound Events Reference

### UI Sound Events

| Event          | When Played                    | Purpose                      |
| -------------- | ------------------------------ | ---------------------------- |
| `buttonClick`  | User clicks UI buttons         | Confirm user interaction     |
| `shopPurchase` | User completes a shop purchase | Reward feedback for purchase |

### Game Flow Sound Events

| Event              | When Played                  | Purpose                      |
| ------------------ | ---------------------------- | ---------------------------- |
| `screenTransition` | Screen fades between changes | Transition notification      |
| `returnToPreDraw`  | Return to pre-draw screen    | Screen entrance notification |

### Hand Evaluation Sound Events

| Event                    | When Played             | Purpose                                                             |
| ------------------------ | ----------------------- | ------------------------------------------------------------------- |
| `handScoring[hand-rank]` | After hand is evaluated | Per-hand celebration (e.g., "Congratulations on your Royal Flush!") |

## Component Integration Examples

### Shop Component

```typescript
// src/components/Shop.tsx
import { useThemeAudio } from '../hooks/useThemeAudio';

export function Shop({ ... }) {
  const { playSound } = useThemeAudio();

  const handlePurchase = (callback: () => void) => {
    playSound('shopPurchase');
    callback();
  };

  return (
    <button onClick={() => handlePurchase(() => onUpgradeHandCount(cost))}>
      Buy Hand
    </button>
  );
}
```

### Screen Entry/Exit

```typescript
// src/components/screen-PreDraw.tsx
import { useThemeAudio } from '../hooks/useThemeAudio';
import { useEffect } from 'react';

export function PreDraw({ ... }) {
  const { playSound } = useThemeAudio();

  useEffect(() => {
    // Play sound when entering this screen
    playSound('returnToPreDraw');
  }, [playSound]);

  return (
    // component JSX
  );
}
```

### Hand Scoring

```typescript
// src/components/screen-ParallelHandsAnimation.tsx
import { useThemeAudio } from '../hooks/useThemeAudio';

export function ParallelHandsAnimation({ parallelHands, ... }) {
  const { playSound } = useThemeAudio();

  // When evaluating hands
  parallelHands.forEach((hand) => {
    const rank = evaluateHand(hand);
    playSound('buttonClick', rank);
  });

  return (
    // component JSX
  );
}
```

### Screen Transitions in App

```typescript
// src/App.tsx
import { useThemeAudio } from './hooks/useThemeAudio';

export default function App() {
  const { playSound } = useThemeAudio();
  const { state } = useGameState();

  // Track previous screen
  const prevScreenRef = useRef(state.screen);

  useEffect(() => {
    if (prevScreenRef.current !== state.screen) {
      playSound('screenTransition');
      prevScreenRef.current = state.screen;
    }
  }, [state.screen, playSound]);

  return (
    // app JSX
  );
}
```

### Background Music Lifecycle

```typescript
// src/App.tsx
import { useThemeAudio } from './hooks/useThemeAudio';

export default function App() {
  const { playMusic, stopMusic } = useThemeAudio();

  useEffect(() => {
    if (state.screen === 'game') {
      // Start music when entering game
      playMusic();
    } else {
      // Stop music when leaving game
      stopMusic();
    }
  }, [state.screen, playMusic, stopMusic]);

  return (
    // app JSX
  );
}
```

## Graceful Audio Fallback

The audio system is designed to handle missing audio files gracefully:

```typescript
// If a sound file is missing or fails to load:
// 1. The hook logs no error
// 2. The game continues normally
// 3. Users hear silence instead of an error

// This is intentional - themes are optional
// If a theme doesn't provide sounds, the game just plays silently
```

### Checking Audio Support

If you need to know whether audio is available:

```typescript
const config = await loadThemeConfig(getSelectedTheme());
const hasAudio = !!(config?.sounds || config?.music);

if (hasAudio) {
  console.log('Audio is configured');
} else {
  console.log('Theme has no audio');
}
```

## Creating a Theme with Audio

### Step 1: Create sounds directory

```bash
mkdir -p src/themes/MyTheme/sounds/hand-scoring
```

### Step 2: Add audio files

Place audio files (.mp3, .wav, .ogg) in the sounds directory:

- `button-click.mp3`
- `shop-purchase.mp3`
- `screen-transition.mp3`
- `return-to-predraw.mp3`
- `background-music.mp3`
- `hand-scoring/royal-flush.mp3`
- etc.

### Step 3: Configure in config.ts

```typescript
export const myThemeConfig: ThemeConfig = {
  name: 'MyTheme',
  displayName: 'My Theme',

  sounds: {
    buttonClick: 'button-click.mp3',
    shopPurchase: 'shop-purchase.mp3',
    screenTransition: 'screen-transition.mp3',
    returnToPreDraw: 'return-to-predraw.mp3',
    handScoring: {
      'royal-flush': 'hand-scoring/royal-flush.mp3',
      'straight-flush': 'hand-scoring/straight-flush.mp3',
      // ... other ranks
    },
  },

  music: {
    backgroundMusic: 'background-music.mp3',
  },
};
```

### Step 4: Use in components

Import `useThemeAudio` and call `playSound()` at appropriate times.

## Audio Best Practices

1. **Keep sound effects short** (< 1 second)
   - Reduce file sizes
   - Avoid blocking user interaction
   - Example: 0.3-0.5 second click sounds

2. **Use consistent volume levels**
   - All sound effects at similar loudness
   - Background music slightly quieter (70% of effects volume)
   - Prevents jarring transitions

3. **Match theme personality**
   - Classic: Subtle, polished sounds
   - Bokeh: Soft, elegant sounds
   - Neon: Energetic, synthesized sounds

4. **Optimize audio files**
   - Use MP3 format (best browser compatibility)
   - Compress to reduce bundle size
   - Typical: 50-200KB per sound

5. **Test audio playback**
   - Verify all sounds play correctly
   - Test on different browsers
   - Test with audio muted/disabled
   - Test volume adjustments

## Debugging Audio Issues

### Audio doesn't play

1. Check file paths in `config.ts`
   - Files must be relative to theme/sounds/ directory
   - Example: `button-click.mp3` → `/sounds/Classic/button-click.mp3`

2. Check browser console for errors
   - Missing files produce no error (graceful fallback)
   - Network errors may show in Network tab

3. Verify audio files exist

   ```bash
   ls src/themes/Classic/sounds/
   ```

4. Check theme config is loaded
   ```typescript
   const config = await loadThemeConfig('Classic');
   console.log(config.sounds);
   ```

### Audio plays too quietly/loudly

1. Adjust volume via `setVolume()`
2. Check audio file gain levels
3. Verify browser volume isn't muted

### Audio loops incorrectly

Background music loops via `audio.loop = true`. Ensure audio file:

- Doesn't have silence at start/end
- Loops seamlessly (fade out/in at boundaries)
- Is encoded correctly (MP3 gapless meta-information)

## Technical Details

### Audio Playback Architecture

```
useThemeAudio Hook
├── Loads theme config on mount
├── Manages audio instances
│   ├── Sound effects (Map<key, Audio>)
│   └── Background music (single Audio)
├── Provides playback methods
│   ├── playSound(event, handRank?)
│   ├── playMusic()
│   ├── stopMusic()
│   ├── setVolume()
│   └── stopAll()
└── Handles graceful fallback for missing files
```

### Audio Instance Management

- Sound effects are cached per event type
- Reusing audio instances improves performance
- Multiple sounds of same type reuse same instance
- Background music is a single persistent instance

### Error Handling

All audio operations are wrapped in try/catch:

```typescript
try {
  audio.play();
} catch {
  // Gracefully handle errors (missing files, disabled audio, etc.)
}
```

## Related Files

- **Hook**: `src/hooks/useThemeAudio.ts`
- **Theme config**: `src/themes/[ThemeName]/config.ts`
- **Types**: `src/types/index.ts` (ThemeSoundConfig, ThemeMusicConfig)
- **Theme manager**: `src/utils/themeManager.ts`
