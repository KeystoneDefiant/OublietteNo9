import { useMemo } from 'react';
import { Card as CardType, Hand, FailureStateType, GameState } from '../types';
import { Card } from './Card';
import { GameHeader } from './GameHeader';
import { PokerEvaluator } from '../utils/pokerEvaluator';
import { calculateStreakMultiplier } from '../utils/streakCalculator';
import { gameConfig } from '../config/gameConfig';
import { formatCredits } from '../utils/format';

/**
 * Results screen component props
 *
 * Displays outcomes of all parallel hands including payouts, hand counts,
 * profit/loss calculations, and Devil's Deal costs if applicable.
 */
interface ResultsProps {
  /** The player's original hand */
  playerHand: CardType[];
  /** Indices of cards that were held */
  heldIndices: number[];
  /** Array of all parallel hands drawn */
  parallelHands: Hand[];
  /** Payout multipliers for each hand rank */
  rewardTable: { [key: string]: number };
  /** Bet amount per hand */
  betAmount: number;
  /** Current player credits */
  credits: number;
  /** Current round number */
  round: number;
  /** Total earnings across all rounds */
  totalEarnings: number;
  /** Number of parallel hands that were drawn */
  selectedHandCount: number;
  /** Failure state for endless mode */
  failureState?: FailureStateType;
  /** Complete game state for Devil's Deal display */
  gameState?: GameState;
  /** Callback to return to PreDraw with payout amount */
  onReturnToPreDraw: (payout: number) => void;
  /** Whether shop will appear next round */
  showShopNextRound?: boolean;
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
 * Results screen component
 *
 * Displays comprehensive results after drawing parallel hands:
 * - Total payout across all hands
 * - Bet cost calculation
 * - Devil's Deal cost (if taken)
 * - Final profit/loss
 * - Hand counts by rank
 * - Held cards summary
 * - Best hand display
 *
 * Calculates and displays profit with color coding (green for profit, red for loss)
 * and properly accounts for Devil's Deal cost deductions.
 *
 * @example
 * <Results
 *   parallelHands={hands}
 *   betAmount={10}
 *   selectedHandCount={20}
 *   onReturnToPreDraw={(payout) => handleContinue(payout)}
 *   {...otherProps}
 * />
 */
export function Results({
  playerHand,
  heldIndices,
  parallelHands,
  rewardTable,
  betAmount,
  credits,
  round,
  totalEarnings,
  selectedHandCount,
  failureState,
  gameState,
  musicEnabled,
  soundEffectsEnabled,
  onReturnToPreDraw,
  showShopNextRound = false,
  onToggleMusic,
  onToggleSoundEffects,
  onShowPayoutTable,
  animationSpeedMode = 1,
  onCycleAnimationSpeed,
}: ResultsProps) {
  const efficiency = round > 0 ? (totalEarnings / round).toFixed(2) : '0.00';

  // Single O(n) pass: compute payouts and rank data with streak multipliers.
  // Previously O(n²) - re-evaluating all previous hands per hand caused multi-second stalls.
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

  return (
    <div id="results-screen" className="min-h-screen p-6 relative overflow-hidden select-none">
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

        <div className="">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Hand Summary and Win Stats - side by side */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Hand Summary */}
              <div className="bg-white rounded-lg shadow-lg p-6 flex-1">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Hand Summary</h2>

                {/* Held Cards */}
                {heldIndices.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-600 mb-2">Cards Held:</p>
                    <div className="flex gap-2">
                      {heldIndices.map((index) => (
                        <Card key={playerHand[index].id} card={playerHand[index]} size="small" />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Win Stats */}
              <div className="bg-white rounded-lg shadow-lg p-6 lg:w-72 shrink-0">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Win Stats</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Hands Played</span>
                    <span className="text-xl font-bold text-gray-800">{handsPlayed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Hands Won</span>
                    <span className="text-xl font-bold text-green-600">{handsWon}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Win %</span>
                    <span className="text-xl font-bold text-blue-600">
                      {winPercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Summary */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-lg p-8 border-2 border-green-300 animate-fadeIn">
              <h2 className="text-3xl font-bold mb-6 text-gray-800">Round Summary</h2>

              <div className="space-y-4 mb-8">
                {rankData.map((item) => (
                  <div key={item.rank} className="flex justify-between items-center text-lg">
                    <span className="text-gray-700 capitalize font-medium">
                      {item.rank.replace(/-/g, ' ')} ×{item.count}
                    </span>
                    <span
                      className={`font-bold ${item.totalPayout > 0 ? 'text-green-600' : 'text-gray-500'}`}
                    >
                      = {formatCredits(Math.round(item.totalPayout))} credit
                      {Math.round(item.totalPayout) !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>

                <div className="bg-white rounded-lg p-6 border-2 border-green-400 mb-8">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-semibold text-gray-700">Round Cost:</span>
                      <span className="text-2xl font-bold text-red-600">
                        {formatCredits(betAmount * selectedHandCount)} credits
                      </span>
                    </div>
                    {gameState?.devilsDealCard &&
                      gameState?.devilsDealHeld &&
                      gameState?.devilsDealCost > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-gray-700">Devil's Deal:</span>
                          <span className="text-2xl font-bold text-red-600">
                            -{formatCredits(Math.abs(gameState.devilsDealCost))} credits
                          </span>
                        </div>
                      )}
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-700">Total Payout:</span>
                      <span className="text-2xl font-bold text-green-600">
                        {formatCredits(totalPayout)} credits
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-800">Profit:</span>
                      <span
                        className={`text-3xl font-bold ${
                          totalPayout -
                            betAmount * selectedHandCount -
                            (gameState?.devilsDealHeld && gameState?.devilsDealCost
                              ? Math.abs(gameState.devilsDealCost)
                              : 0) >=
                          0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {formatCredits(
                          totalPayout -
                            betAmount * selectedHandCount -
                            (gameState?.devilsDealHeld && gameState?.devilsDealCost
                              ? Math.abs(gameState.devilsDealCost)
                              : 0)
                        )}{' '}
                        credit
                        {Math.abs(
                          totalPayout -
                            betAmount * selectedHandCount -
                            (gameState?.devilsDealHeld && gameState?.devilsDealCost
                              ? Math.abs(gameState.devilsDealCost)
                              : 0)
                        ) !== 1
                          ? 's'
                          : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onReturnToPreDraw(totalPayout);
                  }}
                  className={`w-full font-bold py-4 px-8 rounded-lg transition-colors text-xl ${
                    showShopNextRound
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {showShopNextRound ? 'Continue to Shop' : 'Continue'}
                </button>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
