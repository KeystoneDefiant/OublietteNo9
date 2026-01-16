import { useState, useEffect } from 'react';
import { Card as CardType, Hand, HandRank } from '../types';
import { Card } from './Card';
import { PokerEvaluator } from '../utils/pokerEvaluator';
import { RewardTable } from './RewardTable';

interface GameTableProps {
  playerHand: CardType[];
  heldIndices: number[];
  parallelHands: Hand[];
  rewardTable: { [key: string]: number };
  credits: number;
  handCount: number;
  selectedHandCount: number;
  betAmount: number;
  minimumBet: number;
  round: number;
  totalEarnings: number;
  additionalHandsBought: number;
  firstDrawComplete: boolean;
  secondDrawAvailable: boolean;
  onToggleHold: (index: number) => void;
  onDraw: () => void;
  onDealHand: () => void;
  onOpenShop: () => void;
  onBuyAnotherHand: () => void;
  onSetBetAmount: (amount: number) => void;
  onSetSelectedHandCount: (count: number) => void;
}

export function GameTable({
  playerHand,
  heldIndices,
  parallelHands,
  rewardTable,
  credits,
  handCount,
  selectedHandCount,
  betAmount,
  minimumBet,
  round,
  totalEarnings,
  additionalHandsBought,
  firstDrawComplete,
  secondDrawAvailable,
  onToggleHold,
  onDraw,
  onDealHand,
  onOpenShop,
  onBuyAnotherHand,
  onSetBetAmount,
  onSetSelectedHandCount,
}: GameTableProps) {
  const canDraw = playerHand.length === 5 && parallelHands.length === 0;
  const hasDrawn = parallelHands.length > 0;
  const buyHandCost = parallelHands.length * (additionalHandsBought % 10);
  const canBuyAnotherHand = hasDrawn && credits >= buyHandCost;
  const totalBetCost = betAmount * selectedHandCount;
  const canAffordBet = credits >= totalBetCost;
  const efficiency = round > 0 ? (totalEarnings / round).toFixed(2) : '0.00';
  const [highlightedRank, setHighlightedRank] = useState<HandRank | null>(null);
  const [payoutPopup, setPayoutPopup] = useState<number | null>(null);

  // Highlight payouts when hands are drawn
  useEffect(() => {
    if (parallelHands.length > 0) {
      // Find the best hand
      let bestHand: Hand | null = null;
      let bestResult: any = null;
      
      parallelHands.forEach((hand) => {
        const result = PokerEvaluator.evaluate(hand.cards);
        if (!bestResult || result.score > bestResult.score) {
          bestResult = result;
          bestHand = hand;
        }
      });

      if (bestResult && bestHand) {
        const withRewards = PokerEvaluator.applyRewards(bestResult, rewardTable);
        const payout = betAmount * withRewards.multiplier;
        if (payout > 0) {
          setHighlightedRank(bestResult.rank);
          setPayoutPopup(payout);
          setTimeout(() => {
            setHighlightedRank(null);
            setPayoutPopup(null);
          }, 2000);
        }
      }
    }
  }, [parallelHands, rewardTable, betAmount]);

  // Generate background colors based on round
  const hue1 = (round * 30) % 360;
  const hue2 = (round * 30 + 60) % 360;
  const hue3 = (round * 30 + 120) % 360;

  return (
    <div className="min-h-screen p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: `linear-gradient(135deg, 
            hsl(${hue1}, 70%, 20%) 0%, 
            hsl(${hue2}, 70%, 25%) 50%, 
            hsl(${hue3}, 70%, 20%) 100%)`,
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
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            background: `radial-gradient(circle at ${50 + Math.sin(round) * 20}% ${50 + Math.cos(round) * 20}%, 
              hsl(${hue1}, 100%, 50%) 0%, 
              transparent 50%)`,
            animation: 'pulse 4s ease-in-out infinite',
          }}
        />
      </div>
      <div className="max-w-7xl mx-auto relative z-0">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            {/* Logo Area */}
            <div className="bg-white rounded-lg shadow-lg p-3 h-16 w-24 flex items-center justify-center border-2 border-dashed border-gray-300">
              <span className="text-gray-400 text-xs">Logo</span>
            </div>
            <div className="bg-white rounded-lg shadow-lg px-6 py-3 flex gap-4">
            <p className="text-lg font-bold text-gray-800">
              Credits: <span className="text-green-600">{credits}</span>
            </p>
            <p className="text-lg font-bold text-gray-800">
              Round: <span className="text-blue-600">{round}</span>
            </p>
            <p className="text-lg font-bold text-gray-800">
              Efficiency: <span className="text-purple-600">{efficiency}</span>
            </p>
          </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Bet and Hand Controls */}
            <div className="bg-white rounded-lg shadow-lg px-4 py-2 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Bet:</label>
                <input
                  type="number"
                  min={minimumBet}
                  value={betAmount}
                  onChange={(e) => onSetBetAmount(Math.max(minimumBet, parseInt(e.target.value) || minimumBet))}
                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Hands:</label>
                <input
                  type="number"
                  min={1}
                  max={handCount}
                  value={selectedHandCount}
                  onChange={(e) => onSetSelectedHandCount(Math.max(1, Math.min(handCount, parseInt(e.target.value) || 1)))}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <button
              onClick={onOpenShop}
              disabled={playerHand.length === 5 && parallelHands.length === 0}
              className={`
                bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors
                ${playerHand.length === 5 && parallelHands.length === 0
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
                }
              `}
            >
              Shop
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Bet and Hand Selection */}
            {playerHand.length === 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Start New Hand</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bet Amount (Min: {minimumBet})
                    </label>
                    <input
                      type="number"
                      min={minimumBet}
                      value={betAmount}
                      onChange={(e) => onSetBetAmount(Math.max(minimumBet, parseInt(e.target.value) || minimumBet))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Hands (1 to {handCount})
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={handCount}
                      value={selectedHandCount}
                      onChange={(e) => onSetSelectedHandCount(Math.max(1, Math.min(handCount, parseInt(e.target.value) || 1)))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-lg font-semibold text-gray-800">
                      Total Bet Cost: <span className="text-red-600">{totalBetCost}</span> credits
                    </p>
                    {!canAffordBet && (
                      <p className="text-red-600 text-sm mt-2">
                        Insufficient credits for this bet
                      </p>
                    )}
                  </div>
                  <button
                    onClick={onDealHand}
                    disabled={!canAffordBet}
                    className={`
                      w-full px-8 py-3 rounded-lg font-bold text-lg transition-colors
                      ${
                        canAffordBet
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }
                    `}
                  >
                    Deal Hand
                  </button>
                </div>
              </div>
            )}

            {/* Player Hand */}
            {playerHand.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Hand</h2>
                <div className="flex gap-4 justify-center flex-wrap">
                  {playerHand.map((card, index) => (
                    <Card
                      key={card.id}
                      card={card}
                      isHeld={heldIndices.includes(index)}
                      onClick={() => onToggleHold(index)}
                      size="large"
                      showBack={!firstDrawComplete}
                      flipDelay={index * 100}
                    />
                  ))}
                </div>
                {playerHand.length === 5 && (
                  <div className="mt-4 text-center">
                    {!firstDrawComplete && (
                      <>
                        <p className="text-gray-600 mb-2">
                          Click cards to hold them, then draw {selectedHandCount} parallel hand
                          {selectedHandCount !== 1 ? 's' : ''}
                        </p>
                        <button
                          onClick={onDraw}
                          disabled={!canDraw}
                          className={`
                            px-8 py-3 rounded-lg font-bold text-lg transition-colors
                            ${
                              canDraw
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }
                          `}
                        >
                          Draw Parallel Hands
                        </button>
                      </>
                    )}
                    {firstDrawComplete && secondDrawAvailable && (
                      <>
                        <p className="text-gray-600 mb-2">
                          First draw complete! Re-hold cards if desired, then draw again.
                        </p>
                        <button
                          onClick={onDraw}
                          className="px-8 py-3 rounded-lg font-bold text-lg transition-colors bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Second Draw
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Summary Section */}
            {parallelHands.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Hand Summary</h2>
                
                {/* Held Cards */}
                {heldIndices.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-600 mb-2">Cards Held:</p>
                    <div className="flex gap-2">
                      {heldIndices.map(index => (
                        <Card key={playerHand[index].id} card={playerHand[index]} size="small" />
                      ))}
                    </div>
                  </div>
                )}

                {/* Individual Payouts */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-600 mb-2">Individual Payouts:</p>
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
                </div>

                {/* Total Payout */}
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">Total Payout:</span>
                    <span className="text-2xl font-bold text-green-600">
                      {parallelHands.reduce((sum, hand) => {
                        const result = PokerEvaluator.evaluate(hand.cards);
                        const withRewards = PokerEvaluator.applyRewards(result, rewardTable);
                        return sum + (betAmount * withRewards.multiplier);
                      }, 0)} credits
                    </span>
                  </div>
                </div>

                {/* Buy Another Hand Button */}
                <div className="text-center">
                  <button
                    onClick={onBuyAnotherHand}
                    disabled={!canBuyAnotherHand}
                    className={`
                      px-6 py-3 rounded-lg font-bold transition-colors text-lg
                      ${
                        canBuyAnotherHand
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }
                    `}
                  >
                    Buy Another Hand ({buyHandCost} Credits)
                  </button>
                </div>
              </div>
            )}

            {/* Results Grid */}
            {parallelHands.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">
                  Parallel Hands ({parallelHands.length})
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {parallelHands.map((hand, index) => {
                    const result = PokerEvaluator.evaluate(hand.cards);
                    const withRewards = PokerEvaluator.applyRewards(result, rewardTable);
                    const winnings = betAmount * withRewards.multiplier;

                    return (
                      <div
                        key={hand.id}
                        className={`
                          border-2 rounded-lg p-4
                          hand-reveal
                          ${
                            winnings > 0
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-300 bg-gray-50'
                          }
                        `}
                        style={{
                          animationDelay: `${index * 100}ms`,
                          animation: 'slideInFromRight 0.5s ease-out forwards',
                          opacity: 0,
                        }}
                      >
                        <div className="flex gap-1 justify-center mb-2">
                          {hand.cards.map((card) => (
                            <Card key={card.id} card={card} size="small" />
                          ))}
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-gray-700 capitalize">
                            {result.rank.replace(/-/g, ' ')}
                          </p>
                          {winnings > 0 && (
                            <p className="text-green-600 font-bold mt-1">
                              +{betAmount * winnings} Credits
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Reward Table Sidebar */}
          <div className="lg:col-span-1">
            <RewardTable 
              rewardTable={rewardTable} 
              highlightedRank={highlightedRank}
              payoutAmount={payoutPopup || undefined}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
