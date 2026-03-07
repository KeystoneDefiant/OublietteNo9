import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Card as CardType, Hand, RewardTable } from '../types';
import { PokerEvaluator } from '../utils/pokerEvaluator';
import { gameConfig } from '../config/gameConfig';
import {
  calculateStreakMultiplier,
  getNextThreshold,
  getStreakProgress,
  summarizeRoundCombos,
} from '../utils/streakCalculator';
import { StreakProgressBar } from './StreakProgressBar';
import { Card } from './Card';
import './screen-ParallelHandsAnimation.css';
import { useThemeAudio } from '../hooks/useThemeAudio';
import { formatCreditsWithSuffix } from '../utils/format';

/**
 * ParallelHandsAnimation screen component props
 *
 * Phase B: Left panel (held cards + score list), right rolodex, bottom multiplier bar.
 */
interface ParallelHandsAnimationProps {
  /** Array of all parallel hands to animate */
  parallelHands: Hand[];
  /** Base hand cards (for held cards display) */
  playerHand: CardType[];
  /** Indices of held cards in playerHand */
  heldIndices: number[];
  /** Reward multipliers for calculating payouts */
  rewardTable: RewardTable;
  /** Number of hands selected (for reference) */
  selectedHandCount: number;
  /** Bet amount per hand for payout calculation */
  betAmount: number;
  /** Initial streak counter value */
  initialStreakCounter: number;
  /** Callback when animation completes with round streak summary details */
  onAnimationComplete: (summary: {
    finalStreakCount: number;
    highestCombo: number;
    highestMultiplier: number;
  }) => void;
  /** Audio settings for sound effects */
  audioSettings?: { musicEnabled: boolean; soundEffectsEnabled: boolean };
  /** Animation speed: 0.5 to 7, or 'skip' */
  animationSpeedMode?: number | 'skip';
  /** Open settings modal */
  onShowSettings?: () => void;
}

type RolodexStackConfig = {
  one?: { max?: number };
  two?: { max?: number };
  three?: { max?: number };
  four?: { min?: number };
};

type RolodexAnimationConfig = {
  parallelHandsRevealMsPerHand?: number;
  parallelHandsRevealTiming?: {
    minMsPerHand?: number;
    handCountAcceleration?: number;
    stackDelayFactor?: number;
    dealInRatio?: number;
    lingerRatio?: number;
    rotateOutRatio?: number;
    revealCompletePauseMs?: number;
    fadeOutMs?: number;
  };
  parallelHandsRolodexMaxVisible?: number;
  rolodexStacks?: RolodexStackConfig;
};

type RolodexTimingProfile = {
  numStacks: number;
  maxVisible: number;
  msPerHand: number;
  animateInMs: number;
  rotateFadeMs: number;
  displayBeforeOut: number;
  revealCompletePauseMs: number;
  fadeDurationMs: number;
  startDelays: number[];
};

const DEFAULT_ROLODEX_TIMING = {
  maxMsPerHand: 420,
  minMsPerHand: 70,
  handCountAcceleration: 58,
  stackDelayFactor: 0.68,
  dealInRatio: 0.34,
  lingerRatio: 0.22,
  rotateOutRatio: 0.44,
  revealCompletePauseMs: 700,
  fadeOutMs: 420,
} as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getRolodexStackCount(handCount: number, stacks: RolodexStackConfig): number {
  if (handCount <= (stacks.one?.max ?? 18)) return 1;
  if (handCount <= (stacks.two?.max ?? 60)) return 2;
  if (handCount <= (stacks.three?.max ?? 150)) return 3;
  return 4;
}

