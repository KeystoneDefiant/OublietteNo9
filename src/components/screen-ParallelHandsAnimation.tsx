import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Card as CardType, Hand, RewardTable } from '../types';
import { PokerEvaluator } from '../utils/pokerEvaluator';
import { gameConfig } from '../config/gameConfig';
import {
  calculateStreakMultiplier,
  getNextThreshold,
  getStreakProgress,
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
  /** Callback when animation completes, returns final streak count */
  onAnimationComplete: (finalStreakCount: number) => void;
  /** Audio settings for sound effects */
  audioSettings?: { musicEnabled: boolean; soundEffectsEnabled: boolean };
  /** Toggle music callback */
  onToggleMusic?: () => void;
  /** Toggle sound effects callback */
  onToggleSoundEffects?: () => void;
  /** Animation speed mode from game state (1 | 2 | 3 | 'skip') */
  animationSpeedMode?: 1 | 2 | 3 | 'skip';
  /** Cycle animation speed callback */
  onCycleAnimationSpeed?: () => void;
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
                  <span className="text-orange-600 font-bold text-xs">WILD</span>
                </div>
              );
            }
            const isRedSuit = card.suit === 'hearts' || card.suit === 'diamonds';
            const suitColorClass = isRedSuit ? 'text-red-600' : 'text-black';
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
  onToggleMusic,
  onToggleSoundEffects,
  onCycleAnimationSpeed,
}: ParallelHandsAnimationProps) {
  const { playSound } = useThemeAudio(audioSettings);
  const [totalRevealedCount, setTotalRevealedCount] = useState(0);
  const [currentStreakCounter, setCurrentStreakCounter] = useState(initialStreakCounter);
  const [lastHandScored, setLastHandScored] = useState<boolean | null>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [scoreByRank, setScoreByRank] = useState<Record<string, { count: number; credits: number }>>({});

  const animCfg = gameConfig.animation as { parallelHandsRolodexMaxVisible?: number };
  const maxVisible = animCfg.parallelHandsRolodexMaxVisible ?? 10;

  // Stack count: 1 (≤100), 2 (101-200), 3 (201-300), 4 (301+)
  const numStacks =
    parallelHands.length <= 100 ? 1
    : parallelHands.length <= 200 ? 2
    : parallelHands.length <= 300 ? 3
    : 4;
  const stackHands = useMemo(
    () => getStackHands(parallelHands, numStacks),
    [parallelHands, numStacks]
  );

  // Fixed ms per hand by speed mode: 1x=200ms, 2x=125ms, 3x=65ms
  const msPerHand =
    animationSpeedMode === 2 ? 125 : animationSpeedMode === 3 ? 65 : 200;
  const speedMultiplier = msPerHand / 200; // relative to 1x

  // Ensure card animates to flat before animate-out (scaled by speed)
  const ANIMATE_IN_MS = 100 * speedMultiplier;
  const FLAT_DISPLAY_MS = 50 * speedMultiplier;
  const MIN_DISPLAY_BEFORE_OUT = ANIMATE_IN_MS + FLAT_DISPLAY_MS;

  const ROTATE_FADE_MS = Math.max(20, msPerHand * 0.4);
  const displayBeforeOut = Math.max(msPerHand - ROTATE_FADE_MS, MIN_DISPLAY_BEFORE_OUT);
  const REVEAL_COMPLETE_PAUSE_MS = 600 * speedMultiplier;
  const FADE_DURATION_MS = 400 * speedMultiplier;

  // Cascade delay: each stack starts offset by (stackIndex * msPerHand / numStacks)
  const startDelays = useMemo(
    () => Array.from({ length: numStacks }, (_, s) => s * (msPerHand / numStacks)),
    [numStacks, msPerHand]
  );

  const handStreakMultipliers = useMemo(() => {
    const multipliers: number[] = [];
    let streakCount = initialStreakCounter;

    for (let i = 0; i < parallelHands.length; i++) {
      multipliers[i] = calculateStreakMultiplier(streakCount, gameConfig.streakMultiplier);
      const handResult = PokerEvaluator.evaluate(parallelHands[i].cards);
      const withRewards = PokerEvaluator.applyRewards(handResult, rewardTable);
      const scored = withRewards.multiplier > 0;
      streakCount = scored ? streakCount + 1 : Math.max(0, streakCount - 1);
    }
    return multipliers;
  }, [parallelHands, rewardTable, initialStreakCounter]);

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

  const finalStreakFromAllHands = useMemo(() => {
    let streak = initialStreakCounter;
    for (let i = 0; i < parallelHands.length; i++) {
      const handResult = PokerEvaluator.evaluate(parallelHands[i].cards);
      const withRewards = PokerEvaluator.applyRewards(handResult, rewardTable);
      const scored = withRewards.multiplier > 0;
      streak = scored ? streak + 1 : Math.max(0, streak - 1);
    }
    return streak;
  }, [parallelHands, rewardTable, initialStreakCounter]);

  const skipToSummary = () => {
    onAnimationComplete(finalStreakFromAllHands);
  };

  // When animation speed is 'skip', go directly to summary
  useEffect(() => {
    if (animationSpeedMode === 'skip') {
      onAnimationComplete(finalStreakFromAllHands);
    }
  }, [animationSpeedMode, onAnimationComplete, finalStreakFromAllHands]);

  // Handle empty hands: complete immediately
  useEffect(() => {
    if (parallelHands.length === 0) {
      const t = setTimeout(() => onAnimationComplete(initialStreakCounter), 100);
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
      const pauseMs = ROTATE_FADE_MS + REVEAL_COMPLETE_PAUSE_MS;
      const pauseTimer = setTimeout(() => setIsFadingOut(true), pauseMs);
      return () => clearTimeout(pauseTimer);
    }
  }, [totalRevealedCount, parallelHands.length, isFadingOut, ROTATE_FADE_MS, REVEAL_COMPLETE_PAUSE_MS, animationSpeedMode]);

  useEffect(() => {
    if (!isFadingOut) return;
    const doneTimer = setTimeout(() => onAnimationComplete(currentStreakCounter), FADE_DURATION_MS);
    return () => clearTimeout(doneTimer);
  }, [isFadingOut, currentStreakCounter, onAnimationComplete]);

  return (
    <div
      className={`parallel-hands-animation-container phase-b-layout select-none${isFadingOut ? ' parallel-hands-fade-out' : ''}`}
      data-animation-speed={animationSpeedMode}
      style={
        {
          '--card-transition-ms': animationSpeedMode === 2 ? 60 : animationSpeedMode === 3 ? 30 : 100,
          '--fade-out-ms': FADE_DURATION_MS,
        } as React.CSSProperties
      }
    >
      <div className="animation-background" />
      {/* Top bar: animation speed toggle, sound toggles, skip */}
      <div className="phase-b-top-bar">
        <div className="phase-b-top-controls">
          {onCycleAnimationSpeed && (
          <button
            type="button"
            onClick={onCycleAnimationSpeed}
            className={`phase-b-speed-btn phase-b-speed-${animationSpeedMode}`}
            title={
              animationSpeedMode === 1
                ? 'Animation 1x (click for 2x)'
                : animationSpeedMode === 2
                  ? 'Animation 2x (click for 3x)'
                  : animationSpeedMode === 3
                    ? 'Animation 3x (click to skip)'
                    : 'Skip animation (click for 1x)'
            }
          >
            {animationSpeedMode === 1 ? '1×' : animationSpeedMode === 2 ? '2×' : animationSpeedMode === 3 ? '3×' : '⏭'}
          </button>
          )}
          {onToggleMusic && (
            <button
              type="button"
              onClick={onToggleMusic}
              className={`phase-b-audio-btn ${audioSettings?.musicEnabled ? 'active' : ''}`}
              title={audioSettings?.musicEnabled ? 'Disable Music' : 'Enable Music'}
            >
              {audioSettings?.musicEnabled ? '🎵' : '🔇'}
            </button>
          )}
          {onToggleSoundEffects && (
            <button
              type="button"
              onClick={onToggleSoundEffects}
              className={`phase-b-audio-btn ${audioSettings?.soundEffectsEnabled ? 'active' : ''}`}
              title={audioSettings?.soundEffectsEnabled ? 'Disable Sound Effects' : 'Enable Sound Effects'}
            >
              {audioSettings?.soundEffectsEnabled ? '🔊' : '🔇'}
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
          <div className="phase-b-scores-label">Scored hands</div>
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
      {/* Right: Rolodex stack(s) - grid layout, CSS handles placement and scaling */}
      <div className={`phase-b-rolodex phase-b-rolodex-stacks-${numStacks}`}>
        {animationSpeedMode !== 'skip' &&
          stackHands.map((hands, stackIndex) => (
            <div key={stackIndex} className="rolodex-cell">
              <RolodexStack
                stackHands={hands}
                startDelay={startDelays[stackIndex]}
                displayBeforeOut={displayBeforeOut}
                ROTATE_FADE_MS={ROTATE_FADE_MS}
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

