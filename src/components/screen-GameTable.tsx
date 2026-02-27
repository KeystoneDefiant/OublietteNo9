import { useState, useEffect } from 'react';
import { Card as CardType, Hand, FailureStateType, GameState } from '../types';
import { Card } from './Card';
import { GameHeader } from './GameHeader';
import { DevilsDealCard } from './DevilsDealCard';
import { gameConfig } from '../config/gameConfig';

/**
 * GameTable screen component props
 *
 * Main gameplay screen where players view their dealt hand, select cards
 * to hold, and draw parallel hands.
 *
 * **Keyboard navigation**: Arrow keys move between cards; Enter/Space toggles hold
 * on focused card or triggers Draw/Play when focused on the action button.
 */
interface GameTableProps {
  /** The player's current 5-card hand */
  playerHand: CardType[];
  /** Array of indices (0-4) representing which cards are held */
  heldIndices: number[];
  /** Array of parallel hands after drawing */
  parallelHands: Hand[];
  /** Current player credits */
  credits: number;
  /** Number of parallel hands selected */
  selectedHandCount: number;
  /** Current round number */
  round: number;
  /** Total earnings across all rounds */
  totalEarnings: number;
  /** Whether at least one draw has been performed this hand (affects card back display) */
  firstDrawComplete: boolean;
  /** True = next click does a draw; false = next click plays parallel hands */
  nextActionIsDraw: boolean;
  /** Failure state for endless mode */
  failureState?: FailureStateType;
  /** Complete game state for Devil's Deal and other features */
  gameState?: GameState;
  /** Callback to toggle hold state for a card */
  onToggleHold: (index: number) => void;
  /** Callback to toggle Devil's Deal card hold state */
  onToggleDevilsDealHold: () => void;
  /** Callback to draw parallel hands */
  onDraw: () => void;
  /** Music enabled state */
  musicEnabled?: boolean;
  /** Sound effects enabled state */
  soundEffectsEnabled?: boolean;
  /** Toggle music callback */
  onToggleMusic?: () => void;
  /** Toggle sound effects callback */
  onToggleSoundEffects?: () => void;
  /** Show payout table modal callback */
  onShowPayoutTable?: () => void;
  /** Animation speed mode (1 | 2 | 3 | 'skip') */
  animationSpeedMode?: 1 | 2 | 3 | 'skip';
  /** Cycle animation speed callback */
  onCycleAnimationSpeed?: () => void;
}

/**
 * GameTable screen component
 *
 * Core gameplay screen where players:
 * - View their dealt 5-card hand
 * - Click cards to hold/unhold (max 5 total including Devil's Deal)
 * - View Devil's Deal offer if triggered
 * - Draw parallel hands when ready
 *
 * Handles card flip animations, Devil's Deal interactions, and
 * enforces 5-card hold limit across regular and Devil's Deal cards.
 *
 * @example
 * <GameTable
 *   playerHand={[card1, card2, card3, card4, card5]}
 *   heldIndices={[0, 2, 4]}
 *   onToggleHold={(index) => toggleHold(index)}
 *   onDraw={drawHands}
 *   {...otherProps}
 * />
 */
export function GameTable({
  playerHand,
  heldIndices,
  parallelHands,
  credits,
  selectedHandCount,
  round,
  totalEarnings,
  firstDrawComplete,
  failureState,
  gameState,
  musicEnabled,
  soundEffectsEnabled,
  onToggleHold,
  onToggleDevilsDealHold,
  onDraw,
  onToggleMusic,
  onToggleSoundEffects,
  onShowPayoutTable,
  animationSpeedMode = 1,
  onCycleAnimationSpeed,
}: GameTableProps) {
  const canDraw = parallelHands.length === 0 && playerHand.length >= 5;
  const efficiency = round > 0 ? (totalEarnings / round).toFixed(2) : '0.00';

  // Keyboard navigation: arrow keys for cards, Enter/Space for actions
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const cardCount = playerHand.length + (gameState?.devilsDealCard ? 1 : 0);
  const maxIndex = cardCount; // cardCount = draw button focus position

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

  // Get random quip for Devil's Deal
  const [devilsDealQuip, setDevilsDealQuip] = useState<string>('');
  useEffect(() => {
    if (gameState?.devilsDealCard) {
      const quips = gameConfig.quips.devilsDeal;
      const randomQuip = quips[Math.floor(Math.random() * quips.length)];
      setDevilsDealQuip(randomQuip);
    }
  }, [gameState?.devilsDealCard]);

  return (
    <div id="gameTable-screen" className="min-h-screen p-6 relative overflow-hidden select-none">
      <div className="max-w-7xl mx-auto relative z-0">
        {/* Header */}
        <GameHeader
          credits={credits}
          round={round}
          efficiency={efficiency}
          failureState={failureState}
          gameState={gameState}
          musicEnabled={musicEnabled}
          soundEffectsEnabled={soundEffectsEnabled}
          onToggleMusic={onToggleMusic}
          onToggleSoundEffects={onToggleSoundEffects}
          onShowPayoutTable={onShowPayoutTable}
          animationSpeedMode={animationSpeedMode}
          onCycleAnimationSpeed={onCycleAnimationSpeed}
        />

        <div className="grid grid-cols-1 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-1">
            {/* Player Hand - Card Selection Screen */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Hand</h2>
              <div className="flex gap-4 justify-center flex-wrap relative" role="group" aria-label="Your hand - use arrow keys to select, Enter or Space to hold">
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

              <div className="mt-4 text-center">
                {Math.max(
                  0,
                  (gameState?.maxDraws ?? 0) - (gameState?.drawsCompletedThisRound ?? 0) - 1
                ) > 0 ? (
                  <>
                    <p className="text-gray-600 mb-2">
                      Hold the cards you want to keep, then draw. Draws left:{' '}
                      {Math.max(
                        0,
                        (gameState?.maxDraws ?? 0) - (gameState?.drawsCompletedThisRound ?? 0) - 1
                      )}
                    </p>
                    <button
                      onClick={onDraw}
                      disabled={!canDraw}
                      tabIndex={focusedIndex === cardCount ? 0 : -1}
                      className={`
                          px-8 py-3 rounded-lg font-bold text-lg transition-colors
                          ${canDraw ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
                          ${focusedIndex === cardCount ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                        `}
                    >
                      Draw
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-gray-600 mb-2">
                      Hold the cards you want to keep, then play parallel hands.
                    </p>
                    <button
                      onClick={onDraw}
                      disabled={!canDraw}
                      tabIndex={focusedIndex === cardCount ? 0 : -1}
                      className={`
                          px-8 py-3 rounded-lg font-bold text-lg transition-colors
                          ${canDraw ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
                          ${focusedIndex === cardCount ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                        `}
                    >
                      Play {selectedHandCount} Parallel Hands
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
