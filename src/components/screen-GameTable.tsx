import { useState, useEffect } from 'react';
import { Card as CardType, Hand, FailureStateType, GameState } from '../types';
import { Card } from './Card';
import { GameHeader } from './GameHeader';
import { DevilsDealCard } from './DevilsDealCard';
import { GameButton } from './GameButton';
import { gameConfig } from '../config/gameConfig';

interface GameTableProps {
  playerHand: CardType[];
  heldIndices: number[];
  parallelHands: Hand[];
  credits: number;
  selectedHandCount: number;
  round: number;
  totalEarnings: number;
  firstDrawComplete: boolean;
  nextActionIsDraw: boolean;
  failureState?: FailureStateType;
  gameState?: GameState;
  onToggleHold: (index: number) => void;
  onToggleDevilsDealHold: () => void;
  onDraw: () => void;
  onShowPayoutTable?: () => void;
  onShowSettings?: () => void;
}

export function GameTable({
  playerHand,
  heldIndices,
  parallelHands,
  credits,
  selectedHandCount,
  round,
  firstDrawComplete,
  failureState,
  gameState,
  onToggleHold,
  onToggleDevilsDealHold,
  onDraw,
  onShowPayoutTable,
  onShowSettings,
}: GameTableProps) {
  const canDraw = parallelHands.length === 0 && playerHand.length >= 5;

  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const cardCount = playerHand.length + (gameState?.devilsDealCard ? 1 : 0);
  const maxIndex = cardCount;

  useEffect(() => {
    setFocusedIndex((prev) => Math.min(prev, maxIndex));
  }, [maxIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (cardCount === 0) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(maxIndex, prev + 1));
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (focusedIndex < playerHand.length) {
          onToggleHold(focusedIndex);
        } else if (focusedIndex < cardCount && gameState?.devilsDealCard && heldIndices.length < 5) {
          onToggleDevilsDealHold();
        } else if (focusedIndex === cardCount && canDraw) {
          onDraw();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, cardCount, maxIndex, playerHand.length, canDraw, onToggleHold, onToggleDevilsDealHold, onDraw, gameState?.devilsDealCard, heldIndices.length]);

  const [devilsDealQuip, setDevilsDealQuip] = useState<string>('');
  useEffect(() => {
    if (gameState?.devilsDealCard) {
      const quips = gameConfig.quips.devilsDeal;
      setDevilsDealQuip(quips[Math.floor(Math.random() * quips.length)]);
    }
  }, [gameState?.devilsDealCard]);

  return (
    <div id="gameTable-screen" className="min-h-screen min-h-[100dvh] p-4 sm:p-6 relative overflow-hidden select-none">
      <div className="max-w-4xl mx-auto relative z-0 flex flex-col min-h-[calc(100dvh-2rem)]">
        <GameHeader
          credits={credits}
          round={round}
          failureState={failureState}
          gameState={gameState}
          onShowPayoutTable={onShowPayoutTable}
          onShowSettings={onShowSettings}
        />

        <div className="game-panel rounded-xl p-4 sm:p-6 flex-1 flex flex-col">
          <h2 className="text-xl sm:text-2xl font-bold mb-4" style={{ color: 'var(--game-accent-gold)' }}>
            Your Hand
          </h2>

          <div
            className="flex gap-2 sm:gap-4 justify-center flex-wrap relative min-h-[140px] sm:min-h-[180px]"
            role="group"
            aria-label="Your hand - use arrow keys to select, Enter or Space to hold"
          >
            {playerHand.map((card, index) => (
              <Card
                key={card.id}
                card={card}
                isHeld={heldIndices.includes(index)}
                onClick={() => {
                  setFocusedIndex(index);
                  onToggleHold(index);
                }}
                size="large"
                showBack={!firstDrawComplete}
                flipDelay={index * 100}
                tabIndex={index === focusedIndex ? 0 : -1}
                data-focused={index === focusedIndex}
              />
            ))}
            {gameState?.devilsDealCard && (
              <DevilsDealCard
                card={gameState.devilsDealCard}
                cost={gameState.devilsDealCost}
                quip={devilsDealQuip}
                isHeld={gameState.devilsDealHeld}
                isDisabled={heldIndices.length >= 5 && !gameState.devilsDealHeld}
                onHold={onToggleDevilsDealHold}
              />
            )}
          </div>

          <div className="mt-4 sm:mt-6 text-center">
            {Math.max(0, (gameState?.maxDraws ?? 0) - (gameState?.drawsCompletedThisRound ?? 0) - 1) > 0 ? (
              <>
                <p className="mb-2 text-sm sm:text-base" style={{ color: 'var(--game-text-muted)' }}>
                  Hold the cards you want to keep, then draw. Draws left:{' '}
                  {Math.max(0, (gameState?.maxDraws ?? 0) - (gameState?.drawsCompletedThisRound ?? 0) - 1)}
                </p>
                <GameButton
                  onClick={onDraw}
                  disabled={!canDraw}
                  tabIndex={focusedIndex === cardCount ? 0 : -1}
                  variant={canDraw ? 'primary' : 'ghost'}
                  size="lg"
                  className={focusedIndex === cardCount ? 'ring-2 ring-[var(--game-accent-gold)] ring-offset-2 ring-offset-[var(--game-bg-card)]' : ''}
                >
                  Draw
                </GameButton>
              </>
            ) : (
              <>
                <p className="mb-2 text-sm sm:text-base" style={{ color: 'var(--game-text-muted)' }}>
                  Hold the cards you want to keep, then play parallel hands.
                </p>
                <GameButton
                  onClick={onDraw}
                  disabled={!canDraw}
                  tabIndex={focusedIndex === cardCount ? 0 : -1}
                  variant={canDraw ? 'secondary' : 'ghost'}
                  size="lg"
                  className={focusedIndex === cardCount ? 'ring-2 ring-[var(--game-accent-gold)] ring-offset-2 ring-offset-[var(--game-bg-card)]' : ''}
                >
                  Play {selectedHandCount} Parallel Hands
                </GameButton>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
