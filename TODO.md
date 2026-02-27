# To Do

## FIXES

- Implement a more stringent grid system on the animation screen. Use the grid system already in the CSS framework and let the math do the heavy lifting.

- [x] Failure Condition should appear in the main panel during pre-draw and not at the top of the screen.

- [x] If I am holding three 5s and a wild card, there is an edge case where it counts as a 3 of a kind instead of a 4 of a kind.

## FINISHING UP

- [x] Ask for clarifications as needed. Update tests, update agent notes, update documentation.

---

## Medium Priority - In Progress

### Code Splitting ✅

- [x] React.lazy() for screens (MainMenu, PreDraw, GameTable, Results, ParallelHandsAnimation, Shop, GameOver, Credits, Tutorial, Settings)
- [x] Initial bundle size reduced (~29%)

### Hook Tests ✅

- [x] Test useGameState, useGameActions, useShopActions

### Enhanced Keyboard Navigation ✅

- [x] Arrow keys for cards, Enter/Space for actions

### Error Recovery ✅

- [x] Add "Try Again" and "Return to Menu" to ErrorBoundary

### JSDoc Documentation ✅

- [x] Document complex component props and behavior

### Loading States ✅

- [x] Indicators for parallel hands generation, theme loading

### Tooltips ✅

- [x] Help text for shop items, bet efficiency, card ranks

### CI/CD Pipeline ✅

- [x] GitHub Actions for tests, builds, deployment

## Low Priority - Planned

### E2E Tests ✅

- [x] Playwright for complete user flows

### Bundle Analysis ✅

- [x] rollup-plugin-visualizer (npm run build:analyze)

### Accessibility Audit ✅

- [x] @axe-core/playwright in E2E tests

### UI Constants ✅

- [x] Extract hardcoded values to config (gameConfig.ui)

### Architecture Diagrams ✅

- [x] Mermaid diagrams in docs/ARCHITECTURE.md

### Type Guards ✅

- [x] Runtime validation for localStorage (parseAudioSettings)

---

## Phase 4 - Low Priority ✅

| # | Task | Notes |
|---|------|-------|
| 1 | E2E Tests | Playwright + axe-core in e2e/ |
| 2 | Bundle Analysis | npm run build:analyze → stats.html |
| 3 | Accessibility Audit | axe in e2e/accessibility.spec.ts |
| 4 | UI Constants | gameConfig.ui |
| 5 | Architecture Diagrams | docs/ARCHITECTURE.md |
| 6 | Type Guards | src/utils/typeGuards.ts |

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
**Medium Priority**: 10/10 complete (100%) ✅  
**Build Status**: ✅ Passing (387.58 kB main bundle)  
**Test Status**: ✅ 475+ tests passing

Phase B (animation) and Phase C (tutorial) complete. Rules button removed; code splitting in place.

**Recent session (Phase 4):** Playwright E2E + axe a11y; rollup-plugin-visualizer (build:analyze); type guards for localStorage; docs/ARCHITECTURE.md; gameConfig.ui constants.
