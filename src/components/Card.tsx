import { useState, useEffect } from 'react';
import { Card as CardType } from '../types';
import { gameConfig } from '../config/gameConfig';

interface CardProps {
  card: CardType;
  isHeld?: boolean;
  onClick?: () => void;
  size?: 'small' | 'medium' | 'large';
  showBack?: boolean;
  flipDelay?: number;
  /** For keyboard nav: 0 = focusable, -1 = not in tab order */
  tabIndex?: number;
  /** When true, shows focus ring for keyboard navigation */
  'data-focused'?: boolean;
}

const SUIT_SYMBOLS: { [key: string]: string } = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const SUIT_COLORS: { [key: string]: string } = {
  hearts: 'card-suit-red',
  diamonds: 'card-suit-red',
  clubs: 'card-suit-black',
  spades: 'card-suit-black',
};

const SIZE_CLASSES = {
  small: 'w-12 h-16 text-xs',
  medium: 'w-16 h-24 text-sm',
  large: 'w-20 h-32 text-base',
};

export function Card({
  card,
  isHeld = false,
  onClick,
  size = 'medium',
  showBack = false,
  flipDelay = 0,
  tabIndex,
  'data-focused': dataFocused,
}: CardProps) {
  const [isFlipped, setIsFlipped] = useState(showBack);
  const suitSymbol = SUIT_SYMBOLS[card.suit];
  const suitColor = SUIT_COLORS[card.suit];
  const sizeClass = SIZE_CLASSES[size];

  useEffect(() => {
    if (showBack) {
      setIsFlipped(true);
      const timer = setTimeout(() => {
        setIsFlipped(false);
      }, flipDelay + gameConfig.animation.cardFlip);
      return () => clearTimeout(timer);
    } else {
      setIsFlipped(false);
    }
  }, [showBack, flipDelay]);

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={tabIndex}
      className={`
        ${sizeClass}
        relative
        cursor-pointer transition-all
        ${onClick ? 'hover:scale-105 hover:shadow-lg' : ''}
        ${dataFocused ? '' : ''}
      `}
      onClick={onClick}
      onKeyDown={
        onClick && tabIndex === 0
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      style={{ perspective: '1000px' }}
    >
      {/* Card Front */}
      <div
        className={`
          absolute inset-0
          border rounded-lg shadow-md
          flex flex-col items-center justify-center
          transition-transform duration-500
          ${isHeld ? 'card-held' : ''}
        `}
        data-held={isHeld}
        style={{
          ...(isHeld ? {} : { borderColor: 'var(--game-card-border)' }),
          backgroundColor: 'var(--game-card-background)',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transformStyle: 'preserve-3d',
          zIndex: isFlipped ? 1 : 2,
        }}
      >
        <div className="flex flex-col items-center justify-center h-full">
          {card.isDead ? (
            <div className="text-4xl">💀</div>
          ) : card.isWild ? (
            <div className="font-bold text-lg" style={{ color: 'var(--game-card-wild-color)' }}>WILD</div>
          ) : (
            <>
              <div className={`font-bold ${suitColor}`}>{card.rank}</div>
              <div className={`text-2xl ${suitColor}`}>{suitSymbol}</div>
            </>
          )}
        </div>
      </div>

      {/* Card Back */}
      <div
        className={`
          absolute inset-0
          border rounded-lg shadow-md
          flex items-center justify-center
          transition-transform duration-500
          card-back
        `}
        style={{
          transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)',
          transformStyle: 'preserve-3d',
          zIndex: isFlipped ? 2 : 1,
        }}
      >
        <div className="text-xs font-bold card-back-text">POKER</div>
      </div>
    </div>
  );
}
