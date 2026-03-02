# TODO Implementation Plan

**Status**: Both items completed (February 2026)

## 1. Animation Screen Grid System ✅

**Goal**: Use the grid system from the CSS framework (Tailwind) and let math do the heavy lifting.

**Current state**:
- Phase B layout uses CSS Grid with `grid-template-areas` (top-bar, left-panel, rolodex, bottom-bar)
- Rolodex area uses custom grid classes (`phase-b-rolodex-stacks-1` through `4`) with manual breakpoints
- `rolodex-stack` uses viewport-based scale calculations: `--rolodex-scale: min(1.5, max(0.3, min((100dvh - 140px) / 380, (100vw - 60px) / 400)))`
- `gameConfig.parallelHandsGrid` has thresholds but they're for a different (legacy?) hands-grid layout

**Plan**:
1. Drive rolodex grid columns from `gameConfig.parallelHandsGrid` thresholds
2. Replace custom scale math with CSS `clamp()` and container queries where possible
3. Use Tailwind grid utilities (`grid-cols-1`, `grid-cols-2`, etc.) for responsive breakpoints
4. Consolidate the hands-grid CSS (if still used) to use the same config-driven approach

## 2. UI Style Rework ✅

**Goal**: Darker, game-like aesthetic—deep reds and blacks with white and gold highlights.

**Current state**:
- Light backgrounds (white, gray-50, green-50, blue-50)
- Purple/blue accent (#667eea)
- Generic web-app look

**Plan**:
1. Add CSS custom properties for theme colors in `global.css`:
   - `--bg-dark`, `--bg-darker`, `--accent-red`, `--accent-gold`, `--text-light`, `--text-muted`
2. Update main screens: PreDraw, GameTable, Results, Shop, GameOver, MainMenu
3. Update shared components: GameHeader, Card, RewardTable
4. Update animation screen (ParallelHandsAnimation) to match dark theme
5. Ensure sufficient contrast for accessibility

**Color palette**:
- Background: #0a0a0a (near black), #1a0a0a (dark red-black)
- Cards/panels: #1f0f0f, #2a1515
- Accent red: #b91c1c, #dc2626
- Gold highlight: #fbbf24, #f59e0b
- White text: #fafafa
- Muted: #a3a3a3