function getRolodexTimingProfile(
  handCount: number,
  speedNum: number,
  config: RolodexAnimationConfig
): RolodexTimingProfile {
  const timingConfig = {
    ...DEFAULT_ROLODEX_TIMING,
    maxMsPerHand: config.parallelHandsRevealMsPerHand ?? DEFAULT_ROLODEX_TIMING.maxMsPerHand,
    ...(config.parallelHandsRevealTiming ?? {}),
  };
  const numStacks = getRolodexStackCount(handCount, config.rolodexStacks ?? {});
  const maxVisible = config.parallelHandsRolodexMaxVisible ?? 10;
  const countAwareMsPerHand = clamp(
    Math.round(
      timingConfig.maxMsPerHand -
        Math.log2(Math.max(2, handCount + 1)) * timingConfig.handCountAcceleration
    ),
    timingConfig.minMsPerHand,
    timingConfig.maxMsPerHand
  );
  const safeSpeed = Math.max(0.25, speedNum);
  const msPerHand = Math.max(timingConfig.minMsPerHand, Math.round(countAwareMsPerHand / safeSpeed));
  const animateInMs = Math.max(60, Math.round(msPerHand * timingConfig.dealInRatio));
  const lingerMs = Math.max(40, Math.round(msPerHand * timingConfig.lingerRatio));
  const rotateFadeMs = Math.max(30, Math.round(msPerHand * timingConfig.rotateOutRatio));
  const displayBeforeOut = Math.max(animateInMs + lingerMs, Math.round(msPerHand - rotateFadeMs));
  const revealCompletePauseMs = Math.max(220, Math.round(timingConfig.revealCompletePauseMs / safeSpeed));
  const fadeDurationMs = Math.max(180, Math.round(timingConfig.fadeOutMs / safeSpeed));
  const stackDelayStep = Math.max(30, Math.round(msPerHand * timingConfig.stackDelayFactor));

  return {
    numStacks,
    maxVisible,
    msPerHand,
    animateInMs,
    rotateFadeMs,
    displayBeforeOut,
    revealCompletePauseMs,
    fadeDurationMs,
    startDelays: Array.from({ length: numStacks }, (_, index) => index * stackDelayStep),
  };
}

/** Split hands across stacks: stack s gets indices where i % numStacks === s */
function getStackHands(
  parallelHands: Hand[],
  numStacks: number
): { hand: Hand; globalIndex: number }[][] {
  const stacks: { hand: Hand; globalIndex: number }[][] = Array.from({ length: numStacks }, () => []);
  parallelHands.forEach((hand, i) => {
    stacks[i % numStacks].push({ hand, globalIndex: i });
  });
  return stacks;
}

/** Phase B: Compact hand card for rolodex */
const RolodexHandCard = React.memo(function RolodexHandCard({
  hand,
  rewardTable,
  betAmount,
  streakMultiplier,
  isFront,
  isAnimatingOut,
}: {
  hand: Hand;
  rewardTable: RewardTable;
  betAmount: number;
  streakMultiplier: number;
  isFront: boolean;
  isAnimatingOut: boolean;
}) {
  const handResult = PokerEvaluator.evaluate(hand.cards);
  const withRewards = PokerEvaluator.applyRewards(handResult, rewardTable);
  const creditsWon = Math.round(withRewards.multiplier * betAmount * streakMultiplier);

  return (
    <div
      className={`rolodex-hand-card ${isFront ? 'rolodex-front' : 'rolodex-back'} ${isAnimatingOut ? 'rolodex-animating-out' : ''}`}
    >
      <div className="rolodex-hand-content">
        <div className="rolodex-hand-cards">
          {hand.cards.map((card, cardIndex) => {
            if (card.isDead) {
              return (
                <div key={cardIndex} className="rolodex-card-small" title="Dead Card">
                  <span className="text-xl">💀</span>
                </div>
              );
            }
            if (card.isWild) {
              return (
                <div key={cardIndex} className="rolodex-card-small" title="Wild Card">
                  <span className="card-wild font-bold text-xs">WILD</span>
                </div>
              );
            }
            const isRedSuit = card.suit === 'hearts' || card.suit === 'diamonds';
            const suitColorClass = isRedSuit ? 'card-suit-red' : 'card-suit-black';
            return (
              <div
                key={cardIndex}
                className="rolodex-card-small"
                title={`${card.rank}${card.suit.charAt(0).toUpperCase()}`}
              >
                <span className={suitColorClass}>{card.rank}</span>
                <span className={`suit ${suitColorClass}`}>{getSuitSymbol(card.suit)}</span>
              </div>
            );
          })}
        </div>
        <div className="rolodex-score">
          <span className="rolodex-rank">{toCapitalCase(handResult.rank)}</span>
          <span className="rolodex-credits">{formatCreditsWithSuffix(creditsWon)}</span>
        </div>
      </div>
    </div>
  );
});

