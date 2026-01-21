import { useEffect, useState } from 'react';
import { Hand, RewardTable } from '../types';
import { PokerEvaluator } from '../utils/pokerEvaluator';
import { gameConfig } from '../config/gameConfig';
import './screen-ParallelHandsAnimation.css';

interface ParallelHandsAnimationProps {
  parallelHands: Hand[];
  rewardTable: RewardTable;
  selectedHandCount: number;
  betAmount: number;
  onAnimationComplete: () => void;
}

export function ParallelHandsAnimation({
  parallelHands,
  rewardTable,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selectedHandCount: _selectedHandCount,
  betAmount,
  onAnimationComplete,
}: ParallelHandsAnimationProps) {
  const [startedHands, setStartedHands] = useState<Set<number>>(new Set());

  // Duration for each individual hand animation (in milliseconds)
  const handAnimationDuration = gameConfig.animation.parallelHandsFloat;

  // Calculate how many hands to show simultaneously based on total hand count
  // Pattern: 50 hands = 2 at once, 100 hands = 3 at once, 150 hands = 4 at once, etc.
  const handsPerBatch = Math.max(1, Math.floor(parallelHands.length / 50) + 1);

  useEffect(() => {
    // Start showing the first batch after a brief delay
    if (parallelHands.length > 0 && startedHands.size === 0) {
      const initialDelay = 100; // Small delay before first batch appears
      const timer = setTimeout(() => {
        // Start first batch of hands
        const firstBatch = Array.from({ length: Math.min(handsPerBatch, parallelHands.length) }, (_, i) => i);
        setStartedHands(new Set(firstBatch));
      }, initialDelay);

      return () => clearTimeout(timer);
    }
  }, [parallelHands.length, startedHands.size, handsPerBatch]);

  useEffect(() => {
    // Advance to next batch 0.1s (100ms) after current batch starts
    const startedIndices = Array.from(startedHands).sort((a, b) => a - b);
    const maxStartedIndex = startedIndices.length > 0 ? Math.max(...startedIndices) : -1;
    
    if (maxStartedIndex >= 0 && maxStartedIndex < parallelHands.length - 1) {
      // Calculate how many hands are left to show
      const remainingHands = parallelHands.length - (maxStartedIndex + 1);
      const nextBatchSize = Math.min(handsPerBatch, remainingHands);
      
      // Show next batch 100ms after current batch starts
      const nextHandDelay = 100;
      
      const timer = setTimeout(() => {
        // Start next batch of hands
        const nextBatch = Array.from(
          { length: nextBatchSize },
          (_, i) => maxStartedIndex + 1 + i
        );
        setStartedHands((prev) => new Set([...prev, ...nextBatch]));
      }, nextHandDelay);

      return () => clearTimeout(timer);
    }
  }, [startedHands, parallelHands.length, handsPerBatch]);

  // Handle completion callback - wait for last hand to finish
  useEffect(() => {
    const maxStartedIndex = Math.max(...Array.from(startedHands), -1);
    if (
      maxStartedIndex >= 0 &&
      maxStartedIndex === parallelHands.length - 1 &&
      startedHands.size === parallelHands.length
    ) {
      // Wait for last hand to complete its full animation
      const timer = setTimeout(() => {
        onAnimationComplete();
      }, handAnimationDuration);

      return () => clearTimeout(timer);
    }
  }, [startedHands, parallelHands.length, handAnimationDuration, onAnimationComplete]);

  const getRandomStartX = (index: number) => {
    // Use index as seed for deterministic randomness
    const seed = index * 12345;
    const random = Math.sin(seed) * 10000;
    const percentage = (random - Math.floor(random)) * 100;
    
    // Constrain to keep hands visible on screen
    // Hand width is ~280px, so we need at least 140px margin on each side
    // Constrain to 20% - 80% to ensure full visibility
    const minPercent = 20;
    const maxPercent = 80;
    return minPercent + (percentage * (maxPercent - minPercent) / 100);
  };

  // Render all started hands so they can complete their animations
  return (
    <div className="parallel-hands-animation-container select-none">
      <div className="animation-background"></div>
      <div className="hands-animation-area">
        {Array.from(startedHands).map((handIndex) => {
          const hand = parallelHands[handIndex];
          const handResult = PokerEvaluator.evaluate(hand.cards);
          const withRewards = PokerEvaluator.applyRewards(handResult, rewardTable);
          const startX = getRandomStartX(handIndex);
          const creditsWon = withRewards.multiplier * betAmount;

          return (
            <div
              key={hand.id}
              className="floating-hand"
              style={
                {
                  '--start-x': `${startX}%`,
                  '--hand-duration': `${handAnimationDuration}ms`,
                } as React.CSSProperties & {
                  '--start-x': string;
                  '--hand-duration': string;
                }
              }
            >
              <div className="hand-content">
                <div className="hand-cards">
                  {hand.cards.map((card, cardIndex) => {
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
        })}
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
