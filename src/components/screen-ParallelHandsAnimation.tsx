import React, { useEffect, useState, useRef } from 'react';
import { Hand, RewardTable } from '../types';
import { PokerEvaluator } from '../utils/pokerEvaluator';
import { gameConfig } from '../config/gameConfig';
import { calculateStreakMultiplier, getNextThreshold, getStreakProgress } from '../utils/streakCalculator';
import { StreakProgressBar } from './StreakProgressBar';
import './screen-ParallelHandsAnimation.css';

/**
 * ParallelHandsAnimation screen component props
 * 
 * Displays animated reveal of all parallel hands in a grid layout
 * with automatic virtualization for large hand counts.
 */
interface ParallelHandsAnimationProps {
  /** Array of all parallel hands to animate */
  parallelHands: Hand[];
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
}

/**
 * Shared function to calculate grid columns based on hand count
 * Uses configuration from gameConfig.parallelHandsGrid
 * 
 * @param handCount - Total number of hands to display
 * @returns Number of columns (1, 2, 4, or 8)
 */

/**
 * Shared function to calculate grid columns
 */
const getColumnsPerRow = (handCount: number): number => {
  const grid = gameConfig.parallelHandsGrid;
  if (handCount <= grid.singleColumn.max) return 1;
  if (handCount >= grid.twoColumn.min && handCount <= grid.twoColumn.max) return 2;
  if (handCount >= grid.fourColumn.min && handCount <= grid.fourColumn.max) return 4;
  return 8; // 101+ hands
};

/**
 * Render a single hand card component
 * 
 * Used by both virtualized (50+ hands) and non-virtualized rendering.
 * Displays the 5 cards in the hand with special handling for dead/wild cards,
 * the hand rank, and credits won (with streak multiplier applied).
 * 
 * @param hand - The hand to render
 * @param rewardTable - Reward multipliers for payout calculation
 * @param betAmount - Bet amount for calculating credits won
 * @param index - Index for staggered animation delay
 * @param streakMultiplier - Current streak multiplier to apply
 * @returns JSX element representing the hand card
 */