/** Single rolodex stack with delayed start for cascade effect */
function RolodexStack({
  stackHands,
  startDelay,
  displayBeforeOut,
  ROTATE_FADE_MS,
  handStreakMultipliers,
  rewardTable,
  betAmount,
  playSound,
  onHandRevealed,
  maxVisible,
}: {
  stackHands: { hand: Hand; globalIndex: number }[];
  startDelay: number;
  displayBeforeOut: number;
  ROTATE_FADE_MS: number;
  handStreakMultipliers: number[];
  rewardTable: RewardTable;
  betAmount: number;
  playSound: (type: string, rank?: string) => void;
  onHandRevealed: (globalIndex: number) => void;
  maxVisible: number;
}) {
  const [started, setStarted] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(t);
  }, [startDelay]);

  useEffect(() => {
    if (!started || revealedCount >= stackHands.length || stackHands.length === 0) return;
    const { hand, globalIndex } = stackHands[revealedCount];
    const handResult = PokerEvaluator.evaluate(hand.cards);
    const withRewards = PokerEvaluator.applyRewards(handResult, rewardTable);
    const handScored = withRewards.multiplier > 0;

    const scoreTimer = setTimeout(() => {
      if (handScored) playSound('handScoring', handResult.rank);
      onHandRevealed(globalIndex);
      setIsAnimatingOut(true);
    }, displayBeforeOut);

    return () => clearTimeout(scoreTimer);
  }, [started, revealedCount, stackHands, displayBeforeOut, playSound, onHandRevealed, rewardTable]);

  useEffect(() => {
    if (!isAnimatingOut) return;
    const advanceTimer = setTimeout(() => {
      setIsAnimatingOut(false);
      setRevealedCount((prev) => prev + 1);
    }, ROTATE_FADE_MS);
    return () => clearTimeout(advanceTimer);
  }, [isAnimatingOut, ROTATE_FADE_MS]);

  if (stackHands.length === 0) return null;

  return (
    <div className="rolodex-stack">
      {Array.from(
        { length: Math.min(maxVisible, stackHands.length - revealedCount + 1) },
        (_, i) => {
          const idx = revealedCount + i;
          if (idx >= stackHands.length) return null;
          const { hand, globalIndex } = stackHands[idx];
          const isFront = i === 0;
          return (
            <RolodexHandCard
              key={hand.id}
              hand={hand}
              rewardTable={rewardTable}
              betAmount={betAmount}
              streakMultiplier={handStreakMultipliers[globalIndex]}
              isFront={isFront}
              isAnimatingOut={isFront && isAnimatingOut}
            />
          );
        }
      )}
    </div>
  );
}

