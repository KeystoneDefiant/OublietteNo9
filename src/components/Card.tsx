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
  hearts: 'text-red-600',
  diamonds: 'text-red-600',
  clubs: 'text-black',
  spades: 'text-black',
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
        ${dataFocused ? 'ring-2 ring-blue-500 ring-offset-2 outline-none' : ''}
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
          border-2 rounded-lg shadow-md
          flex flex-col items-center justify-center
          transition-transform duration-500
          ${isHeld ? 'border-yellow-500 bg-yellow-50 ring-2 ring-yellow-300' : 'border-gray-300 bg-white'}
        `}
        style={{
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          transformStyle: 'preserve-3d',
          zIndex: isFlipped ? 1 : 2,
        }}
      >
        <div className="flex flex-col items-center justify-center h-full">
          {card.isDead ? (
            <div className="text-4xl">💀</div>
          ) : card.isWild ? (
            <div className="text-orange-600 font-bold text-lg">WILD</div>
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
          border-2 rounded-lg shadow-md
          flex items-center justify-center
          transition-transform duration-500
          border-purple-600 bg-gradient-to-br from-purple-600 to-purple-800
        `}
        style={{
          transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)',
          transformStyle: 'preserve-3d',
          zIndex: isFlipped ? 2 : 1,
        }}
      >
        <div className="text-white text-xs font-bold">POKER</div>
      </div>
    </div>
  );
}
