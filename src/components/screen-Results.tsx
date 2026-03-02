import { useMemo } from 'react';
import { Card as CardType, Hand, FailureStateType, GameState } from '../types';
import { Card } from './Card';
import { GameHeader } from './GameHeader';
import { GameButton } from './GameButton';
import { PokerEvaluator } from '../utils/pokerEvaluator';
import { calculateStreakMultiplier } from '../utils/streakCalculator';
import { gameConfig } from '../config/gameConfig';
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
  const { totalPayout, rankData, handsPlayed, handsWon, winPercent } = useMemo(() => {
    const payouts: number[] = [];
    const rankMap = new Map<string, { rank: string; totalPayout: number; count: number }>();
    let streak = 0;

    for (let i = 0; i < parallelHands.length; i++) {
      const hand = parallelHands[i];
      const result = PokerEvaluator.evaluate(hand.cards);
      const withRewards = PokerEvaluator.applyRewards(result, rewardTable);
      const streakMultiplier = calculateStreakMultiplier(streak, gameConfig.streakMultiplier);
      const handPayout = Math.round(betAmount * withRewards.multiplier * streakMultiplier);

      streak = withRewards.multiplier > 0 ? streak + 1 : Math.max(0, streak - 1);
      payouts.push(handPayout);

      const rankKey = result.rank;
      if (rankMap.has(rankKey)) {
        const existing = rankMap.get(rankKey)!;
        existing.totalPayout += handPayout;
        existing.count += 1;
      } else {
        rankMap.set(rankKey, { rank: result.rank, totalPayout: handPayout, count: 1 });
      }
    }

    const handsWon = Array.from(rankMap.values()).reduce(
      (sum, item) => sum + (item.totalPayout > 0 ? item.count : 0),
      0
    );

    return {
      totalPayout: payouts.reduce((sum, p) => sum + p, 0),
      rankData: Array.from(rankMap.values()),
      handsPlayed: parallelHands.length,
      handsWon,
      winPercent: parallelHands.length > 0 ? (handsWon / parallelHands.length) * 100 : 0,
    };
  }, [parallelHands, rewardTable, betAmount]);

  const profit =
    totalPayout -
    betAmount * selectedHandCount -
    (gameState?.devilsDealHeld && gameState?.devilsDealCost ? Math.abs(gameState.devilsDealCost) : 0);

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
