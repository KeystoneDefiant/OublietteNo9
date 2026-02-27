import { useState, useEffect, useMemo } from 'react';
import { CheatsModal } from './CheatsModal';
import { GameHeader } from './GameHeader';
import { FailureStateType, GameOverReason, GameState } from '../types';
import { formatCredits } from '../utils/format';
import { getFailureStateDescription, getEndlessModeConditions } from '../utils/failureConditions';

/**
 * PreDraw screen component props
 *
 * Screen where players configure their bet amount and number of parallel hands
 * before dealing. Includes validation, affordability checks, and bet efficiency
 * calculations.
 *
 * **Keyboard**: Enter or Space triggers Run Round when the round can be played
 * (no modal open, sufficient credits).
 */
interface PreDrawProps {
  /** Current player credits */
  credits: number;
  /** Maximum hand count available */
  handCount: number;
  /** Currently selected number of hands */
  selectedHandCount: number;
  /** Bet amount per hand */
  betAmount: number;
  /** Minimum bet required for current round */
  minimumBet: number;
  /** Payout multipliers for each hand rank */
  rewardTable: { [key: string]: number };
  /** Whether game is in game over state */
  gameOver: boolean;
  /** Current round number */
  round: number;
  /** Total earnings across all rounds */
  totalEarnings: number;
  /** Failure state information for endless mode */
  failureState?: FailureStateType;
  /** Complete game state for additional context */
  gameState?: GameState;
  /** Callback to update bet amount */
  onSetBetAmount: (amount: number) => void;
  /** Callback to update selected hand count */
  onSetSelectedHandCount: (count: number) => void;
  /** Callback to deal initial hand */
  onDealHand: () => void;
  /** Callback to end current run; pass reason when auto-triggered (e.g. insufficient credits) */
  onEndRun: (reason?: GameOverReason) => void;
  /** Cheat callback to add credits */
  onCheatAddCredits: (amount: number) => void;
  /** Cheat callback to add hands */
  onCheatAddHands: (amount: number) => void;
  /** Cheat callback to trigger Devil's Deal */
  onCheatSetDevilsDeal?: () => void;
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
 * PreDraw screen component
 *
 * Primary configuration screen before dealing a hand. Allows players to:
 * - Adjust bet amount (with min/max validation)
 * - Select number of parallel hands (up to available)
 * - View bet efficiency and total cost
 * - Access reward table and game information
 * - Deal hand when ready or end current run
 *
 * Includes comprehensive input validation with visual feedback and
 * auto-adjustment if previous bet becomes unaffordable in new round.
 *
 * @example
 * <PreDraw
 *   credits={5000}
 *   betAmount={10}
 *   selectedHandCount={20}
 *   minimumBet={5}
 *   onDealHand={handleDeal}
 *   {...otherProps}
 * />
 */
export function PreDraw({
  credits,
  handCount,
  selectedHandCount,
  betAmount,
  minimumBet,
  gameOver,
  round,
  totalEarnings,
  failureState,
  gameState,
  musicEnabled,
  soundEffectsEnabled,
  onSetBetAmount,
  onSetSelectedHandCount,
  onDealHand,
  onEndRun,
  onCheatAddCredits,
  onCheatAddHands,
  onCheatSetDevilsDeal,
  onToggleMusic,
  onToggleSoundEffects,
  onShowPayoutTable,
  animationSpeedMode = 1,
  onCycleAnimationSpeed,
}: PreDrawProps) {
  const [showCheats, setShowCheats] = useState(false);
  const [showEndRunConfirm, setShowEndRunConfirm] = useState(false);

  // Auto-set to max hands and min bet
  useEffect(() => {
    // Set to maximum available hands
    if (selectedHandCount !== handCount) {
      onSetSelectedHandCount(handCount);
    }
    // Set to minimum bet
    if (betAmount !== minimumBet) {
      onSetBetAmount(minimumBet);
    }
  }, [handCount, minimumBet, selectedHandCount, betAmount, onSetSelectedHandCount, onSetBetAmount]);

  // When game over (from returnToPreDraw: insufficient credits or failure condition),
  // go immediately to game over screen instead of leaving player stuck on PreDraw
  useEffect(() => {
    if (gameOver) {
      onEndRun();
      return;
    }

    const minCost = minimumBet * handCount;

    // If can't afford minimum, trigger game over with specific reason
    if (credits < minCost) {
      onEndRun('insufficient-credits');
    }
  }, [credits, minimumBet, handCount, gameOver, onEndRun]);

  // Memoize calculations
  const totalBetCost = useMemo(() => minimumBet * handCount, [minimumBet, handCount]);
  const canAffordBet = useMemo(() => credits >= totalBetCost, [credits, totalBetCost]);
  const canPlayRound = useMemo(() => !gameOver && canAffordBet, [gameOver, canAffordBet]);

  // Keyboard: Enter/Space to run round when can play
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showCheats || showEndRunConfirm) return;
      if ((e.key === 'Enter' || e.key === ' ') && canPlayRound) {
        const target = e.target as HTMLElement;
        if (!target.matches('input, textarea, [contenteditable]')) {
          e.preventDefault();
          onDealHand();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canPlayRound, onDealHand, showCheats, showEndRunConfirm]);
  const efficiency = useMemo(
    () => (round > 0 ? (totalEarnings / round).toFixed(2) : '0.00'),
    [round, totalEarnings]
  );