function renderHandCard(
  hand: Hand,
  rewardTable: RewardTable,
  betAmount: number,
  index: number,
  streakMultiplier: number
): JSX.Element {
  const handResult = PokerEvaluator.evaluate(hand.cards);
  const withRewards = PokerEvaluator.applyRewards(handResult, rewardTable);
  const creditsWon = Math.round(withRewards.multiplier * betAmount * streakMultiplier);

  return (
    <div 
      className="grid-hand-card" 
      style={{ animationDelay: `${index * 0.02}s` }}
    >
      <div className="hand-content">
        <div className="hand-cards">
          {hand.cards.map((card, cardIndex) => {
            if (card.isDead) {
              return (
                <div key={cardIndex} className="hand-card-small" title="Dead Card">
                  <span className="text-2xl">💀</span>
                </div>
              );
            }
            if (card.isWild) {
              return (
                <div key={cardIndex} className="hand-card-small" title="Wild Card">
                  <span className="text-orange-600 font-bold text-xs">WILD</span>
                </div>
              );
            }
            const isRedSuit = card.suit === 'hearts' || card.suit === 'diamonds';
            const suitColorClass = isRedSuit ? 'text-red-600' : 'text-black';
            return (
              <div
                key={cardIndex}
                className="hand-card-small"
                title={`${card.rank}${card.suit.charAt(0).toUpperCase()}`}
              >
                <span className={suitColorClass}>{card.rank}</span>
                <span className={`suit ${suitColorClass}`}>{getSuitSymbol(card.suit)}</span>
              </div>
            );
          })}
        </div>
        <div className="hand-score">
          <div className="score-text">
            {handResult.rank.replace('-', ' ').toUpperCase()}
          </div>
          <div className="score-breakdown">
            <div className="base-payout">
              {withRewards.multiplier}x × {betAmount} bet = {Math.round(withRewards.multiplier * betAmount)}
            </div>
            {/* Always show streak multiplier for consistent card height */}
            <div className={`streak-badge streak-${getStreakTier(streakMultiplier)}`}>
              × {streakMultiplier.toFixed(1)}x {streakMultiplier > 1.0 ? 'Streak!' : 'Base'}
            </div>
            <div className="score-value">
              = {Math.round(creditsWon)} credits
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ParallelHandsAnimation screen component
 * 
 * Displays all parallel hands in an animated grid reveal:
 * - Hands revealed sequentially (top-to-bottom, left-to-right)
 * - Dynamic columns based on hand count (1, 2, 4, or 8 columns)
 * - Smooth scrolling as hands are revealed
 * - Automatic virtualization for 50+ hands using react-virtuoso
 * - Viewport-locked with content scrolling off top
 * 
 * Uses configuration from gameConfig for timing and grid layout.
 * Calls onAnimationComplete when all hands are revealed and delay expires.
 * 
 * @example
 * <ParallelHandsAnimation
 *   parallelHands={hands}
 *   rewardTable={rewards}
 *   betAmount={10}
 *   onAnimationComplete={() => moveToResults()}
 * />
 */
export function ParallelHandsAnimation({
  parallelHands,
  rewardTable,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selectedHandCount: _selectedHandCount,
  betAmount,
  initialStreakCounter,
  onAnimationComplete,
}: ParallelHandsAnimationProps) {
  const [revealedCount, setRevealedCount] = useState(0);
  const [currentStreakCounter, setCurrentStreakCounter] = useState(initialStreakCounter);
  const [lastHandScored, setLastHandScored] = useState<boolean | null>(null);
  const [isScrollingOff, setIsScrollingOff] = useState(false);
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const lastVisibilityCheckRef = useRef<number>(0);

  const columnsPerRow = getColumnsPerRow(parallelHands.length);
  
  // Calculate dynamic scale based on hand count to fit all in viewport
  const getScaleFactor = (handCount: number): number => {
    if (handCount <= 10) return 1.0;      // Normal size
    if (handCount <= 25) return 0.9;      // Slightly smaller
    if (handCount <= 50) return 0.75;     // Medium compression
    if (handCount <= 75) return 0.65;     // More compression
    if (handCount <= 100) return 0.55;    // Heavy compression
    return 0.45;                           // Maximum compression for 100+
  };
  
  const scaleFactor = getScaleFactor(parallelHands.length);
  
  // Calculate current streak multiplier
  const currentStreakMultiplier = calculateStreakMultiplier(currentStreakCounter, gameConfig.streakMultiplier);
  const nextThreshold = getNextThreshold(currentStreakCounter, gameConfig.streakMultiplier);
  const streakProgress = getStreakProgress(currentStreakCounter, gameConfig.streakMultiplier);

  // Dynamic animation timing based on hand count
  // Much slower for few hands, much faster for many hands
  const calculateRevealInterval = (handCount: number): number => {
    if (handCount <= 5) return 300;  // 1.5s total for 5 hands
    if (handCount <= 10) return 250; // 2.5s total for 10 hands
    if (handCount <= 20) return 180; // 3.6s total for 20 hands
    if (handCount <= 30) return 120; // 3.6s total for 30 hands
    if (handCount <= 50) return 80;  // 4.0s total for 50 hands
    if (handCount <= 70) return 50;  // 3.5s total for 70 hands
    if (handCount <= 90) return 35;  // 3.15s total for 90 hands
    return 25; // 2.5s total for 100 hands
  };

  const handRevealInterval = calculateRevealInterval(parallelHands.length);

  // Reveal hands one by one and update streak
  useEffect(() => {
    if (revealedCount < parallelHands.length) {
      const timer = setTimeout(() => {
        // Update streak based on whether this hand scored
        const hand = parallelHands[revealedCount];
        const handResult = PokerEvaluator.evaluate(hand.cards);
        const withRewards = PokerEvaluator.applyRewards(handResult, rewardTable);
        const handScored = withRewards.multiplier > 0;
        
        setCurrentStreakCounter((prev) => {
          const newCount = handScored ? prev + 1 : Math.max(0, prev - 1);
          return newCount;
        });
        
        setLastHandScored(handScored);
        setRevealedCount((prev) => prev + 1);
      }, handRevealInterval);

      return () => clearTimeout(timer);
    } else if (revealedCount === parallelHands.length && parallelHands.length > 0 && !isScrollingOff) {
      // All hands revealed, pause for 300ms then trigger scroll-off animation
      const pauseTimer = setTimeout(() => {
        setIsScrollingOff(true);
      }, 300);

      return () => clearTimeout(pauseTimer);
    }
  }, [revealedCount, parallelHands, rewardTable, handRevealInterval, onAnimationComplete, currentStreakCounter, isScrollingOff]);

  // Handle scroll-off animation when triggered
  useEffect(() => {
    if (isScrollingOff && gridRef.current) {
      const grid = gridRef.current;
      
      // Calculate the height needed to scroll everything off screen
      const gridHeight = grid.getBoundingClientRect().height;
      const viewportHeight = viewportRef.current?.getBoundingClientRect().height || window.innerHeight;
      const scrollDistance = gridHeight + viewportHeight;
      
      // Apply CSS class for scroll-off animation
      grid.classList.add('scroll-off');
      grid.style.transform = `scale(${scaleFactor}) translateY(-${scrollDistance}px)`;
      
      // Wait for animation to complete (1 second for smooth scroll), then call completion
      const animationTimer = setTimeout(() => {
        onAnimationComplete(currentStreakCounter);
      }, 1000); // 1 second animation duration
      
      return () => clearTimeout(animationTimer);
    }
  }, [isScrollingOff, scaleFactor, currentStreakCounter, onAnimationComplete]);

  // Auto-scroll to keep the most recently revealed hand visible
  useEffect(() => {
    if (revealedCount > 0 && viewportRef.current && gridRef.current) {
      const viewport = viewportRef.current;
      const grid = gridRef.current;
      
      // Get all revealed hand cards
      const handCards = grid.querySelectorAll('.grid-hand-card');
      if (handCards.length > 0) {
        const lastCard = handCards[handCards.length - 1] as HTMLElement;
        
        // Calculate the position to scroll to
        // We want to keep the newly revealed card visible with some margin
        const cardRect = lastCard.getBoundingClientRect();
        const viewportRect = viewport.getBoundingClientRect();
        
        // If the card is below the visible area, scroll to it
        if (cardRect.bottom > viewportRect.bottom) {
          const scrollTarget = viewport.scrollTop + (cardRect.bottom - viewportRect.bottom) + 100;
          viewport.scrollTo({
            top: scrollTarget,
            behavior: 'smooth'
          });
        }
      }
    }
  }, [revealedCount]);

  // Performance optimization: Remove hands that have scrolled out of viewport
  // Only enable for large hand counts (150+) to reduce DOM node count
  useEffect(() => {
    if (parallelHands.length >= 150 && !isScrollingOff) {
      const viewport = viewportRef.current;
      const grid = gridRef.current;
      
      if (!viewport || !grid) return;
      
      const updateVisibleRange = () => {
        const now = Date.now();
        // Throttle to max once per 100ms
        if (now - lastVisibilityCheckRef.current < 100) return;
        lastVisibilityCheckRef.current = now;
        
        const handCards = grid.querySelectorAll('.grid-hand-card');
        if (handCards.length === 0) return;
        
        const columnsCount = getColumnsPerRow(parallelHands.length);
        
        // Calculate approximate height of one row based on first card
        const firstCard = handCards[0] as HTMLElement;
        const cardRect = firstCard.getBoundingClientRect();
        const cardHeight = cardRect.height / scaleFactor; // Adjust for scale
        const rowHeight = cardHeight + 16; // card height + gap
        
        // Keep a buffer of rows above the viewport (2 rows worth)
        const bufferRows = 2;
        const bufferDistance = bufferRows * rowHeight;
        
        // Calculate which row is at the top of the viewport
        const scrollTop = viewport.scrollTop;
        const firstVisibleRow = Math.max(0, Math.floor((scrollTop - bufferDistance) / rowHeight));
        const newStartIndex = firstVisibleRow * columnsCount;
        
        // Only update if we've scrolled past at least 2 rows worth of content
        if (newStartIndex > visibleStartIndex + (columnsCount * 2)) {
          setVisibleStartIndex(newStartIndex);
        }
      };
      
      // Initial check
      updateVisibleRange();
      
      // Add scroll listener
      viewport.addEventListener('scroll', updateVisibleRange);
      
      return () => {
        viewport.removeEventListener('scroll', updateVisibleRange);
      };
    }
  }, [parallelHands.length, visibleStartIndex, isScrollingOff, scaleFactor]);

  // Single rendering path for all hand counts - no scrolling, compressed grid
  return (
    <div className="parallel-hands-animation-container select-none">
      {/* Streak Thermometer */}
      {gameConfig.streakMultiplier.enabled && (
        <StreakProgressBar
          currentStreak={currentStreakCounter}
          currentMultiplier={currentStreakMultiplier}
          nextThreshold={nextThreshold}
          progress={streakProgress}
          lastHandScored={lastHandScored}
          config={gameConfig.streakMultiplier}
        />
      )}
      
      <div className="animation-background"></div>
      <div className="hands-grid-viewport" ref={viewportRef}>
        <div
          ref={gridRef}
          className="hands-grid"
          data-columns={columnsPerRow}
          style={{
            transform: `scale(${scaleFactor})`,
            transformOrigin: 'center top',
          }}
        >
          {parallelHands.slice(0, revealedCount).map((hand, index) => {
            // Performance optimization: Virtual scrolling for large hand counts
            // Only render hands within a window around the current viewport
            if (parallelHands.length >= 150) {
              const columnsCount = getColumnsPerRow(parallelHands.length);
              const bufferSize = columnsCount * 3; // Keep 3 rows worth as buffer
              
              // Calculate viewport-relative rendering window
              // Remove hands that have scrolled far above the viewport
              if (index < visibleStartIndex - bufferSize) {
                return null;
              }
              
              // Also limit rendering to a reasonable window below the viewport
              // Keep enough buffer to allow smooth scrolling and reveal animation
              // But don't render everything - limit to ~15 rows beyond visible area
              const maxRenderIndex = visibleStartIndex + (columnsCount * 15);
              if (index > maxRenderIndex && index > revealedCount - (columnsCount * 5)) {
                // Skip if beyond render window AND not in the recent reveal zone
                // (keep last 5 rows of revealed hands always rendered)
                return null;
              }
            }
            
            // Calculate the streak multiplier that applies to THIS hand
            // Start with initial counter and process all hands UP TO AND INCLUDING this one
            let streakForThisHand = initialStreakCounter;
            
            // First, apply streak changes from all PREVIOUS hands
            for (let i = 0; i < index; i++) {
              const prevHand = parallelHands[i];
              const prevResult = PokerEvaluator.evaluate(prevHand.cards);
              const prevWithRewards = PokerEvaluator.applyRewards(prevResult, rewardTable);
              const prevScored = prevWithRewards.multiplier > 0;
              streakForThisHand = prevScored ? streakForThisHand + 1 : Math.max(0, streakForThisHand - 1);
            }
            
            // Calculate multiplier BEFORE evaluating current hand (this is the active multiplier)
            const multiplierForThisHand = calculateStreakMultiplier(streakForThisHand, gameConfig.streakMultiplier);
            
            // Now evaluate current hand to see if it will affect the NEXT hand's streak
            const currentResult = PokerEvaluator.evaluate(hand.cards);
            const currentWithRewards = PokerEvaluator.applyRewards(currentResult, rewardTable);
            const currentScored = currentWithRewards.multiplier > 0;
            
            // Update streak for next hand (but don't use this for current hand's display)
            if (currentScored) {
              streakForThisHand += 1;
            } else {
              streakForThisHand = Math.max(0, streakForThisHand - 1);
            }
            
            return (
              <React.Fragment key={hand.id}>
                {renderHandCard(hand, rewardTable, betAmount, index, multiplierForThisHand)}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
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

function getStreakTier(multiplier: number): string {
  if (multiplier >= 2.5) return 'red';
  if (multiplier >= 2.0) return 'orange';
  if (multiplier >= 1.5) return 'gold';
  return 'gray';
}
