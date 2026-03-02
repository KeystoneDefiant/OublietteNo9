import { formatCredits } from '../utils/format';
import { getGameOverDisplay } from '../utils/gameOverDisplay';
import { GameOverReason, GameState } from '../types';
import { GameButton } from './GameButton';

interface GameOverProps {
  round: number;
  totalEarnings: number;
  credits: number;
  gameOverReason?: GameOverReason | null;
  gameState?: GameState | null;
  onReturnToMenu: () => void;
}

export function GameOver({
  round,
  totalEarnings,
  credits,
  gameOverReason,
  gameState,
  onReturnToMenu,
}: GameOverProps) {
  const efficiency = round > 0 ? (totalEarnings / round).toFixed(2) : '0.00';
  const display = getGameOverDisplay(
    gameOverReason ?? null,
    gameState ?? null,
    gameState ? { minimumBet: gameState.minimumBet, handCount: gameState.handCount } : undefined
  );

  return (
    <div
      className="min-h-screen min-h-[100dvh] flex items-center justify-center p-4 sm:p-6"
      style={{
        background: 'linear-gradient(180deg, #050508 0%, #0d0a0c 50%, #120e10 100%)',
      }}
    >
      <div
        className="game-panel rounded-2xl p-6 sm:p-8 max-w-lg w-full border border-[var(--game-border)]"
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(201, 162, 39, 0.08)' }}
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--game-accent-gold)' }}>
            {display.title}
          </h1>
          <p className="text-sm sm:text-base" style={{ color: 'var(--game-text-muted)' }}>
            {display.subtitle}
          </p>
        </div>

        <div className="space-y-4 mb-8">
          <div
            className="rounded-lg p-4 border border-[var(--game-accent-red)]"
            style={{ background: 'rgba(139, 21, 32, 0.2)' }}
          >
            <p className="text-base sm:text-lg font-semibold text-center" style={{ color: 'var(--game-accent-gold)' }}>
              Run Summary
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="game-panel-muted rounded-lg p-4 border border-[var(--game-border)]">
              <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--game-text-muted)' }}>
                Rounds Survived
              </p>
              <p className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--game-accent-gold)' }}>
                {round}
              </p>
            </div>

            <div className="game-panel-muted rounded-lg p-4 border border-[var(--game-border)]">
              <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--game-text-muted)' }}>
                Total Earnings
              </p>
              <p className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--game-accent-gold)' }}>
                {formatCredits(totalEarnings)}
              </p>
            </div>

            <div className="game-panel-muted rounded-lg p-4 border border-[var(--game-border)]">
              <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--game-text-muted)' }}>
                Avg per Round
              </p>
              <p className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--game-accent-gold)' }}>
                {efficiency}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--game-text-dim)' }}>credits/round</p>
            </div>

            <div
              className={`rounded-lg p-4 border ${
                display.isVoluntaryEnd ? 'border-[var(--game-accent-gold)]' : 'border-[var(--game-accent-red)]'
              }`}
              style={{
                background: display.isVoluntaryEnd ? 'rgba(201, 162, 39, 0.15)' : 'rgba(139, 21, 32, 0.25)',
              }}
            >
              <p className="text-xs sm:text-sm font-medium" style={{ color: 'var(--game-text-muted)' }}>
                Final Credits
              </p>
              <p
                className="text-2xl sm:text-3xl font-bold"
                style={{
                  color: display.isVoluntaryEnd ? 'var(--game-accent-gold)' : 'var(--game-accent-red-bright)',
                }}
              >
                {formatCredits(credits)}
              </p>
              {display.isVoluntaryEnd && (
                <p className="text-xs font-semibold mt-1" style={{ color: 'var(--game-accent-gold)' }}>
                  ✓ Finished with credits!
                </p>
              )}
            </div>
          </div>

          {display.isVoluntaryEnd && credits > 100 && (
            <div
              className="rounded-lg p-4 border border-[var(--game-accent-gold)]"
              style={{ background: 'rgba(201, 162, 39, 0.15)', boxShadow: '0 0 16px var(--game-accent-gold-glow)' }}
            >
              <p className="text-center font-semibold text-sm sm:text-base" style={{ color: 'var(--game-accent-gold)' }}>
                🏆 Excellent run! You finished with {formatCredits(credits)} credits!
              </p>
            </div>
          )}

          {display.tip && (
            <div className="game-panel-muted rounded-lg p-4 border border-[var(--game-border)]">
              <p className="text-center text-sm" style={{ color: 'var(--game-text-muted)' }}>
                {display.tip}
              </p>
            </div>
          )}
        </div>

        <div className="text-center">
          <GameButton onClick={onReturnToMenu} variant="primary" size="lg" aria-label="Return to main menu">
            Return to Menu
          </GameButton>
        </div>
      </div>
    </div>
  );
}