  return (
    <div
      id="preDraw-screen"
      className="min-h-screen p-6 relative overflow-hidden select-none"
      role="main"
    >
      <div className="max-w-7xl mx-auto relative z-0">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <GameHeader
            credits={credits}
            round={round}
            efficiency={efficiency}
            failureState={failureState}
            gameState={gameState}
            hideFailureInHeader
            musicEnabled={musicEnabled}
            soundEffectsEnabled={soundEffectsEnabled}
            onToggleMusic={onToggleMusic}
            onToggleSoundEffects={onToggleSoundEffects}
            onShowPayoutTable={onShowPayoutTable}
            animationSpeedMode={animationSpeedMode}
            onCycleAnimationSpeed={onCycleAnimationSpeed}
          />
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <button
              onClick={() => setShowCheats(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              aria-label="Open cheats menu"
            >
              Cheats
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-4xl font-bold mb-8 text-gray-800 text-center">
              {gameOver ? 'Game Over' : 'Ready to Play?'}
            </h1>

            {gameState?.isEndlessMode &&
              !gameOver &&
              (() => {
                const conditions = getEndlessModeConditions(gameState);
                if (conditions.length === 0) return null;
                return (
                  <div className="bg-amber-50 border-2 border-amber-400 rounded-lg p-6 mb-8">
                    <p className="text-sm font-semibold text-amber-900 mb-2">End Game Active</p>
                    <p className="text-sm text-amber-800 mb-3">
                      You must meet these conditions to survive each round:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm font-medium text-amber-800">
                      {conditions.map((condition, i) => (
                        <li key={i}>{condition}</li>
                      ))}
                    </ul>
                  </div>
                );
              })()}

            {failureState && gameState && !gameOver && (
              <div className="bg-red-50 border-2 border-red-400 rounded-lg p-6 mb-8">
                <p className="text-sm font-semibold text-red-800 mb-1">⚠️ Failure Condition</p>
                <p className="text-sm font-medium text-red-700">
                  {getFailureStateDescription(failureState, gameState)}
                </p>
              </div>
            )}

            {gameOver && (
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-8">
                <p className="text-lg font-semibold text-red-700 mb-2">Insufficient Credits</p>
                <p className="text-red-600 mb-2">
                  You need at least {formatCredits(minimumBet * handCount)} credits to play.
                </p>
                <p className="text-red-600">
                  The game has ended because you cannot afford the next round.
                </p>
              </div>
            )}

            <div className="space-y-6">
              <div role="group">
                <div className="flex items-center gap-3">
                  <div className="flex-1 px-4 py-3 border-2 border-gray-300 bg-gray-50 rounded-lg text-lg text-gray-700 font-semibold">
                    {formatCredits(minimumBet)} credits
                  </div>
                  <div className="flex-1 px-4 py-3 border-2 border-gray-300 bg-gray-50 rounded-lg text-lg text-gray-700 font-semibold">
                    {handCount} hands
                  </div>
                  <div className="flex-1 px-4 py-3 border-2 border-gray-300 bg-gray-50 rounded-lg text-lg text-gray-700 font-semibold">
                    {formatCredits(totalBetCost)} credits to play
                  </div>
                </div>
              </div>

              {/* Total Cost */}
              {/* <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200">
                  <p className="text-lg font-semibold text-gray-700 mb-1">Total Bet Cost:</p>
                  <p className="text-4xl font-bold text-blue-600">{totalBetCost} credits</p>
                  {!canAffordBet && (
                    <p className="text-red-600 text-sm mt-3">Insufficient credits for this bet</p>
                  )}
                  {gameOver && !canAffordBet && (
                    <p className="text-red-600 text-sm mt-2">
                      Reduce your bet or visit the Shop to add negative cards for credits.
                    </p>
                  )}
                </div> */}

              {/* Run Round Button */}
              <button
                onClick={onDealHand}
                disabled={!canPlayRound}
                className={`
                    w-full px-8 py-4 rounded-lg font-bold text-xl transition-colors
                    ${
                      canPlayRound
                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    }
                  `}
                aria-label={
                  gameOver
                    ? 'Cannot play - game over'
                    : `Run round with ${handCount} hands at ${formatCredits(
                        minimumBet
                      )} credits per hand`
                }
                aria-disabled={!canPlayRound}
              >
                {gameOver ? 'Cannot Play - Game Over' : 'Run Round'}
              </button>

              {/* End Run Button */}
              <button
                onClick={() => setShowEndRunConfirm(true)}
                className="w-full px-8 py-4 rounded-lg font-bold text-xl transition-colors bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl"
                aria-label="End current run and return to main menu"
              >
                End Run
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cheats Modal */}
      {showCheats && (
        <CheatsModal
          onClose={() => setShowCheats(false)}
          onAddCredits={onCheatAddCredits}
          onAddHands={onCheatAddHands}
          onSetDevilsDealCheat={onCheatSetDevilsDeal}
        />
      )}

      {/* End Run Confirmation Modal */}
      {showEndRunConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 select-none">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">End Run?</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to end your run? You will return to the main menu.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowEndRunConfirm(false)}
                className="flex-1 px-4 py-3 rounded-lg font-bold transition-colors bg-gray-600 hover:bg-gray-700 text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowEndRunConfirm(false);
                  onEndRun();
                }}
                className="flex-1 px-4 py-3 rounded-lg font-bold transition-colors bg-red-600 hover:bg-red-700 text-white"
              >
                Confirm End Run
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
