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
  clubs: 'text-slate-300',
  spades: 'text-slate-300',
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
          ${isHeld ? 'ring-2 ring-[var(--game-accent-gold)]' : ''}
        `}
        data-held={isHeld}
        style={{
          ...(isHeld
            ? {
                borderColor: 'var(--game-accent-gold)',
                backgroundColor: 'var(--game-card-background)',
                boxShadow: '0 0 12px var(--game-accent-gold-glow)',
                '--tw-ring-color': 'var(--game-accent-gold)',
              }
            : {
                borderColor: 'var(--game-border)',
                backgroundColor: 'var(--game-card-background)',
              }),
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
          border rounded-lg shadow-md
          flex items-center justify-center
          transition-transform duration-500
          border-[var(--game-border)]
        `}
        style={{
          background: 'linear-gradient(145deg, var(--game-bg-elevated) 0%, var(--game-bg-panel) 100%)',
          transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)',
          transformStyle: 'preserve-3d',
          zIndex: isFlipped ? 2 : 1,
        }}
      >
        <div className="text-xs font-bold" style={{ color: 'var(--game-text-muted)' }}>POKER</div>
      </div>
    </div>
  );
}
