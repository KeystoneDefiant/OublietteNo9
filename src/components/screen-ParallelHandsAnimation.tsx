import { useEffect } from 'react';
import { Hand, RewardTable } from '../types';
import { PokerEvaluator } from '../utils/pokerEvaluator';
import { gameConfig } from '../config/gameConfig';
import './screen-ParallelHandsAnimation.css';

interface ParallelHandsAnimationProps {
  parallelHands: Hand[];
  rewardTable: RewardTable;
  selectedHandCount: number;
  onAnimationComplete: () => void;
}

export function ParallelHandsAnimation({
  parallelHands,
  rewardTable,
  selectedHandCount,
  onAnimationComplete,
}: ParallelHandsAnimationProps) {
  useEffect(() => {
    // Animation duration from gameConfig
    const animationDuration = gameConfig.animation.parallelHandsFloat;
    const timer = setTimeout(() => {
      onAnimationComplete();
    }, animationDuration);

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  const getRandomStartX = (index: number) => {
    // Use index as seed for deterministic randomness
    const seed = index * 12345;
    const random = Math.sin(seed) * 10000;
    const percentage = (random - Math.floor(random)) * 100;
    return percentage;
  };

  return (
    <div className="parallel-hands-animation-container select-none">
      <div className="animation-background"></div>
      <div className="hands-animation-area">
        {parallelHands.map((hand, index) => {
          const handResult = PokerEvaluator.evaluate(hand.cards);
          const withRewards = PokerEvaluator.applyRewards(handResult, rewardTable);
          const startX = getRandomStartX(index);

          return (
            <div
              key={hand.id}
              className="floating-hand"
              style={
                {
                  '--start-x': `${startX}%`,
                  '--animation-index': index,
                  '--total-hands': selectedHandCount,
                } as React.CSSProperties & {
                  '--start-x': string;
                  '--animation-index': number;
                  '--total-hands': number;
                }
              }
            >
              <div className="hand-content">
                <div className="hand-cards">
                  {hand.cards.map((card, cardIndex) => (
                    <div
                      key={cardIndex}
                      className="hand-card-small"
                      title={`${card.rank}${card.suit.charAt(0).toUpperCase()}`}
                    >
                      {card.rank}
                      <span className="suit">{getSuitSymbol(card.suit)}</span>
                    </div>
                  ))}
                </div>
                <div className="hand-score">
                  <div className="score-text">
                    {handResult.rank.replace('-', ' ').toUpperCase()}
                  </div>
                  <div className="score-value">{withRewards.multiplier}x</div>
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
