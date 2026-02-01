# To Do

- Fix performance issues on hand reveal animation screen - Over 100 hands slows down by an extreme amount

- Add a round black gradient to the background of the classic theme that slowly moves and changes size from the bottom of the screen

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
