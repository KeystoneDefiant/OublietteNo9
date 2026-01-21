import { useState, useEffect } from 'react';
import { Card as CardType, Hand, FailureStateType, GameState } from '../types';
import { Card } from './Card';
import { GameHeader } from './GameHeader';
import { RewardTable } from './RewardTable';
import { DevilsDealCard } from './DevilsDealCard';
import { gameConfig } from '../config/gameConfig';

interface GameTableProps {
  playerHand: CardType[];
  heldIndices: number[];
  parallelHands: Hand[];
  rewardTable: { [key: string]: number };
  credits: number;
  selectedHandCount: number;
  round: number;
  totalEarnings: number;
  firstDrawComplete: boolean;
  secondDrawAvailable: boolean;
  failureState?: FailureStateType;
  gameState?: GameState;
  onToggleHold: (index: number) => void;
  onToggleDevilsDealHold: () => void;
  onDraw: () => void;
}

export function GameTable({
  playerHand,
  heldIndices,
  parallelHands,
  rewardTable,
  credits,
  selectedHandCount,
  round,
  totalEarnings,
  firstDrawComplete,
  secondDrawAvailable,
  failureState,
  gameState,
  onToggleHold,
  onToggleDevilsDealHold,
  onDraw,
}: GameTableProps) {
  const canDraw = playerHand.length === 5 && parallelHands.length === 0;
  const efficiency = round > 0 ? (totalEarnings / round).toFixed(2) : '0.00';
  
  // Get random quip for Devil's Deal
  const [devilsDealQuip, setDevilsDealQuip] = useState<string>('');
  useEffect(() => {
    if (gameState?.devilsDealCard) {
      const quips = gameConfig.quips.devilsDeal;
      const randomQuip = quips[Math.floor(Math.random() * quips.length)];
      setDevilsDealQuip(randomQuip);
    }
  }, [gameState?.devilsDealCard]);

  return (
    <div id="gameTable-screen" className="min-h-screen p-6 relative overflow-hidden select-none">
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
          {/* Main Game Area */}
          <div className="lg:col-span-3">
            {/* Player Hand - Card Selection Screen */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Hand</h2>
              <div className="flex gap-4 justify-center flex-wrap relative">
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
                {gameState?.devilsDealCard && (
                  <DevilsDealCard
                    card={gameState.devilsDealCard}
                    cost={gameState.devilsDealCost}
                    quip={devilsDealQuip}
                    isHeld={gameState.devilsDealHeld}
                    isDisabled={heldIndices.length === 5 && !gameState.devilsDealHeld}
                    onHold={onToggleDevilsDealHold}
                  />
                )}
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
          </div>

          {/* Reward Table Sidebar */}
          <div className="lg:col-span-1">
            <RewardTable rewardTable={rewardTable} wildCardCount={gameState?.wildCardCount || 0} />
          </div>
        </div>
      </div>
    </div>
  );
}
