import { FailureStateType, GameState } from '../types';
import { getFailureStateDescription } from '../utils/failureConditions';
import { formatCredits } from '../utils/format';

interface GameHeaderProps {
  credits: number;
  round?: number;
  failureState?: FailureStateType;
  gameState?: GameState;
  hideFailureInHeader?: boolean;
  onShowPayoutTable?: () => void;
  onShowSettings?: () => void;
}

export function GameHeader({
  credits,
  round,
  failureState,
  gameState,
  hideFailureInHeader,
  onShowPayoutTable,
  onShowSettings,
}: GameHeaderProps) {
  const failureDescription =
    failureState && gameState ? getFailureStateDescription(failureState, gameState) : null;

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-3 mb-4 sm:mb-6 flex-nowrap min-w-0">
      {/* Left: Logo + Stats - single line, truncate if needed */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <div
          className="rounded-lg p-2 sm:p-2.5 h-10 sm:h-11 w-12 sm:w-14 flex items-center justify-center border border-[var(--game-border)] flex-shrink-0"
          style={{
            background:
              'linear-gradient(145deg, var(--game-bg-card) 0%, var(--game-bg-panel) 100%)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          <img src="images/logos/number9.png" alt="Logo" className="w-full h-full object-contain" />
        </div>

        <div
          className="rounded-lg px-2 sm:px-3 py-1.5 flex items-center gap-x-3 sm:gap-x-4 border border-[var(--game-border)] min-w-0"
          style={{
            background:
              'linear-gradient(145deg, var(--game-bg-card) 0%, var(--game-bg-panel) 100%)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          <span
            className="text-xs sm:text-sm font-bold whitespace-nowrap"
            style={{ color: 'var(--game-text)' }}
          >
            <span style={{ color: 'var(--game-accent-gold)' }}>
              Credits: {formatCredits(credits)}
            </span>
          </span>
          {round !== undefined && (
            <span
              className="text-xs sm:text-sm font-bold whitespace-nowrap"
              style={{ color: 'var(--game-text)' }}
            >
              <span style={{ color: 'var(--game-accent-gold)' }}>Round: {round}</span>
            </span>
          )}
        </div>

        {!hideFailureInHeader && failureState && failureDescription && (
          <div
            className="rounded-lg px-2 sm:px-3 py-1.5 border border-[var(--game-accent-red)] flex items-center gap-1.5 min-w-0 flex-shrink"
            style={{
              background: 'rgba(139, 21, 32, 0.25)',
              boxShadow: '0 0 12px rgba(185, 28, 40, 0.2)',
            }}
          >
            <span
              className="text-xs font-semibold whitespace-nowrap"
              style={{ color: 'var(--game-accent-red-bright)' }}
            >
              ⚠️
            </span>
            <span
              className="text-xs font-medium truncate"
              style={{ color: 'var(--game-text)' }}
              title={failureDescription}
            >
              {failureDescription}
            </span>
          </div>
        )}
      </div>

      {/* Right: Payouts + Gear - always single line */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        {onShowPayoutTable && (
          <button
            onClick={onShowPayoutTable}
            className="font-bold py-1.5 px-2 sm:px-3 rounded-lg text-xs sm:text-sm transition-all border border-[var(--game-border)] hover:brightness-110"
            style={{
              background:
                'linear-gradient(180deg, var(--game-accent-gold) 0%, var(--game-accent-gold-dim) 100%)',
              color: 'var(--game-bg-dark)',
            }}
            title="Show Payout Table"
          >
            💰
          </button>
        )}
        {onShowSettings && (
          <button
            onClick={onShowSettings}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-lg transition-all border border-[var(--game-border)] hover:brightness-110"
            style={{
              background:
                'linear-gradient(145deg, var(--game-bg-card) 0%, var(--game-bg-panel) 100%)',
              color: 'var(--game-text)',
            }}
            title="Settings"
            aria-label="Open settings"
          >
            ⚙️
          </button>
        )}
      </div>
    </div>
  );
}
