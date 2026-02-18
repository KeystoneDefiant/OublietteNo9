# To Do

## FIXES (Phase A – completed)

- [x] When the player has purchased an increase to their maximum hand size, they do not have to hold 5 cards. They simply get more choices in their draw phase. They can still hold up to 5 cards, but can hold less if they want. Additionally, all draws will draw up to that maximum size.

- [x] Make the maximum hand size and number of draws configurable in the game config.

- [x] Review the endgame state in round 30 and make sure that only the end game rules turned on in the config are applied. Currently round 30 looks to impose a minimum bet increase, which is outdated and is no longer a relevent end game state.

### Additional fixes completed (Feb 2026)

- [x] Shop always shows correct number of items (slot-based rendering, repeats allowed; config keys aligned: remove-single-dead-card, remove-all-dead-cards).
- [x] Credits needed for next round recalculates after purchases.
- [x] Draw logic refactored: maxDraws/drawsCompletedThisRound; deal counts as first draw; nextActionIsDraw for button; draws left = maxDraws - drawsCompletedThisRound - 1.
- [x] Poker evaluator: 3 wilds + 2 queens (or any count + wilds ≥ 5) now correctly evaluates as five-of-a-kind.

## ANIMATION CHANGE ✅ (Phase B – completed Feb 2026)

- [x] **Left panel:** Held cards + running list of scored hands + accumulated score (e.g. "One Pair x 4 = 4 credits"), updating as more cards are revealed. No max-height, no scrollbar; flexible score row layout.

- [x] **Right rolodex:** Vertical stack of hands with pseudo-3D effects. Max 10 hands visible per stack; opacity decreases with depth. Current hand faces player; after scoring it rotates and fades out. Speed: up to 1 s per hand, configurable (1x/2x/3x/skip).

- [x] **Multi-stack layout:** 1–100 hands = 1 stack; 101–200 = 2 stacks; 201–300 = 3 stacks; 301+ = 4 stacks. Hands split evenly; cascade animation with staggered start delays (one animating in, one animating out).

- [x] **Responsive grid:** Stacks in CSS grid; vertical when enough space (viewport height > 700px); 2-column layout (2x1, 2+1 centered, or 2x2) when height ≤ 700px. Stacks scale to fit container (container queries cqw/cqh when supported).

- [x] **Bottom:** Multiplier bar with horizontal segments; static width; responsive sizing on mobile.

- [x] **Mobile:** Left panel stacks above animation on narrow screens; multiplier bar scales; hand stacks scale to viewport.

## TUTORIAL MODE ✅ (Phase C – completed Feb 2026)

- [x] "How to Play" button on main menu opens tutorial modal.
- [x] Seven slides: intro, pay table, parallel hands, multiplier, shop, wild/dead cards, end game.
- [x] Back/Next navigation; Back to Menu on first slide; Done on last slide.
- [x] Keyboard: Escape to close, Arrow keys to navigate.
- [x] Tutorial content supports `\n` for line breaks (white-space: pre-line).

### UI changes (Feb 2026)

- [x] Rules button removed from main menu (tutorial covers rules).

## FINISHING UP

- Ask for clarifications as needed. Update tests, update agent notes, update documentation.

---

## Medium Priority - In Progress

### Code Splitting ✅

- [x] React.lazy() for screens (MainMenu, PreDraw, GameTable, Results, ParallelHandsAnimation, Shop, GameOver, Credits, Tutorial, Settings)
- [x] Initial bundle size reduced (~29%)

### Hook Tests

- 📋 Planned: Test useGameState, useGameActions, useShopActions

### Enhanced Keyboard Navigation

- 📋 Planned: Arrow keys for cards, Enter/Space for actions

### Error Recovery

- 📋 Planned: Add "Try Again" and "Return to Menu" to ErrorBoundary

### JSDoc Documentation

- 📋 Planned: Document complex component props and behavior

### Loading States

- 📋 Planned: Indicators for parallel hands generation, theme switching

### Tooltips

- 📋 Planned: Help text for shop items, bet efficiency, card ranks

### CI/CD Pipeline

- 📋 Planned: GitHub Actions for tests, builds, deployment

## Low Priority - Planned

### E2E Tests

- 📋 Playwright for complete user flows

### Bundle Analysis

- 📋 vite-bundle-visualizer for dependency analysis

### Accessibility Audit

- 📋 Run axe DevTools, Lighthouse, WAVE

### UI Constants

- 📋 Extract hardcoded values to config

### Architecture Diagrams

- 📋 Mermaid diagrams for state flow, component hierarchy

### Type Guards

- 📋 Runtime validation for external data

---

## Performance Impact

### Bundle Size Optimization

```
Before:  530.89 kB (single bundle)
After:   373.83 kB (main) + 13 lazy chunks
Savings: 29% reduction in initial load
```

### Test Coverage Growth

```
Before:  175 tests (utils only)
After:   475+ tests (utils + components)
Growth:  +171% coverage increase
```

---

## Summary

**Completed**: 7/25 items from IMPROVEMENTS.md (28%)  
**High Priority**: 3/3 complete (100%) ✅  
**Medium Priority**: 3/10 complete (30%) 🔄  
**Build Status**: ✅ Passing (387.58 kB main bundle)  
**Test Status**: ✅ 475+ tests passing

Phase B (animation) and Phase C (tutorial) complete. Rules button removed; code splitting in place.

**Recent session (Feb 16, 2026):** Phase B multi-stack rolodex and Phase C tutorial fully implemented. TODO_EXECUTION_PLAN.md cleaned up (orphaned Phase C approach content removed).
