# Execution Plan for Current TODO.md

**Created:** February 2026  
**Source:** TODO.md (FIXES, ANIMATION CHANGE, TUTORIAL MODE, FINISHING UP)

This plan orders work by dependency and risk: fixes first, then config, then large features (animation, tutorial). Medium/low items from TODO.md are tracked separately.

---

## Phase A: Fixes (do first)

### A.1 Hold/draw behavior with extra cards

**Current behavior:** With 6+ cards dealt, player must hold exactly 5 to draw; parallel hands are built from those 5.

**Target (from TODO):** Player does not have to hold 5. They can hold 0–5; it’s just more choices. All draws use the **maximum hand size** (e.g. 6 if they bought +1 extra card).

**Approach:**

1. **Semantics:** “Hand size” = number of cards dealt and number of cards in each parallel hand. So with `extraCardsInHand: 1`, we deal 6 and play **6-card hands** (evaluator and parallel hands use 6). Player may hold 0–6; non-held positions are filled from the deck per hand.
2. **Evaluator:** Today poker evaluator assumes 5 cards. Either:
   - Keep 5-card hands only: deal 6, player chooses 5 to keep, we discard 1 and generate 5-card parallel hands (current behavior), **or**
   - Support 6-card hands: extend evaluator (or use “best 5 from 6”) and generate 6-card parallel hands. TODO says “draws will draw up to that maximum size,” which suggests **playing with the full hand size** (6 cards per hand).
3. **Clarification:** Confirm whether “maximum hand size” means (a) we still play 5-card poker (choose 5 from 6), or (b) we play 6-card hands (evaluator/parallel hands use 6). Plan below assumes (a) unless you confirm (b).
4. **Implementation (a – still 5-card):**  
   - Allow draw when `heldIndices.length` is between 0 and 5 (inclusive) when hand size is 6.  
   - For parallel hands: from the 6 cards, take the 5 held (or if fewer than 5 held, fill the rest from deck per hand so each parallel hand is 5 cards). So “hold less” = more cards replaced per hand.  
   - Update `drawParallelHands`: build base hand of 5 by taking held cards first, then filling from deck up to 5; generate parallel hands from that 5-card base.  
   - Update GameTable: canDraw when `heldIndices.length >= 0` (and hand size >= 5); copy for Devil’s Deal.
5. **UI:** Remove “Hold 5 cards to draw” / “(X/5 held)”; replace with “Hold the cards you want to keep, then draw.”

**Files:** `useGameActions.ts` (toggleHold, drawParallelHands), `useGameState.ts`, `screen-GameTable.tsx`, `parallelHands.ts` (if hand size ever ≠ 5), `pokerEvaluator.ts` (only if 6-card hands).

---

### A.2 Max hand size and number of draws in config

**Target:** Maximum hand size (e.g. 5 + extra cards cap) and number of draws (e.g. 1 base + extra draw) configurable in game config.

**Approach:**

1. **Config:** In `defaultGameMode` (and/or shop), add:
   - `maxHandSize`: optional; default derived from 5 + `shop.extraCardInHand.maxPurchases` or explicit (e.g. 8).
   - Draws: already have `extraDrawPurchased` (one extra draw). If “number of draws” means something else (e.g. multiple redraws), add `maxDraws` or similar and gate logic on it.
2. **Use in logic:** Deal and draw logic read hand size and draw count from config/mode so different modes can override.

**Files:** `gameConfig.ts`, `useGameActions.ts`, `useGameState.ts`.

---

### A.3 Endgame round 30 – only configured end-game rules

**Target:** At round 30 (endless mode), only the end-game rules that are enabled in config apply. Minimum bet increase at round 30 is outdated and should not be applied (or only when that rule is enabled).

**Approach:**

1. **Locate round-30 / endless logic:** In `useGameState` (e.g. `returnToPreDraw` or round-advance), find where `minimumBet` is increased and where “endless” checks run.
2. **Gate by config:** For minimum bet increase, only apply when `endlessMode.failureConditions.minimumBetMultiplier.enabled` (or equivalent) is true. Same for any other end-game rule: apply only if its `enabled` flag is true.
3. **Review:** Ensure no other “round 30”-specific behavior (e.g. shop frequency, failure checks) contradicts the config. Align failure conditions (minimum bet, efficiency, winning hands, win %) with their enabled flags.

**Files:** `useGameState.ts`, `failureConditions.ts`, `gameConfig.ts` (reference).

---

## Phase B: Animation change (hand reveal redesign)

