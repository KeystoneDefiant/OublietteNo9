import React, { useEffect, useState, useRef } from 'react';
import { Hand, RewardTable } from '../types';
import { PokerEvaluator } from '../utils/pokerEvaluator';
import { gameConfig } from '../config/gameConfig';
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
  /** Callback when animation completes */
  onAnimationComplete: () => void;
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
 * the hand rank, and credits won.
 * 
 * @param hand - The hand to render
 * @param rewardTable - Reward multipliers for payout calculation
 * @param betAmount - Bet amount for calculating credits won
 * @param index - Index for staggered animation delay
 * @returns JSX element representing the hand card
 */
function renderHandCard(
  hand: Hand,
  rewardTable: RewardTable,
  betAmount: number,
  index: number
): JSX.Element {
  const handResult = PokerEvaluator.evaluate(hand.cards);
  const withRewards = PokerEvaluator.applyRewards(handResult, rewardTable);
  const creditsWon = withRewards.multiplier * betAmount;

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
          <div className="score-value">{creditsWon} credits</div>
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
  onAnimationComplete,
}: ParallelHandsAnimationProps) {
  const [revealedCount, setRevealedCount] = useState(0);
  const [scrollOffset, setScrollOffset] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);
  const lastRowHeightRef = useRef<number>(0);

  const columnsPerRow = getColumnsPerRow(parallelHands.length);

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
  const completionDelay = gameConfig.animation.parallelHandsAnimation.completionDelay;

  // Reveal hands one by one
  useEffect(() => {
    if (revealedCount < parallelHands.length) {
      const timer = setTimeout(() => {
        setRevealedCount((prev) => prev + 1);
      }, handRevealInterval);

      return () => clearTimeout(timer);
    } else if (revealedCount === parallelHands.length && parallelHands.length > 0) {
      // All hands revealed, wait a moment then complete
      const timer = setTimeout(() => {
        onAnimationComplete();
      }, completionDelay);

      return () => clearTimeout(timer);
    }
  }, [revealedCount, parallelHands.length, handRevealInterval, completionDelay, onAnimationComplete]);

  // Smooth scroll as new hands are revealed
  useEffect(() => {
    if (!gridRef.current || revealedCount === 0) return;

    // Get actual measurements from the grid
    const firstCard = gridRef.current.querySelector('.grid-hand-card');
    if (!firstCard) return;

    const cardRect = firstCard.getBoundingClientRect();
    const handCardHeight = cardRect.height;
    const rowGap = 16;

    // Calculate the row of the most recently revealed hand
    const currentRow = Math.ceil(revealedCount / columnsPerRow);

    // Calculate how many rows fit in the viewport (with padding)
    const viewportHeight = window.innerHeight - 80; // Account for padding
    const rowsInViewport = Math.floor(viewportHeight / (handCardHeight + rowGap));

    // Add buffer: only scroll when we're 1 row beyond capacity
    // This keeps cards visible longer
    const scrollThreshold = rowsInViewport + 1;

    // Start scrolling only when we exceed viewport + buffer
    if (currentRow > scrollThreshold) {
      const rowsToScroll = currentRow - scrollThreshold;
      const targetScroll = rowsToScroll * (handCardHeight + rowGap);

      setScrollOffset(targetScroll);
    }
  }, [revealedCount, columnsPerRow, parallelHands.length]);

  // Store row height for smooth transitions
  useEffect(() => {
    if (gridRef.current) {
      const firstChild = gridRef.current.firstElementChild;
      if (firstChild) {
        lastRowHeightRef.current = firstChild.clientHeight;
      }
    }
  }, [revealedCount]);

  // Single rendering path for all hand counts
  return (
    <div className="parallel-hands-animation-container select-none">
      <div className="animation-background"></div>
      <div className="hands-grid-viewport">
        <div
          ref={gridRef}
          className="hands-grid"
          data-columns={columnsPerRow}
          style={{
            transform: `translateY(-${scrollOffset}px)`,
            transition: `transform ${gameConfig.animation.parallelHandsAnimation.scrollDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
          }}
        >
          {parallelHands.slice(0, revealedCount).map((hand, index) => (
            <React.Fragment key={hand.id}>
              {renderHandCard(hand, rewardTable, betAmount, index)}
            </React.Fragment>
          ))}
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
