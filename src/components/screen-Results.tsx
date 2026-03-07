import { useMemo } from 'react';
import { Card as CardType, Hand, FailureStateType, GameState } from '../types';
import { Card } from './Card';
import { GameHeader } from './GameHeader';
import { GameButton } from './GameButton';
import { summarizeRoundCombos } from '../utils/streakCalculator';
import { formatCredits } from '../utils/format';

interface ResultsProps {
  playerHand: CardType[];
  heldIndices: number[];
  parallelHands: Hand[];
  rewardTable: { [key: string]: number };
  betAmount: number;
  credits: number;
  round: number;
  totalEarnings: number;
  selectedHandCount: number;
  failureState?: FailureStateType;
  gameState?: GameState;
  onReturnToPreDraw: (payout: number) => void;
  showShopNextRound?: boolean;
  onShowPayoutTable?: () => void;
  onShowSettings?: () => void;
}

function formatMultiplier(multiplier: number): string {
  return `${Number(multiplier.toFixed(2)).toString()}x`;
}

function getComboGraphPoints(comboProgression: number[], width: number, height: number): string {
  if (comboProgression.length === 0) {
    return '';
  }

  const maxCombo = Math.max(1, ...comboProgression);
  const stepX = comboProgression.length > 1 ? width / (comboProgression.length - 1) : width / 2;

  return comboProgression
    .map((combo, index) => {
      const x = comboProgression.length > 1 ? index * stepX : width / 2;
      const y = height - (combo / maxCombo) * height;
      return `${x},${y}`;
    })
    .join(' ');
}

