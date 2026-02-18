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

## ANIMATION CHANGE

- We are going to completely change the animation of the hand reveal.

- On the left, we are going to show the held cards, along with a list of the hands that have scored and the accumulated score, for instance "One Pair x 4 = 4 credits". The score will be updated as the player reveals more cards.

- On the right we will reveal the hands in a vertical rolodex animation with pseudo-3D effects. We will show a max of 10 hands wrapping around a central axis in the z-axis, their opacity decreasing the farther back in the stack they are. The card being scored is facing the player, and after the hand is scored and presented, the hand will rotate around the axis toward the center of the screen and fade out, being removed from the DOM when it is fully faded out. If there are more hands, the next hand will be added to the back of the stack of hands to be revealed.

- The speed of the hand presentation is based on the number of hands to be revealed, with the animation taking at maximum 1 second per hand. The animation needs to be smooth and fluid, and the cards need to be revealed in a way that is easy to understand and follow.

- Under the cards will be the multiplier display in a horizontal bar with sections to denote how many more hands need to be scored in order to trigger the next multiplier level.

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

**Completed**: 5/25 items from IMPROVEMENTS.md (20%)  
**High Priority**: 3/3 complete (100%) ✅  
**Medium Priority**: 2/10 complete (20%) 🔄  
**Build Status**: ✅ Passing (373.83 kB main bundle, 29% smaller)  
**Test Status**: ✅ 475+ tests passing

All recommendations from IMPROVEMENTS.md are being systematically implemented. High-priority items complete, continuing with medium and low-priority enhancements.
