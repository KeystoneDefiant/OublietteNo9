import { useMemo } from 'react';
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
  const averagePerRound =
    round > 0
      ? (totalEarnings / round).toLocaleString(undefined, {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })
      : '0.0';
  const display = getGameOverDisplay(
    gameOverReason ?? null,
    gameState ?? null,
    gameState ? { minimumBet: gameState.minimumBet, handCount: gameState.handCount } : undefined
  );
  const highestMultiplier = Number((gameState?.runHighestMultiplier ?? 1).toFixed(2)).toString();
  const statItems = useMemo(
    () => [
      { label: 'Rounds Survived', value: round.toLocaleString() },
      { label: 'Total Earnings', value: formatCredits(totalEarnings) },
      { label: 'Avg per Round', value: averagePerRound },
      { label: 'Final Credits', value: formatCredits(credits) },
      { label: 'Parallel Hands', value: (gameState?.handCount ?? 0).toLocaleString() },
      { label: 'Highest Combo', value: (gameState?.runHighestCombo ?? 0).toLocaleString() },
      { label: 'Highest Multiplier', value: `${highestMultiplier}x` },
    ],
    [
      averagePerRound,
      credits,
      gameState?.handCount,
      gameState?.runHighestCombo,
      highestMultiplier,
      round,
      totalEarnings,
    ]
  );
  const marqueeItems = [...statItems, ...statItems];

  return (
    <div
      className="game-over-screen min-h-[100dvh] flex items-center justify-center p-4 sm:p-6 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #050508 0%, #0d0a0c 50%, #120e10 100%)',
      }}
    >
      <div
        className="game-panel rounded-[2rem] p-5 sm:p-8 lg:p-10 max-w-6xl w-full border border-[var(--game-border)] relative overflow-hidden"
        style={{
          boxShadow: '0 20px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(201, 162, 39, 0.08)',
          background:
            'radial-gradient(circle at top, rgba(201,162,39,0.12), transparent 30%), linear-gradient(180deg, rgba(19,14,16,0.96) 0%, rgba(10,8,10,0.98) 100%)',
        }}
      >
        <div className="absolute inset-0 pointer-events-none opacity-60">
          <div
            className="absolute -top-16 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full blur-3xl"
            style={{ background: 'rgba(201, 162, 39, 0.14)' }}
          />
          <div
            className="absolute -bottom-16 right-8 h-56 w-56 rounded-full blur-3xl"
            style={{ background: 'rgba(139, 21, 32, 0.14)' }}
          />
        </div>

        <div className="relative z-10 space-y-6 sm:space-y-8">
          <section className="relative overflow-hidden rounded-[1.75rem] border border-[var(--game-border)] bg-[rgba(255,255,255,0.02)] min-h-[16rem] sm:min-h-[18rem]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(201,162,39,0.12),_transparent_52%)]" />
            <div className="relative h-full px-6 py-8 sm:px-10 sm:py-12">
              <h1
                className="game-over-title-animate text-4xl sm:text-6xl lg:text-7xl font-bold text-center uppercase tracking-[0.08em]"
                style={{ color: 'var(--game-accent-gold)' }}
              >
                {display.title}
              </h1>
              <p
                className="game-over-subtitle-animate max-w-3xl text-center text-sm sm:text-lg font-medium leading-relaxed"
                style={{ color: 'var(--game-text)' }}
              >
                {display.subtitle}
              </p>
            </div>
          </section>

          {/* <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {statItems.map((item) => (
              <div
                key={item.label}
                className="game-panel-muted rounded-xl p-4 border border-[var(--game-border)]"
              >
                <p
                  className="text-[0.7rem] sm:text-xs uppercase tracking-[0.14em]"
                  style={{ color: 'var(--game-text-muted)' }}
                >
                  {item.label}
                </p>
                <p
                  className="mt-2 text-xl sm:text-2xl font-bold"
                  style={{ color: 'var(--game-accent-gold)' }}
                >
                  {item.value}
                </p>
                {item.label === 'Avg per Round' && (
                  <p className="mt-1 text-xs" style={{ color: 'var(--game-text-dim)' }}>
                    credits/round
                  </p>
                )}
              </div>
            ))}
          </section> */}

          <section className="overflow-hidden rounded-xl border border-[var(--game-border)] bg-[rgba(255,255,255,0.025)] py-3">
            <div className="game-over-marquee-track" aria-label="Run statistics marquee">
              {marqueeItems.map((item, index) => (
                <div
                  key={`${item.label}-${index}`}
                  className="inline-flex items-center gap-3 rounded-full border border-[var(--game-border)] bg-[rgba(10,8,10,0.7)] px-4 py-2"
                >
                  <span
                    className="text-[0.7rem] uppercase tracking-[0.14em]"
                    style={{ color: 'var(--game-text-muted)' }}
                  >
                    {item.label}
                  </span>
                  <span
                    className="text-sm sm:text-base font-bold"
                    style={{ color: 'var(--game-accent-gold)' }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
            <div className="game-panel-muted rounded-2xl p-5 sm:p-6 border border-[var(--game-border)]">
              <p
                className="text-xs uppercase tracking-[0.18em] mb-3"
                style={{ color: 'var(--game-text-muted)' }}
              >
                Your highball glass whispers...
              </p>
              <p
                className="text-lg sm:text-xl font-semibold"
                style={{ color: 'var(--game-accent-gold)' }}
              >
                {display.tip}
              </p>
            </div>

            <div
              className={`rounded-2xl p-5 sm:p-6 border ${
                display.isVoluntaryEnd
                  ? 'border-[var(--game-accent-gold)]'
                  : 'border-[var(--game-accent-red)]'
              }`}
              style={{
                background: display.isVoluntaryEnd
                  ? 'rgba(201, 162, 39, 0.12)'
                  : 'rgba(139, 21, 32, 0.2)',
              }}
            >
              <div className="">
                <GameButton
                  onClick={onReturnToMenu}
                  variant="primary"
                  size="lg"
                  fullWidth
                  aria-label="Return to main menu"
                >
                  Return to Menu
                </GameButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
