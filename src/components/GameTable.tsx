import { Card as CardType, Hand } from '../types';
import { Card } from './Card';
import { RewardTable } from './RewardTable';

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
  onToggleHold: (index: number) => void;
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
  onToggleHold,
  onDraw,
}: GameTableProps) {
  const canDraw = playerHand.length === 5 && parallelHands.length === 0;
  const efficiency = round > 0 ? (totalEarnings / round).toFixed(2) : '0.00';

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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Game Area */}
          <div className="lg:col-span-3">
            {/* Player Hand - Card Selection Screen */}
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