export function Results({
  playerHand,
  heldIndices,
  parallelHands,
  rewardTable,
  betAmount,
  credits,
  round,
  selectedHandCount,
  failureState,
  gameState,
  onReturnToPreDraw,
  showShopNextRound = false,
  onShowPayoutTable,
  onShowSettings,
}: ResultsProps) {
  const {
    comboProgression,
    totalPayout,
    rankData,
    handsPlayed,
    handsWon,
    winPercent,
    highestCombo,
    highestMultiplier,
  } = useMemo(() => {
    return summarizeRoundCombos(parallelHands, rewardTable, betAmount);
  }, [parallelHands, rewardTable, betAmount]);

  const profit =
    totalPayout -
    betAmount * selectedHandCount -
    (gameState?.devilsDealHeld && gameState?.devilsDealCost ? Math.abs(gameState.devilsDealCost) : 0);
  const comboGraphPoints = useMemo(
    () => getComboGraphPoints(comboProgression, 100, 44),
    [comboProgression]
  );

  return (
    <div id="results-screen" className="min-h-screen min-h-[100dvh] p-4 sm:p-6 relative overflow-hidden select-none">
      <div className="max-w-4xl mx-auto relative z-0 flex flex-col min-h-[calc(100dvh-2rem)]">
        <GameHeader
          credits={credits}
          round={round}
          failureState={failureState}
          gameState={gameState}
          onShowPayoutTable={onShowPayoutTable}
          onShowSettings={onShowSettings}
        />

        <div className="flex-1 space-y-4 sm:space-y-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <div className="game-panel rounded-xl p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-4" style={{ color: 'var(--game-accent-gold)' }}>
                Hand Summary
              </h2>
              {heldIndices.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: 'var(--game-text-muted)' }}>
                    Cards Held:
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {heldIndices.map((index) => (
                      <Card key={playerHand[index].id} card={playerHand[index]} size="small" />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="game-panel rounded-xl p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-4" style={{ color: 'var(--game-accent-gold)' }}>
                Win Stats
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium" style={{ color: 'var(--game-text-muted)' }}>
                    Hands Played
                  </span>
                  <span className="text-lg sm:text-xl font-bold" style={{ color: 'var(--game-text)' }}>
                    {handsPlayed}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium" style={{ color: 'var(--game-text-muted)' }}>
                    Hands Won
                  </span>
                  <span className="text-lg sm:text-xl font-bold" style={{ color: 'var(--game-accent-gold)' }}>
                    {handsWon}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium" style={{ color: 'var(--game-text-muted)' }}>
                    Win %
                  </span>
                  <span className="text-lg sm:text-xl font-bold" style={{ color: 'var(--game-accent-gold)' }}>
                    {winPercent.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Left: Round summary box - its own container */}
            <div
              className="game-panel rounded-xl p-4 sm:p-6 md:p-8 border border-[var(--game-accent-gold)] animate-fadeIn"
              style={{ boxShadow: '0 0 24px var(--game-accent-gold-glow)' }}
            >
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6" style={{ color: 'var(--game-accent-gold)' }}>
                Round Summary
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {rankData.map((item) => (
                  <div key={item.rank} className="flex justify-between items-center text-base sm:text-lg">
                    <span className="capitalize font-medium" style={{ color: 'var(--game-text)' }}>
                      {item.rank.replace(/-/g, ' ')} ×{item.count}
                    </span>
                    <span
                      className="font-bold"
                      style={{ color: item.totalPayout > 0 ? 'var(--game-accent-gold)' : 'var(--game-text-muted)' }}
                    >
                      = {formatCredits(Math.round(item.totalPayout))} credit
                      {Math.round(item.totalPayout) !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Round cost box - its own container */}
            <div
              className="game-panel-muted rounded-xl p-4 sm:p-6 border border-[var(--game-border)] animate-fadeIn"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-lg font-semibold" style={{ color: 'var(--game-text)' }}>
                    Round Cost:
                  </span>
                  <span className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--game-accent-red-bright)' }}>
                    {formatCredits(betAmount * selectedHandCount)} credits
                  </span>
                </div>
                {gameState?.devilsDealCard && gameState?.devilsDealHeld && gameState?.devilsDealCost > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-base sm:text-lg font-semibold" style={{ color: 'var(--game-text)' }}>
                      Devil's Deal:
                    </span>
                    <span className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--game-accent-red-bright)' }}>
                      -{formatCredits(Math.abs(gameState.devilsDealCost))} credits
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-lg font-semibold" style={{ color: 'var(--game-text)' }}>
                    Total Payout:
                  </span>
                  <span className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--game-accent-gold)' }}>
                    {formatCredits(totalPayout)} credits
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[var(--game-border)]">
                  <span className="text-lg sm:text-xl font-bold" style={{ color: 'var(--game-text)' }}>
                    Profit:
                  </span>
                  <span
                    className="text-2xl sm:text-3xl font-bold"
                    style={{
                      color: profit >= 0 ? 'var(--game-accent-gold)' : 'var(--game-accent-red-bright)',
                    }}
                  >
                    {formatCredits(profit)} credit{Math.abs(profit) !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="pt-3 border-t border-[var(--game-border)] space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base font-semibold" style={{ color: 'var(--game-text-muted)' }}>
                      Highest Combo
                    </span>
                    <span className="text-lg sm:text-xl font-bold" style={{ color: 'var(--game-accent-gold)' }}>
                      {highestCombo}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm sm:text-base font-semibold" style={{ color: 'var(--game-text-muted)' }}>
                      Highest Multiplier
                    </span>
                    <span className="text-lg sm:text-xl font-bold" style={{ color: 'var(--game-accent-gold)' }}>
                      {formatMultiplier(highestMultiplier)}
                    </span>
                  </div>
                  <div
                    className="rounded-lg p-3 border border-[var(--game-border)]"
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs uppercase tracking-[0.12em]" style={{ color: 'var(--game-text-muted)' }}>
                        Combo Progression
                      </span>
                      <span className="text-xs" style={{ color: 'var(--game-text-dim)' }}>
                        Round trend
                      </span>
                    </div>
                    {comboProgression.length > 0 ? (
                      <svg
                        viewBox="0 0 100 44"
                        className="w-full h-24"
                        role="img"
                        aria-label="Combo progression graph"
                      >
                        <title>Combo progression graph</title>
                        <line x1="0" y1="43" x2="100" y2="43" stroke="var(--game-border)" strokeWidth="1" />
                        <polyline
                          fill="none"
                          stroke="var(--game-accent-gold)"
                          strokeWidth="2.5"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          points={comboGraphPoints}
                        />
                      </svg>
                    ) : (
                      <p className="text-sm italic" style={{ color: 'var(--game-text-dim)' }}>
                        No combo data this round yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <GameButton
            onClick={() => onReturnToPreDraw(totalPayout)}
            variant={showShopNextRound ? 'secondary' : 'primary'}
            size="lg"
            fullWidth
          >
            {showShopNextRound ? 'Continue to Shop' : 'Continue'}
          </GameButton>
        </div>
      </div>
    </div>
  );
}
