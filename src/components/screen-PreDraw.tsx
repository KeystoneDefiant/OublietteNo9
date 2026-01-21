import { useState, useMemo, useEffect } from 'react';
import { RewardTable } from './RewardTable';
import { CheatsModal } from './CheatsModal';
import { GameHeader } from './GameHeader';
import { FailureStateType, GameState } from '../types';
import { gameConfig } from '../config/gameConfig';

interface PreDrawProps {
  credits: number;
  handCount: number;
  selectedHandCount: number;
  betAmount: number;
  minimumBet: number;
  rewardTable: { [key: string]: number };
  gameOver: boolean;
  round: number;
  totalEarnings: number;
  failureState?: FailureStateType;
  gameState?: GameState;
  onSetBetAmount: (amount: number) => void;
  onSetSelectedHandCount: (count: number) => void;
  onDealHand: () => void;
  onEndRun: () => void;
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
  round,
  totalEarnings,
  failureState,
  gameState,
  onSetBetAmount,
  onSetSelectedHandCount,
  onDealHand,
  onEndRun,
  onCheatAddCredits,
  onCheatAddHands,
}: PreDrawProps) {
  const [showCheats, setShowCheats] = useState(false);
  const [showEndRunConfirm, setShowEndRunConfirm] = useState(false);
  const [betInputError, setBetInputError] = useState<string>('');
  const [handCountInputError, setHandCountInputError] = useState<string>('');
  const [maxBetQuip, setMaxBetQuip] = useState<string>('Max Bet');
  
  // Pick a random quip when the PreDraw screen appears
  useEffect(() => {
    const quips = gameConfig.quips.maxBet;
    const randomQuip = quips[Math.floor(Math.random() * quips.length)];
    setMaxBetQuip(randomQuip);
  }, []); // Empty dependency array means this runs once when component mounts
  
  // Memoize expensive calculations
  const totalBetCost = useMemo(
    () => betAmount * selectedHandCount,
    [betAmount, selectedHandCount]
  );
  const canAffordBet = useMemo(() => credits >= totalBetCost, [credits, totalBetCost]);
  const canPlayRound = useMemo(() => !gameOver && canAffordBet, [gameOver, canAffordBet]);
  const efficiency = useMemo(
    () => (round > 0 ? (totalEarnings / round).toFixed(2) : '0.00'),
    [round, totalEarnings]
  );

  const handleBetAmountChange = (value: string) => {
    // Clear any existing error
    setBetInputError('');
    
    // Parse the input
    const numValue = parseInt(value);
    
    // Validate input
    if (value === '' || isNaN(numValue)) {
      setBetInputError('Please enter a valid number');
      return;
    }
    
    if (numValue < minimumBet) {
      setBetInputError(`Bet must be at least ${minimumBet} credits`);
      onSetBetAmount(minimumBet);
      return;
    }
    
    if (numValue < 0) {
      setBetInputError('Bet cannot be negative');
      return;
    }
    
    if (numValue > credits) {
      setBetInputError(`You only have ${credits} credits`);
    }
    
    onSetBetAmount(numValue);
  };

  const handleHandCountChange = (value: string) => {
    // Clear any existing error
    setHandCountInputError('');
    
    // Parse the input
    const numValue = parseInt(value);
    
    // Validate input
    if (value === '' || isNaN(numValue)) {
      setHandCountInputError('Please enter a valid number');
      return;
    }
    
    if (numValue < 1) {
      setHandCountInputError('Must play at least 1 hand');
      onSetSelectedHandCount(1);
      return;
    }
    
    if (numValue > handCount) {
      setHandCountInputError(`Maximum ${handCount} hands available`);
      onSetSelectedHandCount(handCount);
      return;
    }
    
    if (numValue < 0) {
      setHandCountInputError('Hand count cannot be negative');
      return;
    }
    
    onSetSelectedHandCount(numValue);
  };

  return (
    <div id="preDraw-screen" className="min-h-screen p-6 relative overflow-hidden select-none" role="main">
      <div className="max-w-7xl mx-auto relative z-0">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <GameHeader 
            credits={credits} 
            round={round} 
            efficiency={efficiency}
            failureState={failureState}
            gameState={gameState}
          />
          <div className="flex gap-3">
            <button
              onClick={() => setShowCheats(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              aria-label="Open cheats menu"
            >
              Cheats
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
                <div role="group" aria-labelledby="bet-amount-label">
                  <label id="bet-amount-label" className="block text-sm font-medium text-gray-700 mb-2">
                    Bet Amount per Hand (Min: {minimumBet})
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setBetInputError('');
                        onSetBetAmount(Math.max(minimumBet, betAmount - 1));
                      }}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition-colors text-xl"
                      aria-label="Decrease bet amount"
                    >
                      ▼
                    </button>
                    <input
                      type="number"
                      min={minimumBet}
                      value={betAmount}
                      onChange={(e) => handleBetAmountChange(e.target.value)}
                      onBlur={() => {
                        // On blur, ensure valid value
                        if (betAmount < minimumBet) {
                          onSetBetAmount(minimumBet);
                          setBetInputError('');
                        }
                      }}
                      className={`flex-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg ${
                        betInputError
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-300 focus:border-blue-500'
                      }`}
                      aria-label="Bet amount per hand"
                      aria-describedby={betInputError ? 'bet-error' : undefined}
                      aria-invalid={!!betInputError}
                    />
                    <button
                      onClick={() => {
                        setBetInputError('');
                        onSetBetAmount(betAmount + 1);
                      }}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition-colors text-xl"
                      aria-label="Increase bet amount"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => {
                        setBetInputError('');
                        // Calculate maximum bet: credits divided by hand count, but at least minimumBet
                        const maxBetPerHand = Math.floor(credits / selectedHandCount);
                        const maxBet = Math.max(minimumBet, maxBetPerHand);
                        onSetBetAmount(maxBet);
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors whitespace-nowrap"
                      aria-label="Set bet amount to maximum affordable"
                    >
                      Max
                    </button>
                  </div>
                  {betInputError && (
                    <p id="bet-error" className="text-red-600 text-sm mt-2 font-medium" role="alert">
                      {betInputError}
                    </p>
                  )}
                </div>

                {/* Hand Count */}
                <div role="group" aria-labelledby="hand-count-label">
                  <label id="hand-count-label" className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Hands to Play (1 to {handCount})
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setHandCountInputError('');
                        onSetSelectedHandCount(Math.max(1, selectedHandCount - 1));
                      }}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition-colors text-xl"
                      aria-label="Decrease number of hands"
                    >
                      ▼
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={handCount}
                      value={selectedHandCount}
                      onChange={(e) => handleHandCountChange(e.target.value)}
                      onBlur={() => {
                        // On blur, ensure valid value
                        if (selectedHandCount < 1) {
                          onSetSelectedHandCount(1);
                          setHandCountInputError('');
                        } else if (selectedHandCount > handCount) {
                          onSetSelectedHandCount(handCount);
                          setHandCountInputError('');
                        }
                      }}
                      className={`flex-1 px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg ${
                        handCountInputError
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-300 focus:border-blue-500'
                      }`}
                      aria-label="Number of hands to play"
                      aria-describedby={handCountInputError ? 'hand-count-error' : undefined}
                      aria-invalid={!!handCountInputError}
                    />
                    <button
                      onClick={() => {
                        setHandCountInputError('');
                        onSetSelectedHandCount(Math.min(handCount, selectedHandCount + 1));
                      }}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition-colors text-xl"
                      aria-label="Increase number of hands"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => {
                        setHandCountInputError('');
                        setBetInputError('');
                        
                        // Step 1: Try to set to maximum hands
                        let targetHandCount = handCount;
                        let targetBetAmount = betAmount;
                        
                        // Step 2: Check if player can afford max hands at current bet
                        const totalCost = targetBetAmount * targetHandCount;
                        
                        if (credits < totalCost) {
                          // Step 3: Calculate optimal bet amount for max hands
                          const optimalBet = Math.floor(credits / targetHandCount);
                          
                          if (optimalBet >= minimumBet) {
                            // Can afford max hands by reducing bet
                            targetBetAmount = optimalBet;
                          } else {
                            // Step 4: Can't afford even at minimum bet, reduce hands
                            // Find maximum hands where credits >= minimumBet * hands
                            targetHandCount = Math.floor(credits / minimumBet);
                            // Ensure at least 1 hand
                            targetHandCount = Math.max(1, targetHandCount);
                            // Ensure not more than max available
                            targetHandCount = Math.min(handCount, targetHandCount);
                            targetBetAmount = minimumBet;
                          }
                        }
                        
                        // Apply the calculated values
                        onSetBetAmount(targetBetAmount);
                        onSetSelectedHandCount(targetHandCount);
                      }}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors whitespace-nowrap"
                      aria-label="Set to maximum number of hands"
                    >
                      Max
                    </button>
                  </div>
                  {handCountInputError && (
                    <p id="hand-count-error" className="text-red-600 text-sm mt-2 font-medium" role="alert">
                      {handCountInputError}
                    </p>
                  )}
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

                {/* Run Round and Max Bet Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={onDealHand}
                    disabled={!canPlayRound}
                    className={`
                      flex-[2] px-8 py-4 rounded-lg font-bold text-xl transition-colors
                      ${
                        canPlayRound
                          ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                          : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      }
                    `}
                    aria-label={gameOver ? 'Cannot play - game over' : `Run round with ${selectedHandCount} hands at ${betAmount} credits per hand`}
                    aria-disabled={!canPlayRound}
                  >
                    {gameOver ? 'Cannot Play - Game Over' : 'Run Round'}
                  </button>
                  <button
                    onClick={() => {
                      setBetInputError('');
                      setHandCountInputError('');
                      
                      // Step 1: Start with maximum hands
                      let targetHandCount = handCount;
                      
                      // Step 2: Calculate maximum bet for max hands
                      let targetBetAmount = Math.floor(credits / targetHandCount);
                      
                      // Step 3: If bet is below minimum, reduce hands until we can afford minimum bet
                      if (targetBetAmount < minimumBet) {
                        targetHandCount = Math.floor(credits / minimumBet);
                        targetHandCount = Math.max(1, targetHandCount);
                        targetHandCount = Math.min(handCount, targetHandCount);
                        targetBetAmount = minimumBet;
                      }
                      
                      // Step 4: If bet is 1, reduce hands until we can afford a higher bet (if possible)
                      // This ensures we don't play with bet of 1 when we can afford a better bet
                      if (targetBetAmount === 1 && credits > targetHandCount) {
                        // Try to find a combination where bet > 1 and bet >= minimumBet
                        // We want to maximize hands while keeping bet > 1
                        for (let hands = targetHandCount; hands >= 1; hands--) {
                          const bet = Math.floor(credits / hands);
                          if (bet > 1 && bet >= minimumBet) {
                            targetHandCount = hands;
                            targetBetAmount = bet;
                            break;
                          }
                        }
                        // If we couldn't find a bet > 1, keep the current values (bet of 1 is acceptable if minimumBet allows it)
                      }
                      
                      // Step 5: Apply the calculated values
                      onSetBetAmount(targetBetAmount);
                      onSetSelectedHandCount(targetHandCount);
                      
                      // Step 6: Check if we can afford to play, then run the round
                      const finalCost = targetBetAmount * targetHandCount;
                      if (!gameOver && credits >= finalCost) {
                        // Use requestAnimationFrame to ensure state updates are processed before calling onDealHand
                        // Double RAF ensures we wait for the next frame after state updates are applied
                        requestAnimationFrame(() => {
                          requestAnimationFrame(() => {
                            onDealHand();
                          });
                        });
                      }
                    }}
                    disabled={gameOver}
                    className={`
                      flex-1 px-4 py-4 rounded-lg font-bold text-lg transition-colors
                      ${
                        gameOver
                          ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                      }
                    `}
                    aria-label={gameOver ? 'Cannot play - game over' : 'Set maximum hands and bet, then run round'}
                    aria-disabled={gameOver}
                  >
                    {maxBetQuip}
                  </button>
                </div>

                {/* End Run Button */}
                <button
                  onClick={() => setShowEndRunConfirm(true)}
                  className="w-full px-8 py-4 rounded-lg font-bold text-xl transition-colors bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl"
                  aria-label="End current run and return to main menu"
                >
                  End Run
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

      {/* End Run Confirmation Modal */}
      {showEndRunConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 select-none">
          <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">End Run?</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to end your run? You will return to the main menu.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowEndRunConfirm(false)}
                className="flex-1 px-4 py-3 rounded-lg font-bold transition-colors bg-gray-600 hover:bg-gray-700 text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowEndRunConfirm(false);
                  onEndRun();
                }}
                className="flex-1 px-4 py-3 rounded-lg font-bold transition-colors bg-red-600 hover:bg-red-700 text-white"
              >
                Confirm End Run
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
