import { useState, useEffect, useMemo } from 'react';
import { GameHeader } from './GameHeader';
import { GameButton } from './GameButton';
import { FailureStateType, GameOverReason, GameState } from '../types';
import { formatCredits } from '../utils/format';
import { getFailureStateDescription, getEndlessModeConditions } from '../utils/failureConditions';

interface PreDrawProps {
  credits: number;
  handCount: number;
  selectedHandCount: number;
  betAmount: number;
  minimumBet: number;
  rewardTable: { [key: string]: number };
  gameOver: boolean;
  round: number;
  totalEarnings: number;
  failureState?: FailureStateType;
  gameState?: GameState;
  onSetBetAmount: (amount: number) => void;
  onSetSelectedHandCount: (count: number) => void;
  onDealHand: () => void;
  onEndRun: (reason?: GameOverReason) => void;
  onShowPayoutTable?: () => void;
  onShowSettings?: () => void;
}

export function PreDraw({
  credits,
  handCount,
  selectedHandCount,
  betAmount,
  minimumBet,
  gameOver,
  round,
  failureState,
  gameState,
  onSetBetAmount,
  onSetSelectedHandCount,
  onDealHand,
  onEndRun,
  onShowPayoutTable,
  onShowSettings,
}: PreDrawProps) {
  const [showEndRunConfirm, setShowEndRunConfirm] = useState(false);

  useEffect(() => {
    if (selectedHandCount !== handCount) onSetSelectedHandCount(handCount);
    if (betAmount !== minimumBet) onSetBetAmount(minimumBet);
  }, [handCount, minimumBet, selectedHandCount, betAmount, onSetSelectedHandCount, onSetBetAmount]);

  useEffect(() => {
    if (gameOver) {
      onEndRun();
      return;
    }
    const minCost = minimumBet * handCount;
    if (credits < minCost) onEndRun('insufficient-credits');
  }, [credits, minimumBet, handCount, gameOver, onEndRun]);

  const totalBetCost = useMemo(() => minimumBet * handCount, [minimumBet, handCount]);
  const canAffordBet = useMemo(() => credits >= totalBetCost, [credits, totalBetCost]);
  const canPlayRound = useMemo(() => !gameOver && canAffordBet, [gameOver, canAffordBet]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showEndRunConfirm) return;
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
  }, [canPlayRound, onDealHand, showEndRunConfirm]);

  return (
    <div
      id="preDraw-screen"
      className="min-h-[100dvh] p-4 sm:p-6 relative overflow-hidden select-none"
      role="main"
    >
      <div className="max-w-4xl mx-auto relative z-0 flex flex-col min-h-[calc(100dvh-2rem)]">
        {/* Header row */}
        <div className="mb-4 sm:mb-6">
          <GameHeader
            credits={credits}
            round={round}
            failureState={failureState}
            gameState={gameState}
            hideFailureInHeader
            onShowPayoutTable={onShowPayoutTable}
            onShowSettings={onShowSettings}
          />
        </div>

        {/* Main content - flex to fill */}
        <div className="game-panel rounded-xl p-4 sm:p-6 md:p-8 flex-1 flex flex-col">
          <h1
            className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-center"
            style={{ color: 'var(--game-accent-gold)' }}
          >
            {gameOver ? 'Game Over' : 'Ready to Play?'}
          </h1>

          {gameState?.isEndlessMode && !gameOver && (() => {
            const conditions = getEndlessModeConditions(gameState);
            if (conditions.length === 0) return null;
            return (
              <div
                className="rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-[var(--game-accent-gold)]"
                style={{ background: 'rgba(201, 162, 39, 0.12)', boxShadow: '0 0 20px var(--game-accent-gold-glow)' }}
              >
                <p className="text-sm font-semibold mb-2" style={{ color: 'var(--game-accent-gold)' }}>
                  End Game Active
                </p>
                <p className="text-sm mb-3" style={{ color: 'var(--game-text)' }}>
                  You must meet these conditions to survive each round:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm font-medium" style={{ color: 'var(--game-text)' }}>
                  {conditions.map((condition, i) => (
                    <li key={i}>{condition}</li>
                  ))}
                </ul>
              </div>
            );
          })()}

          {failureState && gameState && !gameOver && (
            <div
              className="rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-[var(--game-accent-red)]"
              style={{ background: 'rgba(139, 21, 32, 0.25)', boxShadow: '0 0 12px var(--game-accent-red-glow)' }}
            >
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--game-accent-red-bright)' }}>
                ⚠️ Failure Condition
              </p>
              <p className="text-sm font-medium" style={{ color: 'var(--game-text)' }}>
                {getFailureStateDescription(failureState, gameState)}
              </p>
            </div>
          )}

          {gameOver && (
            <div
              className="rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-[var(--game-accent-red)]"
              style={{ background: 'rgba(139, 21, 32, 0.25)' }}
            >
              <p className="text-base sm:text-lg font-semibold mb-2" style={{ color: 'var(--game-accent-red-bright)' }}>
                Insufficient Credits
              </p>
              <p className="mb-2 text-sm sm:text-base" style={{ color: 'var(--game-text)' }}>
                You need at least {formatCredits(minimumBet * handCount)} credits to play.
              </p>
              <p className="text-sm sm:text-base" style={{ color: 'var(--game-text)' }}>
                The game has ended because you cannot afford the next round.
              </p>
            </div>
          )}

          <div className="space-y-4 sm:space-y-6 flex-1">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="game-panel-muted rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-center">
                <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--game-text-muted)' }}>Bet</p>
                <p className="text-base sm:text-lg font-bold" style={{ color: 'var(--game-text)' }}>
                  {formatCredits(minimumBet)}
                </p>
              </div>
              <div className="game-panel-muted rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-center">
                <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--game-text-muted)' }}>Hands</p>
                <p className="text-base sm:text-lg font-bold" style={{ color: 'var(--game-text)' }}>{handCount}</p>
              </div>
              <div className="game-panel-muted rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-center">
                <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--game-text-muted)' }}>Cost</p>
                <p className="text-base sm:text-lg font-bold" style={{ color: 'var(--game-accent-gold)' }}>
                  {formatCredits(totalBetCost)}
                </p>
              </div>
            </div>

            <GameButton
              onClick={onDealHand}
              disabled={!canPlayRound}
              variant="primary"
              size="lg"
              fullWidth
              aria-label={
                gameOver
                  ? 'Cannot play - game over'
                  : `Run round with ${handCount} hands at ${formatCredits(minimumBet)} credits per hand`
              }
              aria-disabled={!canPlayRound}
            >
              {gameOver ? 'Cannot Play - Game Over' : 'Run Round'}
            </GameButton>

            <GameButton
              onClick={() => setShowEndRunConfirm(true)}
              variant="ghost"
              size="lg"
              fullWidth
              aria-label="End current run and return to main menu"
            >
              End Run
            </GameButton>
          </div>
        </div>
      </div>

      {showEndRunConfirm && (
        <div
          className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4"
          onClick={() => setShowEndRunConfirm(false)}
        >
          <div
            className="game-panel rounded-xl p-6 sm:p-8 max-w-md w-full border border-[var(--game-border)]"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-4" style={{ color: 'var(--game-accent-gold)' }}>
              End Run?
            </h2>
            <p className="mb-6 text-sm sm:text-base" style={{ color: 'var(--game-text-muted)' }}>
              Are you sure you want to end your run? You will return to the main menu.
            </p>
            <div className="flex gap-3">
              <GameButton onClick={() => setShowEndRunConfirm(false)} variant="ghost" size="md" className="flex-1">
                Cancel
              </GameButton>
              <GameButton
                onClick={() => {
                  setShowEndRunConfirm(false);
                  onEndRun();
                }}
                variant="primary"
                size="md"
                className="flex-1"
              >
                Confirm End Run
              </GameButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
