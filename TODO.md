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

## TUTORIAL MODE

- We will be adding a tutorial mode that walks the player through a hand of the game, explaining dead and wild cards, and the idea of parallel hands. This option will be available from the main menu, and when clicked, we will show a series of slides with examples of hands, how poker hands work, and how to play the game.

- Slide 1 introduces the game as a single player poker game where the player is given cards, they select any number to hold, and then new cards are drawn to make up a poker hand.

- Slide 2 shows the pay table for the poker hands and how each round there is an ever increasing bet amount, and the hands will pay out based on the bet size.

- Slide 3 introduces the idea of parallel hands. After the player holds their cards, that deck of cards is cloned and shuffled, and multiple hands are drawn against the cards they've held. Also mentioned is that each parallel hand is played with the bet size, so if you're playing 5 parallel hands with a bet size of 2, you pay 10 credits to play the round. If you are playing 100 parallel hands with a bet size of 5, the round costs 500 credits to play. But with more hands comes more possibilities and chances to win, even on a bad draw! And if you have a really good set of held cards, you rake in the money!

- Slide 4 introduces the multiplier system, where the more hands you score in a row, the higher the multiplier goes. When you don't score a hand, your progress to the next level of multiplier goes down.

- Slide 5 introduces the store and the various things you can buy. From adding more parallel hands, buying dead cards, wild cards, additional draw phases, additional cards in your draw phase, etc. Every decision to buy has an implication to your game - while buying more hands grants more chances to win and increase the multiplier even higher, it makes each round more expensive.

- Slide 6 informs the player of wild cards and dead cards.

- Slide 7 mentions the end game after round 30 and losing is an eventuality. The goal is to win with as many credits as you can, but just surviving to round 30 is a success!

## FINISHING UP

- Ask for clarifications as needed. Update tests, update agent notes, update documentation.

---

## Medium Priority - In Progress

### Code Splitting

- 🔄 Ready to implement with React.lazy() for screens
- 🔄 Will reduce initial bundle size

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

**Completed**: 6/25 items from IMPROVEMENTS.md (24%)  
**High Priority**: 3/3 complete (100%) ✅  
**Medium Priority**: 2/10 complete (20%) 🔄  
**Build Status**: ✅ Passing (373.83 kB main bundle, 29% smaller)  
**Test Status**: ✅ 475+ tests passing

Phase B (animation change) complete. All recommendations from IMPROVEMENTS.md are being systematically implemented.
