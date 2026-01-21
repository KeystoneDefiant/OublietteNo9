# Codebase Evaluation for Future AI Agents

**Project**: Parallel Poker Roguelike (Oubliette-9)  
**Last Evaluated**: 2024  
**Tech Stack**: React 18, TypeScript, Vite, Tailwind CSS

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture & Patterns](#architecture--patterns)
3. [File Structure](#file-structure)
4. [Key Components](#key-components)
5. [State Management](#state-management)
6. [Known Issues & Potential Problems](#known-issues--potential-problems)
7. [Code Quality Observations](#code-quality-observations)
8. [Testing Status](#testing-status)
9. [Development Workflow](#development-workflow)
10. [Common Patterns & Conventions](#common-patterns--conventions)
11. [Areas for Improvement](#areas-for-improvement)

---

## Project Overview

A web-first poker game featuring:
- **Parallel Hand Mechanics**: Hold cards and draw multiple parallel hands from fresh decks
- **Roguelike Progression**: Shop system, upgrades, deck modifications
- **Theme System**: Customizable themes with animations and audio
- **Pure Functional Core**: Immutable state management with zero side effects

### Game Flow
1. **Menu** → Start new run
2. **PreDraw** → Set bet amount and hand count
3. **Playing** → Deal hand, hold cards, draw parallel hands
4. **Animation** → Visualize parallel hands results
5. **Results** → Show payouts and earnings
6. **Shop** (periodic) → Purchase upgrades
7. **Game Over** → Return to menu when credits insufficient

---

## Architecture & Patterns

### Core Principles
1. **Immutable State**: All state updates use functional updates (`setState((prev) => ...)`)
2. **Pure Functions**: Utils are pure with no side effects
3. **Custom Hooks**: State logic encapsulated in `useGameState` hook
4. **Component Composition**: Screen-based components with clear separation

### State Management Pattern
- Single source of truth: `useGameState` hook
- All state mutations go through `setState` with functional updates
- State is never mutated directly
- Callbacks wrapped in `useCallback` for performance

### Component Architecture
```
App.tsx (Root)
├── Conditional rendering based on state.screen and state.gamePhase
├── Modal overlays (Credits, Rules, Settings)
└── Screen components:
    ├── MainMenu
    ├── PreDraw
    ├── GameTable
    ├── ParallelHandsAnimation
    ├── Results
    ├── Shop
    └── GameOver
```

---

## File Structure

```
src/
├── components/          # React UI components
│   ├── Card.tsx
│   ├── CardSelector.tsx
│   ├── CheatsModal.tsx
│   ├── Credits.tsx
│   ├── GameHeader.tsx
│   ├── MainMenu.tsx
│   ├── RewardTable.tsx
│   ├── Rules.tsx
│   ├── Settings.tsx
│   ├── Shop.tsx
│   ├── screen-GameOver.tsx
│   ├── screen-GameTable.tsx
│   ├── screen-ParallelHandsAnimation.tsx
│   ├── screen-PreDraw.tsx
│   └── screen-Results.tsx
├── hooks/              # Custom React hooks
│   ├── useGameState.ts          # Main game state management (620 lines)
│   ├── useThemeAudio.ts         # Audio playback
│   ├── useThemeBackgroundAnimation.ts
│   └── AUDIO_INTEGRATION_GUIDE.md
├── utils/              # Pure utility functions
│   ├── config.ts                # Cost calculations
│   ├── deck.ts                  # Deck creation, shuffling
│   ├── parallelHands.ts         # Parallel hand generation
│   ├── pokerEvaluator.ts        # Hand evaluation (784 lines)
│   ├── shopSelection.ts         # Shop option selection
│   └── themeManager.ts          # Theme loading/management
├── types/              # TypeScript type definitions
│   └── index.ts
├── config/             # Game configuration
│   └── gameConfig.ts
├── themes/             # Theme definitions
├── styles/             # Global styles
├── App.tsx            # Root component
└── main.tsx           # Entry point
```

---

## Key Components

### `useGameState` Hook (`src/hooks/useGameState.ts`)
**Purpose**: Centralized game state management

**Key Functions**:
- `dealHand()` - Deal initial 5 cards, deduct bet
- `toggleHold(index)` - Toggle card hold state
- `drawParallelHands()` - Generate parallel hands from held cards
- `startNewRun()` - Initialize new game run
- `endRun()` - Return to menu, preserve run count
- `returnToPreDraw(payout)` - Advance round, apply bet increases
- `addDeadCard()` - Add dead card for credits
- `addWildCard()` - Purchase wild card
- `purchaseExtraDraw()` - Buy extra draw ability
- `addParallelHandsBundle()` - Buy additional parallel hands

**State Structure**: See `GameState` interface in `src/types/index.ts`

**Important Notes**:
- Uses `useCallback` for all exported functions
- State updates are always immutable
- Initial state uses `getCurrentGameMode()` from config
- Shop options generated based on round frequency

### `PokerEvaluator` Class (`src/utils/pokerEvaluator.ts`)
**Purpose**: Evaluate poker hands and determine rank

**Key Methods**:
- `evaluate(hand: Card[])` - Main evaluation entry point
- `evaluateWithWildCards()` - Optimize wild card usage
- `applyRewards()` - Apply reward table multipliers

**Handling**:
- Filters out dead cards before evaluation
- Handles wild cards by trying best possible combinations
- Supports "Jacks or Better" rule (minimum pair rank)
- Returns `HandResult` with rank, score, multiplier, winning cards

**Edge Cases**:
- Handles 0 active cards (all dead) → returns high-card with 0 score
- Wild cards evaluated by trying all possible optimal combinations
- Straight detection includes wheel (A-2-3-4-5)

### `generateParallelHands` (`src/utils/parallelHands.ts`)
**Purpose**: Generate N parallel hands from base hand

**Logic**:
1. For each parallel hand:
   - Create fresh deck (with deck modifications)
   - Remove original 5 cards from deck
   - Shuffle deck (with optional seed for determinism)
   - Replace non-held cards with draws
   - Preserve held cards

**Parameters**:
- `baseHand`: Original 5 cards
- `heldIndices`: Cards to hold (0-4)
- `handCount`: Number of parallel hands
- `deadCards`, `removedCards`, `wildCards`: Deck modifications

---

## State Management

### State Flow
```
INITIAL_STATE (from gameConfig)
  ↓
useGameState hook manages all state
  ↓
State passed to components as props
  ↓
Components call callbacks to update state
  ↓
State updates trigger re-renders
```

### State Update Pattern
```typescript
setState((prev) => {
  // Validate conditions
  if (prev.credits < cost) return prev;
  
  // Return new state object
  return {
    ...prev,
    // Updated fields
  };
});
```

### State Dependencies
- `currentMode` from `gameConfig` initialized at module level
- State updates depend on previous state
- No external state dependencies (no Redux, Context, etc.)

---

## Known Issues & Potential Problems

### 🔴 Critical Issues

1. **Missing `endRun` in destructuring** (FIXED)
   - **Location**: `src/App.tsx:107`
   - **Status**: ✅ Fixed - `endRun` now properly destructured from `useGameState()`
   - **Impact**: Would cause runtime error when clicking "End Run"

2. **Unused variable `upgradeHandCount`**
   - **Location**: `src/App.tsx:49`
   - **Status**: ⚠️ Present but not used in component
   - **Impact**: Dead code, may indicate missing functionality

### 🟡 Potential Issues

1. **No error boundaries**
   - **Impact**: Unhandled errors will crash entire app
   - **Recommendation**: Add React error boundaries around screen components

2. **Missing input validation**
   - **Location**: `PreDraw` component bet/hand count inputs
   - **Issue**: No validation for negative numbers, NaN, or extreme values
   - **Impact**: Could cause unexpected behavior

3. **Race conditions possible**
   - **Location**: `useGameState` - multiple rapid state updates
   - **Issue**: Functional updates prevent most issues, but rapid clicks could cause problems
   - **Impact**: Minor - functional updates handle this well

4. **No loading states**
   - **Location**: Theme loading, async operations
   - **Issue**: Theme config loading is async but no loading indicator
   - **Impact**: Minor UX issue

5. **Hardcoded magic numbers**
   - **Location**: Various components
   - **Examples**: Animation durations, card counts
   - **Impact**: Some in config, but some scattered in components

6. **Console warnings in production**
   - **Location**: `src/utils/themeManager.ts:45, 135, 143`
   - **Issue**: `console.warn` calls may appear in production
   - **Impact**: Minor - should use proper logging

### 🟢 Code Quality Issues

1. **No unit tests**
   - **Impact**: No automated verification of logic
   - **Risk**: Regressions possible, especially in poker evaluator

2. **Large hook file**
   - **Location**: `useGameState.ts` (620 lines)
   - **Issue**: Could be split into smaller hooks
   - **Impact**: Maintainability

3. **Large utility file**
   - **Location**: `pokerEvaluator.ts` (784 lines)
   - **Issue**: Complex wild card evaluation logic
   - **Impact**: Harder to test and maintain

4. **Duplicate code**
   - **Location**: `pokerEvaluator.ts` - `evaluate()` and `evaluateRegularHand()` have similar logic
   - **Impact**: Maintenance burden

---

## Code Quality Observations

### Strengths ✅

1. **Type Safety**: Strong TypeScript usage throughout
2. **Immutable Patterns**: Consistent use of functional state updates
3. **Separation of Concerns**: Clear separation between UI, state, and logic
4. **Pure Functions**: Utils are testable and predictable
5. **Documentation**: Good inline comments for complex logic
6. **Error Handling**: Try/catch in audio operations
7. **Performance**: `useCallback` used appropriately

### Weaknesses ⚠️

1. **No Tests**: Zero test files found
2. **Large Files**: Some files exceed 600+ lines
3. **Limited Error Handling**: No error boundaries, minimal validation
4. **Console Usage**: `console.warn` in production code
5. **Magic Numbers**: Some hardcoded values scattered
6. **No Type Guards**: Input validation could be stronger

---

## Testing Status

**Status**: ❌ No tests found

**Missing Test Coverage**:
- Poker hand evaluation logic
- Parallel hand generation
- State management functions
- Deck operations
- Shop calculations
- Wild card evaluation

**Recommendation**: Add unit tests for:
1. `PokerEvaluator.evaluate()` - all hand ranks
2. `generateParallelHands()` - edge cases
3. `useGameState` callbacks - state transitions
4. Deck utilities - shuffling, modifications

---

## Development Workflow

### Build System
- **Bundler**: Vite
- **Base Path**: `/OublietteNo9/` (GitHub Pages)
- **HMR**: Configured for Docker/WSL environments

### Scripts
```json
{
  "dev": "vite --host 0.0.0.0",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
}
```

### Docker Support
- Development container with hot reload
- Production build with nginx
- Docker Compose for easy setup

### TypeScript Config
- **Strict Mode**: Enabled
- **Target**: ES2020
- **Module**: ESNext
- **JSX**: react-jsx

---

## Common Patterns & Conventions

### Component Props Pattern
```typescript
interface ComponentProps {
  // State values
  credits: number;
  handCount: number;
  
  // Callbacks (prefixed with 'on')
  onDealHand: () => void;
  onSetBetAmount: (amount: number) => void;
}
```

### State Update Pattern
```typescript
const updateFunction = useCallback(() => {
  setState((prev) => {
    // Early return for invalid states
    if (prev.credits < cost) return prev;
    
    // Return new state
    return {
      ...prev,
      // Updates
    };
  });
}, []);
```

### Screen Rendering Pattern
```typescript
{state.screen === 'menu' && (
  <div key="menu" className="screen-enter">
    <MainMenu {...props} />
  </div>
)}
```

### Error Handling Pattern
```typescript
try {
  // Operation
} catch {
  // Graceful fallback (silent in audio)
}
```

---

## Areas for Improvement

### High Priority 🔴

1. **Add Error Boundaries**
   ```typescript
   <ErrorBoundary fallback={<ErrorScreen />}>
     {state.screen === 'game' && ...}
   </ErrorBoundary>
   ```

2. **Add Input Validation**
   - Validate bet amounts, hand counts
   - Prevent negative values, NaN
   - Clamp to valid ranges

3. **Add Unit Tests**
   - Start with `PokerEvaluator`
   - Test `generateParallelHands`
   - Test state transitions

4. **Remove Unused Code**
   - `upgradeHandCount` in App.tsx
   - Any other unused exports

### Medium Priority 🟡

1. **Refactor Large Files**
   - Split `useGameState` into smaller hooks
   - Extract wild card logic from `PokerEvaluator`

2. **Add Loading States**
   - Theme loading indicator
   - Async operation feedback

3. **Improve Error Messages**
   - User-friendly error messages
   - Better validation feedback

4. **Add Logging System**
   - Replace `console.warn` with proper logger
   - Configurable log levels

### Low Priority 🟢

1. **Performance Optimization**
   - Memoize expensive calculations
   - Optimize re-renders

2. **Accessibility**
   - ARIA labels
   - Keyboard navigation
   - Screen reader support

3. **Documentation**
   - JSDoc comments for public APIs
   - Architecture decision records

---

## Quick Reference for AI Agents

### When Adding New Features

1. **State Updates**: Always use functional updates in `useGameState`
2. **New Screens**: Add to `GameScreen` type, add conditional render in `App.tsx`
3. **New Utils**: Keep pure, add to `src/utils/`
4. **New Components**: Follow prop naming convention (`on*` for callbacks)

### When Fixing Bugs

1. **State Issues**: Check `useGameState` hook
2. **Rendering Issues**: Check conditional logic in `App.tsx`
3. **Logic Issues**: Check utils (especially `pokerEvaluator.ts`)
4. **Type Errors**: Check `src/types/index.ts`

### Common Gotchas

1. **State Updates**: Must use functional form: `setState((prev) => ...)`
2. **Card IDs**: Must be unique for React keys
3. **Hand Size**: Always 5 cards (enforced in evaluator)
4. **Dead Cards**: Filtered out before evaluation
5. **Wild Cards**: Evaluated separately via `evaluateWithWildCards()`

### File Locations

- **Game State**: `src/hooks/useGameState.ts`
- **Hand Evaluation**: `src/utils/pokerEvaluator.ts`
- **Deck Operations**: `src/utils/deck.ts`
- **Parallel Hands**: `src/utils/parallelHands.ts`
- **Game Config**: `src/config/gameConfig.ts`
- **Type Definitions**: `src/types/index.ts`
- **Root Component**: `src/App.tsx`

---

## Notes for Future Development

1. **Theme System**: Well-documented in `src/themes/` and `src/hooks/AUDIO_INTEGRATION_GUIDE.md`
2. **Shop System**: Uses weighted random selection from `shopSelection.ts`
3. **Animation Timing**: Configured in `gameConfig.animation`
4. **Deck Modifications**: Dead cards, wild cards, removed cards tracked separately
5. **Round Progression**: Bet increases automatically, shop appears periodically

---

**Last Updated**: Based on codebase evaluation 2024  
**Evaluator**: Claude (AI Assistant)  
**Next Review**: After significant changes or when adding tests