**Scope:** Replace current grid-based parallel-hands reveal with:

- **Left:** Held cards + running list of scored hands + accumulated score (e.g. “One Pair x 4 = 4 credits”), updating as more cards are revealed.
- **Right:** Vertical “rolodex” of hands (max 10 visible), pseudo-3D (opacity by z). Current hand faces player; after scoring it rotates around axis and fades out, then is removed from DOM; next hand added to the back. Speed: up to 1 s per hand, smooth.
- **Bottom:** Multiplier progress bar with sections for next level.

**Approach:**

1. **Design:** Nail layout (left panel vs rolodex vs multiplier bar) and data flow (reveal order, score accumulation, multiplier state).
2. **Data:** Reuse existing `parallelHands`, `rewardTable`, `betAmount`, streak multiplier; compute “hands that have scored” and “accumulated score” as you iterate reveal.
3. **Rolodex:** New component (e.g. `RolodexHandReveal`): max 10 hands in a stack, z-index/opacity/transform for depth; one “front” hand; on “next,” animate front hand rotate + fade, remove from DOM, push next from `parallelHands`. Loop until all revealed.
4. **Timing:** Per-hand duration = min(1000, totalDuration / handCount) or similar; drive from config.
5. **Integration:** Replace or wrap current `ParallelHandsAnimation` with this layout; keep `onAnimationComplete` and streak/credits flow.

**Files:** New component(s) under `src/components/` (e.g. `ParallelHandsRevealRolodex.tsx`), CSS, `gameConfig.ts` (timing), `App.tsx` (screen choice).

**Risk:** Large UI/UX change; implement behind a feature flag or config if you want to keep old animation as fallback.

---

## Phase C: Tutorial mode

**Target:** Tutorial from main menu; series of slides (1–7) covering: intro, pay table, parallel hands, multiplier, shop, wild/dead cards, end game.

**Approach:**

1. **Entry:** Add “Tutorial” (or “How to play”) to main menu; navigates to tutorial flow (new screen or modal).
2. **Slides:** One component per slide or single component with slide index; content per TODO (Slide 1–7). Use simple layout (title, body text, optional image/diagram, Next/Back).
3. **Assets:** No new assets required for MVP; use text + existing UI. Optional: screenshots or simple diagrams later.
4. **Exit:** “Back to menu” or “Done” on last slide returns to main menu.

**Files:** New `Tutorial.tsx` (or `TutorialSlides.tsx`), main menu link, route/screen in `App.tsx`, optional `tutorialConfig.ts` for copy.

---

## Phase D: Finishing up

- **Clarifications:** Resolve (a) 5-card vs 6-card hand semantics (A.1) and (b) “number of draws” meaning (A.2) with product/design.
- **Tests:** Update/add tests for hold/draw (A.1), config (A.2), endgame (A.3), and any new animation/tutorial code.
- **Docs:** Update CLAUDE.md, README, and TODO.md as items are completed; add agent notes for new config and screens.

---

## Suggested order of implementation

| Order | Item | Notes |
|-------|------|------|
| 1 | **A.3** Endgame round 30 | Small, config-driven; unblocks clarity on “end game only.” |
| 2 | **A.2** Config for max hand size / draws | Small config + wiring; supports A.1. |
| 3 | **A.1** Hold/draw behavior | Depends on clarified semantics (5 vs 6 card); then logic + UI. |
| 4 | **B** Animation change | Large; can be done in parallel or after A. |
| 5 | **C** Tutorial mode | Self-contained; can run in parallel with B. |
| 6 | **D** Finishing up | After A–C; tests and docs. |

---

## Checklist (from this plan)

- [x] A.1 Hold/draw: allow hold &lt; 5; draws use max hand size; UI text. **(Done)**
- [x] A.2 Config: max hand size and number of draws configurable. **(Done)**
- [x] A.3 Endgame: only apply endless rules that are enabled in config (e.g. no min bet increase at 30 unless enabled). **(Done)**
- [ ] B Animation: left (held + score list), right (rolodex), bottom (multiplier bar); timing ≤ 1 s/hand.
- [ ] C Tutorial: main menu entry, slides 1–7, back to menu.
- [ ] D Clarifications, tests, docs.

---

## Medium / low priority (from TODO.md)

These remain as backlog; no ordering in this plan:

- Code splitting (React.lazy), hook tests, keyboard nav, error recovery, JSDoc, loading states, tooltips, CI/CD.
- E2E, bundle analysis, a11y audit, UI constants, architecture diagrams, type guards.
