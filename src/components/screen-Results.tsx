import { useEffect, useState } from 'react';
import { Card as CardType, Hand, FailureStateType, GameState } from '../types';
import { Card } from './Card';
import { GameHeader } from './GameHeader';
import { PokerEvaluator } from '../utils/pokerEvaluator';
import { RewardTable } from './RewardTable';

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
}

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
  onReturnToPreDraw,
  showShopNextRound = false,
}: ResultsProps) {
  const [showSummary, setShowSummary] = useState(false);
  const efficiency = round > 0 ? (totalEarnings / round).toFixed(2) : '0.00';

  // Calculate total payouts
  const handPayouts = parallelHands.map((hand) => {
    const result = PokerEvaluator.evaluate(hand.cards);
    const withRewards = PokerEvaluator.applyRewards(result, rewardTable);
    return betAmount * withRewards.multiplier;
  });

  const totalPayout = handPayouts.reduce((sum, payout) => sum + payout, 0);

  // Show summary immediately (animation happens in screen-ParallelHandsAnimation)
  useEffect(() => {
    setShowSummary(true);
  }, []);

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
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Hand Summary - Always visible */}
            <div className="bg-white rounded-lg shadow-lg p-6">
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

              {/* Individual Payouts */}
              {/* <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Individual Hand Payouts:</p>
                <div className="space-y-1">
                  {parallelHands.map((hand) => {
                    const result = PokerEvaluator.evaluate(hand.cards);
                    const withRewards = PokerEvaluator.applyRewards(result, rewardTable);
                    const payout = betAmount * withRewards.multiplier;
                    return (
                      <div key={hand.id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700 capitalize">
                          {result.rank.replace(/-/g, ' ')}
                        </span>
                        <span className="text-gray-800 font-semibold">
                          ×{withRewards.multiplier} = {payout} credits
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div> */}
            </div>

            {/* Results Summary */}
            {showSummary && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-lg p-8 border-2 border-green-300 animate-fadeIn">
                <h2 className="text-3xl font-bold mb-6 text-gray-800">Round Summary</h2>

                <div className="space-y-4 mb-8">
                  {(() => {
                    // Group hands by rank and count occurrences
                    const rankCounts = new Map<
                      string,
                      { rank: string; multiplier: number; count: number }
                    >();

                    parallelHands.forEach((hand) => {
                      const result = PokerEvaluator.evaluate(hand.cards);
                      const withRewards = PokerEvaluator.applyRewards(result, rewardTable);
                      const rankKey = result.rank;

                      if (rankCounts.has(rankKey)) {
                        const existing = rankCounts.get(rankKey)!;
                        existing.count += 1;
                      } else {
                        rankCounts.set(rankKey, {
                          rank: result.rank,
                          multiplier: withRewards.multiplier,
                          count: 1,
                        });
                      }
                    });

                    return Array.from(rankCounts.values()).map((item) => {
                      const payout = betAmount * item.multiplier * item.count;
                      return (
                        <div key={item.rank} className="flex justify-between items-center text-lg">
                          <span className="text-gray-700 capitalize font-medium">
                            {item.rank.replace(/-/g, ' ')} ×{item.count}
                          </span>
                          <span
                            className={`font-bold ${payout > 0 ? 'text-green-600' : 'text-gray-500'}`}
                          >
                            = {payout} credit{payout !== 1 ? 's' : ''}
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>

                <div className="bg-white rounded-lg p-6 border-2 border-green-400 mb-8">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-semibold text-gray-700">Round Cost:</span>
                      <span className="text-2xl font-bold text-red-600">
                        {betAmount * selectedHandCount} credits
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-700">Total Payout:</span>
                      <span className="text-2xl font-bold text-green-600">
                        {totalPayout} credits
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-gray-800">Profit:</span>
                      <span
                        className={`text-3xl font-bold ${totalPayout >= betAmount * selectedHandCount ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {totalPayout - betAmount * selectedHandCount} credit
                        {totalPayout - betAmount * selectedHandCount !== 1 ? 's' : ''}
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
            )}
          </div>

          {/* Reward Table Sidebar */}
          <div className="lg:col-span-1">
            <RewardTable rewardTable={rewardTable} />
          </div>
        </div>
      </div>
    </div>
  );
}
