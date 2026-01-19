# Execution Plan: Parallel Poker Roguelike (Oubliette-9)

## Overview

The project has 6 major work areas with 25+ specific tasks covering gameplay fixes, shop restructuring, animation improvements, game configuration, component organization, and theme expansion.

## Core Work Areas

### 1. Critical Gameplay Fixes
- **Redraw Logic with Held Cards**: When player has extra draw feature, held cards must not be included in redraw pool. If holding an ace and redrawing, the ace stays, 4 other cards are discarded, and 4 new cards are drawn.
- **Screen Width Consistency**: Game screen width should remain consistent across all screens. Consider creating a unified game page container that handles current game state, header, and reward table together for easier management and styling.

### 2. Shop System Restructuring

#### Fundamental Changes
- Convert Shop from modal to full-screen component
- Show shop every 5 turns (configurable from gameConfig)
- Display only 3 random options at a time (configurable), weighted by chance values
- Implement dead card limit (default 10, configurable)

#### Shop Items to Add
- **Add 10 Parallel Hands Bundle**: Cost calculated dynamically based on current hand cost
- **Remove Single Dead Card**: 5000 credits base (configurable), increases 10% per use (configurable)
- **Remove All Dead Cards**: Cost = (cost per dead card) × (number of dead cards), increases by number of dead cards per use

#### Shop Items to Remove
- Reward table upgrade
- 2x chance option (remove from shop AND from all game logic)

#### Display Logic
- Single dead card removal option only shows if dead cards exist
- All dead cards removal option only shows if dead cards exist
- Options excluded from random list if they don't apply

### 3. Animation System Enhancements

#### New Parallel Hands Evaluation Screen
- Displays after player holds cards and before Results screen
- Hands float up from bottom of screen with random starting X position
- Each hand shows its score in center
- Hands fade out as they reach top
- Animation duration: 1.25 seconds total (fixed, regardless of hand count)
- Remove animated parallel hands section from current Results screen

#### Screen Transition Animations
- Add fade out/in transitions to all screen changes
- Controlled from theme system (each theme specifies transition behavior)
- Add documentation to THEME_ANIMATION_GUIDE.md

### 4. Game Configuration Enhancement

#### New Game Modes Section
- Define starting conditions (deck contents, hand count, credits, bet)
- Create "Normal Game" mode with current starting values
- Make this framework extensible for future game modes
- gameConfig structure:
  ```typescript
  gameModes: {
    "normalGame": {
      startingCredits: 1000,
      startingBet: 1,
      startingHandCount: 10,
      deckContents: { /* ... */ }
    }
  }
  ```

#### Additional Configurable Values
- Dead card limit (default: 10)
- Shop appearance frequency in turns (default: 5)
- Shop option display count (default: 3)
- Option weighting/chance distribution

### 5. Component Organization

#### Naming Convention
- Prefix all screen container components with "screen-"
- Example: `PreDraw.tsx` → `screen-PreDraw.tsx`
- Update all import/export references in routing logic
- Update component file listing in documentation

### 6. Theme System Expansion

#### Font Importing
- Allow themes to import and specify their own custom fonts
- Currently only Classic theme fonts are loaded globally
- Each theme should independently handle its font assets

#### Sound Events System
Themes should be able to specify audio files for:
- Button Click
- Shop Purchase
- Screen Transition
- Scoring for each unique hand type (Royal Flush, Straight Flush, etc.)
- Returning to Pre-Draw screen

#### Background Music
- Allow themes to specify background music file
- Handle audio playback lifecycle (loop, fade, stop on screen changes)

---

## Implementation Sequence Recommendation

### Phase 1: Core Fixes (Highest Priority)
1. Fix redraw logic with held cards
2. Fix screen width consistency issue
3. Create game page container if needed

### Phase 2: Configuration Foundation
4. Add game modes to gameConfig
5. Add configurability for dead card limit, shop frequency, option count
6. Set up new config structure in gameConfig.ts

### Phase 3: Shop Restructuring
7. Convert Shop from modal to full-screen component
8. Implement shop appearance trigger (every N turns)
9. Implement random option selection with weighting
10. Remove reward table upgrade and 2x chance option logic
11. Add new shop items (dead card removal options, 10-hand bundle)
12. Implement dead card limit enforcement

### Phase 4: Component & Animation Work
13. Rename screen components with "screen-" prefix
14. Create new parallel hands evaluation animation screen
15. Integrate new screen into game flow (after hold, before results)
16. Remove animated parallel hands from Results screen
17. Implement screen transition animations (theme-controlled)

### Phase 5: Theme Enhancements
18. Add font importing capability per theme
19. Add sound event system to theme configuration
20. Add background music support
21. Update THEME_ANIMATION_GUIDE.md with transition documentation

---

## Key Questions Requiring Clarification

### 1. Prioritization
Should we prioritize fixes first, then shop restructuring, then animations? Or tackle animations in parallel since they're somewhat independent?

### 2. Game Modes Scope
Should game modes only adjust:
- Starting values and shop frequency? (narrow scope)
- OR also difficulty scaling, hand evaluation logic, or betting mechanics? (broader scope)

### 3. Shop Configurability
- Should all shop costs, frequencies, and weights be in `gameConfig.ts`?
- Should visual layout aspects be theme-controlled instead?
- Should shop appearance frequency be mode-dependent?

### 4. Dead Card Removal Pricing
- Should each removal option track its own purchase history separately?
- Or share a global counter for all shop action tracking?

### 5. Theme Audio Implementation
- Will audio files live in `public/audio/` alongside images?
- Should themes have fallback audio if a specific sound isn't provided?
- What format/codec for audio files (mp3, ogg, webm)?

### 6. Screen Transitions
- Should transition animations respect theme speed settings?
- Should transitions be skippable via user input?
- Do transitions apply to all screen changes or only specific ones?

---

## Implementation Notes

### Architecture Considerations
- Game state management in `useGameState.ts` will need updates for shop visibility logic, new screen, and mode tracking
- `gameConfig.ts` is the source of truth for all configurable values
- Theme system should control presentation/animation, not game logic
- Maintain immutable state patterns currently in use

### File Changes Expected
- `src/config/gameConfig.ts` - Major expansion
- `src/components/Shop.tsx` - Convert to full-screen, restructure
- `src/components/screen-PreDraw.tsx` - New naming
- `src/components/[other screens]` - All renamed with "screen-" prefix
- `src/components/screen-ParallelHandsAnimation.tsx` - New component
- `src/themes/*/config.ts` - Add audio and animation config
- `src/hooks/useGameState.ts` - Shop logic updates
- `src/styles/animations.css` - Add transition animations
- `README.md` and theme guides - Documentation updates

### Testing Considerations
- Verify redraw doesn't include held cards across all scenarios
- Test screen widths match across all game screens
- Verify shop frequency triggers correctly
- Test animation timing and rendering
- Validate dead card limit enforcement
- Test all new shop items and removal logic
