import { useState } from 'react';
import { RewardTable } from './RewardTable';
import { CheatsModal } from './CheatsModal';
import { GameHeader } from './GameHeader';

interface PreDrawProps {
  credits: number;
  handCount: number;
  selectedHandCount: number;
  betAmount: number;
  minimumBet: number;
  rewardTable: { [key: string]: number };
  gameOver: boolean;
  onSetBetAmount: (amount: number) => void;
  onSetSelectedHandCount: (count: number) => void;
  onDealHand: () => void;
  onOpenShop: () => void;
  onCheatAddCredits: (amount: number) => void;
  onCheatAddHands: (amount: number) => void;
}

export function PreDraw({
  credits,
  handCount,
  selectedHandCount,
  betAmount,
  minimumBet,
  rewardTable,
  gameOver,
  onSetBetAmount,
  onSetSelectedHandCount,
  onDealHand,
  onOpenShop,
  onCheatAddCredits,
  onCheatAddHands,
}: PreDrawProps) {
  const [showCheats, setShowCheats] = useState(false);
  const totalBetCost = betAmount * selectedHandCount;
  const canAffordBet = credits >= totalBetCost;
  const canPlayRound = !gameOver && canAffordBet;

  return (
    <div id="preDraw-screen" className="min-h-screen p-6 relative overflow-hidden">
      <div className="max-w-5xl mx-auto relative z-0">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <GameHeader credits={credits} />
          <div className="flex gap-3">
            <button
              onClick={() => setShowCheats(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Cheats
            </button>
            <button
              onClick={onOpenShop}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Shop
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h1 className="text-4xl font-bold mb-8 text-gray-800">
                {gameOver ? 'Game Over' : 'Ready to Play?'}
              </h1>

              {gameOver && (
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-8">
                  <p className="text-lg font-semibold text-red-700 mb-2">Insufficient Credits</p>
                  <p className="text-red-600 mb-2">
                    You need at least {minimumBet * selectedHandCount} credits to play{' '}
                    {selectedHandCount} hand{selectedHandCount !== 1 ? 's' : ''}.
                  </p>
                  <p className="text-red-600">
                    You can reduce your bet amount or number of hands, or visit the Shop to gain
                    credits by adding negative cards to your deck.
                  </p>
                </div>
              )}

              <div className="space-y-6">
                {/* Bet Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bet Amount per Hand (Min: {minimumBet})
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onSetBetAmount(Math.max(minimumBet, betAmount - 1))}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition-colors text-xl"
                    >
                      ▼
                    </button>
                    <input
                      type="number"
                      min={minimumBet}
                      value={betAmount}
                      onChange={(e) =>
                        onSetBetAmount(Math.max(minimumBet, parseInt(e.target.value) || minimumBet))
                      }
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                    />
                    <button
                      onClick={() => onSetBetAmount(betAmount + 1)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition-colors text-xl"
                    >
                      ▲
                    </button>
                  </div>
                </div>

                {/* Hand Count */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Hands to Play (1 to {handCount})
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onSetSelectedHandCount(Math.max(1, selectedHandCount - 1))}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition-colors text-xl"
                    >
                      ▼
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={handCount}
                      value={selectedHandCount}
                      onChange={(e) =>
                        onSetSelectedHandCount(
                          Math.max(1, Math.min(handCount, parseInt(e.target.value) || 1))
                        )
                      }
                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                    />
                    <button
                      onClick={() =>
                        onSetSelectedHandCount(Math.min(handCount, selectedHandCount + 1))
                      }
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition-colors text-xl"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => onSetSelectedHandCount(handCount)}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors whitespace-nowrap"
                    >
                      Max
                    </button>
                  </div>
                </div>

                {/* Total Cost */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200">
                  <p className="text-lg font-semibold text-gray-700 mb-1">Total Bet Cost:</p>
                  <p className="text-4xl font-bold text-blue-600">{totalBetCost} credits</p>
                  {!canAffordBet && (
                    <p className="text-red-600 text-sm mt-3">Insufficient credits for this bet</p>
                  )}
                  {gameOver && !canAffordBet && (
                    <p className="text-red-600 text-sm mt-2">
                      Reduce your bet or visit the Shop to add negative cards for credits.
                    </p>
                  )}
                </div>

                {/* Run Round Button */}
                <button
                  onClick={onDealHand}
                  disabled={!canPlayRound}
                  className={`
                    w-full px-8 py-4 rounded-lg font-bold text-xl transition-colors
                    ${
                      canPlayRound
                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    }
                  `}
                >
                  {gameOver ? 'Cannot Play - Game Over' : 'Run Round'}
                </button>
              </div>
            </div>
          </div>

          {/* Reward Table Sidebar */}
          <div className="lg:col-span-1">
            <RewardTable rewardTable={rewardTable} />
          </div>
        </div>
      </div>

      {/* Cheats Modal */}
      {showCheats && (
        <CheatsModal
          onClose={() => setShowCheats(false)}
          onAddCredits={onCheatAddCredits}
          onAddHands={onCheatAddHands}
        />
      )}
    </div>
  );
}
