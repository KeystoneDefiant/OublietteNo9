import { useEffect, useState } from 'react';
import { Card as CardType, Hand } from '../types';
import { Card } from './Card';
import { PokerEvaluator } from '../utils/pokerEvaluator';
import { RewardTable } from './RewardTable';

interface ResultsProps {
  playerHand: CardType[];
  heldIndices: number[];
  parallelHands: Hand[];
  rewardTable: { [key: string]: number };
  betAmount: number;
  onReturnToPreDraw: (payout: number) => void;
}

export function Results({
  playerHand,
  heldIndices,
  parallelHands,
  rewardTable,
  betAmount,
  onReturnToPreDraw,
}: ResultsProps) {
  const [showSummary, setShowSummary] = useState(false);

  // Calculate total payouts
  const handPayouts = parallelHands.map((hand) => {
    const result = PokerEvaluator.evaluate(hand.cards);
    const withRewards = PokerEvaluator.applyRewards(result, rewardTable);
    return betAmount * withRewards.multiplier;
  });

  const totalPayout = handPayouts.reduce((sum, payout) => sum + payout, 0);

  // Calculate animation timing based on number of hands
  // Always complete in 1.25 seconds regardless of hand count
  const ANIMATION_TARGET_MS = 1250; // 1.25 seconds
  const delayPerHandMs = parallelHands.length > 0 ? ANIMATION_TARGET_MS / parallelHands.length : 0;
  const slideAnimationDurationMs = Math.min(1000, ANIMATION_TARGET_MS * 0.8); // Slide animation takes 80% of total time, max 1s
  const floatAnimationDurationMs = Math.min(1000, ANIMATION_TARGET_MS * 0.8); // Float animation takes 80% of total time, max 1s

  // Show summary after all hands have animated
  useEffect(() => {
    if (parallelHands.length > 0) {
      // Total time = last hand delay + animation duration
      const animationDuration =
        delayPerHandMs * (parallelHands.length - 1) + slideAnimationDurationMs;
      const timer = setTimeout(() => {
        setShowSummary(true);
      }, animationDuration);
      return () => clearTimeout(timer);
    }
  }, [parallelHands.length, delayPerHandMs, slideAnimationDurationMs]);

  return (
    <div className="min-h-screen p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: `linear-gradient(135deg, 
            hsl(60, 70%, 20%) 0%, 
            hsl(120, 70%, 25%) 50%, 
            hsl(180, 70%, 20%) 100%)`,
          backgroundSize: '200% 200%',
          animation: 'gradientShift 10s ease infinite',
        }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px),
              repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)
            `,
            animation: 'patternMove 20s linear infinite',
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-0">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="bg-white rounded-lg shadow-lg p-3 h-16 w-24 flex items-center justify-center border-2 border-dashed border-gray-300">
            <span className="text-gray-400 text-xs">Logo</span>
          </div>
        </div>

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

            {/* Animated Parallel Hands */}
            {!showSummary && (
              <div className="bg-white rounded-lg shadow-lg p-6" id="results">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Parallel Hands Results</h2>
                <div className="overflow-x-auto no-scrollbar">
                  <div className="flex gap-4 pb-4 min-w-full">
                    {parallelHands.map((hand, index) => {
                      const result = PokerEvaluator.evaluate(hand.cards);
                      const withRewards = PokerEvaluator.applyRewards(result, rewardTable);
                      const payout = betAmount * withRewards.multiplier;

                      return (
                        <div
                          key={hand.id}
                          className="relative flex-shrink-0"
                          style={{
                            opacity: showSummary ? 1 : 1,
                          }}
                        >
                          {/* Hand card container */}
                          <div
                            className={`
                              border-2 rounded-lg p-4 transition-all duration-500
                              ${
                                payout > 0
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-gray-300 bg-gray-50'
                              }
                            `}
                            style={{
                              animation: `slideLeftAndFade ${slideAnimationDurationMs}ms ease-in forwards`,
                              animationDelay: `${index * delayPerHandMs}ms`,
                              opacity: showSummary ? 0 : 1,
                            }}
                          >
                            <div className="flex gap-1 justify-center mb-2">
                              {hand.cards.map((card) => (
                                <Card key={card.id} card={card} size="small" />
                              ))}
                            </div>
                            <div className="text-center text-sm">
                              <p className="font-semibold text-gray-700 capitalize">
                                {result.rank.replace(/-/g, ' ')}
                              </p>
                            </div>
                          </div>

                          {/* Floating payout popup */}
                          {payout > 0 && (
                            <div
                              className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-lg font-bold text-green-600 whitespace-nowrap pointer-events-none"
                              style={{
                                animation: `floatUpAndFade ${floatAnimationDurationMs}ms ease-out forwards`,
                                animationDelay: `${index * delayPerHandMs + 100}ms`,
                              }}
                            >
                              +{payout}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Full Summary - Shows after animation */}
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
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-800">Total Payout:</span>
                    <span className="text-4xl font-bold text-green-600">{totalPayout} credits</span>
                  </div>
                </div>

                <button
                  onClick={() => onReturnToPreDraw(totalPayout)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg transition-colors text-xl"
                >
                  Pre-Draw
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