export function ParallelHandsAnimation({
  parallelHands,
  playerHand,
  heldIndices,
  rewardTable,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selectedHandCount: _selectedHandCount,
  betAmount,
  initialStreakCounter,
  onAnimationComplete,
  audioSettings,
  animationSpeedMode = 1,
  onShowSettings,
}: ParallelHandsAnimationProps) {
  const { playSound } = useThemeAudio(audioSettings);
  const [totalRevealedCount, setTotalRevealedCount] = useState(0);
  const [currentStreakCounter, setCurrentStreakCounter] = useState(initialStreakCounter);
  const [lastHandScored, setLastHandScored] = useState<boolean | null>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [scoreByRank, setScoreByRank] = useState<Record<string, { count: number; credits: number }>>({});

  const n = parallelHands.length;
  const animCfg = gameConfig.animation as RolodexAnimationConfig;
  const speedNum = typeof animationSpeedMode === 'number' ? animationSpeedMode : 1;
  const timingProfile = useMemo(
    () => getRolodexTimingProfile(n, speedNum, animCfg),
    [n, speedNum, animCfg]
  );
  const {
    numStacks,
    maxVisible,
    msPerHand,
    animateInMs,
    rotateFadeMs,
    displayBeforeOut,
    revealCompletePauseMs,
    fadeDurationMs,
    startDelays,
  } = timingProfile;
  const stackHands = useMemo(
    () => getStackHands(parallelHands, numStacks),
    [parallelHands, numStacks]
  );
  const roundComboSummary = useMemo(
    () =>
      summarizeRoundCombos(
        parallelHands,
        rewardTable,
        betAmount,
        initialStreakCounter,
        gameConfig.streakMultiplier
      ),
    [parallelHands, rewardTable, betAmount, initialStreakCounter]
  );

  const handStreakMultipliers = roundComboSummary.streakMultipliers;

  const onHandRevealed = useCallback(
    (globalIndex: number) => {
      const hand = parallelHands[globalIndex];
      const handResult = PokerEvaluator.evaluate(hand.cards);
      const withRewards = PokerEvaluator.applyRewards(handResult, rewardTable);
      const handScored = withRewards.multiplier > 0;
      const creditsWon = Math.round(
        withRewards.multiplier * betAmount * handStreakMultipliers[globalIndex]
      );

      setCurrentStreakCounter((prev) => (handScored ? prev + 1 : Math.max(0, prev - 1)));
      setLastHandScored(handScored);
      setScoreByRank((prev) => {
        const rank = handResult.rank;
        const cur = prev[rank] ?? { count: 0, credits: 0 };
        return {
          ...prev,
          [rank]: { count: cur.count + 1, credits: cur.credits + creditsWon },
        };
      });
      setTotalRevealedCount((prev) => prev + 1);
    },
    [parallelHands, rewardTable, betAmount, handStreakMultipliers]
  );

  const currentStreakMultiplier = calculateStreakMultiplier(
    currentStreakCounter,
    gameConfig.streakMultiplier
  );
  const nextThreshold = getNextThreshold(currentStreakCounter, gameConfig.streakMultiplier);
  const streakProgress = getStreakProgress(currentStreakCounter, gameConfig.streakMultiplier);

  const heldCards = useMemo(
    () => heldIndices.map((i) => playerHand[i]).filter(Boolean),
    [playerHand, heldIndices]
  );
  const totalCredits = useMemo(
    () => Object.values(scoreByRank).reduce((sum, r) => sum + r.credits, 0),
    [scoreByRank]
  );

  const completionSummary = useMemo(
    () => ({
      finalStreakCount:
        roundComboSummary.comboProgression[roundComboSummary.comboProgression.length - 1] ??
        initialStreakCounter,
      highestCombo: roundComboSummary.highestCombo,
      highestMultiplier: roundComboSummary.highestMultiplier,
    }),
    [roundComboSummary, initialStreakCounter]
  );

  const skipToSummary = () => {
    onAnimationComplete(completionSummary);
  };

  // When animation speed is 'skip', go directly to summary
  useEffect(() => {
    if (animationSpeedMode === 'skip') {
      onAnimationComplete(completionSummary);
    }
  }, [animationSpeedMode, onAnimationComplete, completionSummary]);

  // Handle empty hands: complete immediately
  useEffect(() => {
    if (parallelHands.length === 0) {
      const t = setTimeout(
        () =>
          onAnimationComplete({
            finalStreakCount: initialStreakCounter,
            highestCombo: initialStreakCounter,
            highestMultiplier: calculateStreakMultiplier(
              initialStreakCounter,
              gameConfig.streakMultiplier
            ),
          }),
        100
      );
      return () => clearTimeout(t);
    }
  }, [parallelHands.length, onAnimationComplete, initialStreakCounter]);

  // All revealed: wait for last hand to animate out, then pause, then fade out
  useEffect(() => {
    if (
      totalRevealedCount === parallelHands.length &&
      parallelHands.length > 0 &&
      !isFadingOut &&
      animationSpeedMode !== 'skip'
    ) {
      const pauseMs = rotateFadeMs + revealCompletePauseMs;
      const pauseTimer = setTimeout(() => setIsFadingOut(true), pauseMs);
      return () => clearTimeout(pauseTimer);
    }
  }, [
    totalRevealedCount,
    parallelHands.length,
    isFadingOut,
    rotateFadeMs,
    revealCompletePauseMs,
    animationSpeedMode,
  ]);

  useEffect(() => {
    if (!isFadingOut) return;
    const doneTimer = setTimeout(
      () =>
        onAnimationComplete({
          ...completionSummary,
          finalStreakCount: currentStreakCounter,
        }),
      fadeDurationMs
    );
    return () => clearTimeout(doneTimer);
  }, [isFadingOut, currentStreakCounter, onAnimationComplete, fadeDurationMs, completionSummary]);

  return (
    <div
      className={`parallel-hands-animation-container phase-b-layout select-none${isFadingOut ? ' parallel-hands-fade-out' : ''}`}
      data-animation-speed={animationSpeedMode}
      style={
        {
          '--card-transition-ms': animationSpeedMode === 'skip' ? 30 : Math.max(animateInMs, rotateFadeMs),
          '--fade-out-ms': fadeDurationMs,
          '--rolodex-ms-per-hand': msPerHand,
        } as React.CSSProperties
      }
    >
      <div className="animation-background" />
      {/* Top bar: gear (settings) + skip */}
      <div className="phase-b-top-bar">
        <div className="phase-b-top-controls">
          {onShowSettings && (
            <button
              type="button"
              onClick={onShowSettings}
              className="phase-b-speed-btn"
              title="Settings"
              aria-label="Open settings"
            >
              ⚙️
            </button>
          )}
          <button
            type="button"
            onClick={skipToSummary}
            className="phase-b-skip-btn"
            title="Skip to round summary"
          >
            Skip
          </button>
        </div>
      </div>
      {/* Left panel: held cards + score list + accumulated */}
      <div className="phase-b-left-panel">
        <div className="phase-b-held-section">
          <div className="phase-b-held-label">Held cards</div>
          <div className="phase-b-held-cards">
            {heldCards.length > 0 ? (
              heldCards.map((card) => (
                <Card key={card.id} card={card} size="small" />
              ))
            ) : (
              <span className="phase-b-held-empty">None held</span>
            )}
          </div>
        </div>
        <div className="phase-b-scores-section">
          <div className="phase-b-scores-label">
            <span>Scored hands</span>
            <div className="phase-b-reveal-meta">
              <span className="phase-b-scores-counter">
                {totalRevealedCount} of {parallelHands.length} hands
              </span>
            </div>
          </div>
          <div className="phase-b-scores-list">
            {Object.entries(scoreByRank).map(([rank, { count, credits }]) => (
              <div key={rank} className="phase-b-score-row">
                <span className="phase-b-score-left">{toCapitalCase(rank)} × {count}</span>
                <span className="phase-b-score-right">{formatCreditsWithSuffix(credits)}</span>
              </div>
            ))}
            {Object.keys(scoreByRank).length === 0 && (
              <span className="phase-b-scores-empty">—</span>
            )}
          </div>
          <div className="phase-b-total">{formatCreditsWithSuffix(totalCredits)}</div>
        </div>
      </div>
      {/* Right: Adaptive rolodex stack(s) with hand-count-aware pacing */}
      <div
        className={`phase-b-rolodex phase-b-rolodex-stacks-${numStacks}`}
        data-hand-count={parallelHands.length}
        data-stack-count={numStacks}
      >
        {animationSpeedMode !== 'skip' &&
          stackHands.map((hands, stackIndex) => (
            <div key={stackIndex} className="rolodex-cell">
              <RolodexStack
                stackHands={hands}
                startDelay={startDelays[stackIndex]}
                displayBeforeOut={displayBeforeOut}
                ROTATE_FADE_MS={rotateFadeMs}
                handStreakMultipliers={handStreakMultipliers}
                rewardTable={rewardTable}
                betAmount={betAmount}
                playSound={playSound as (type: string, rank?: string) => void}
                onHandRevealed={onHandRevealed}
                maxVisible={maxVisible}
              />
            </div>
          ))}
      </div>
      {/* Bottom: horizontal multiplier bar */}
      {gameConfig.streakMultiplier.enabled && (
        <div className="phase-b-bottom-bar">
          <StreakProgressBar
            currentStreak={currentStreakCounter}
            currentMultiplier={currentStreakMultiplier}
            nextThreshold={nextThreshold}
            progress={streakProgress}
            lastHandScored={lastHandScored}
            config={gameConfig.streakMultiplier}
            variant="horizontal-segments"
          />
        </div>
      )}
    </div>
  );
}

/** Convert hand rank to Capital Case (e.g. "one-pair" → "One Pair") */
function toCapitalCase(rank: string): string {
  return rank
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function getSuitSymbol(suit: string): string {
  switch (suit) {
    case 'hearts':
      return '♥';
    case 'diamonds':
      return '♦';
    case 'clubs':
      return '♣';
    case 'spades':
      return '♠';
    default:
      return '';
  }
}

