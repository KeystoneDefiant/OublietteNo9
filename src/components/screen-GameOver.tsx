import { formatCredits } from '../utils/format';
import { getGameOverDisplay } from '../utils/gameOverDisplay';
import { GameOverReason, GameState } from '../types';

interface GameOverProps {
  round: number;
  totalEarnings: number;
  credits: number;
  /** Why the run ended; used for specific messaging */
  gameOverReason?: GameOverReason | null;
  /** Full state for failure condition descriptions */
  gameState?: GameState | null;
  onReturnToMenu: () => void;
}

export function GameOver({
  round,
  totalEarnings,
  credits,
  gameOverReason,
  gameState,
  onReturnToMenu,
}: GameOverProps) {
  const efficiency = round > 0 ? (totalEarnings / round).toFixed(2) : '0.00';
  const display = getGameOverDisplay(
    gameOverReason ?? null,
    gameState ?? null,
    gameState ? { minimumBet: gameState.minimumBet, handCount: gameState.handCount } : undefined
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {display.title}
          </h1>
          <p className="text-gray-600">
            {display.subtitle}
          </p>
        </div>
        
        <div className="space-y-4 mb-8">
          <div className="bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg p-4">
            <p className="text-lg font-semibold text-white text-center">
              Run Summary
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
              <p className="text-sm text-gray-600 font-medium">Rounds Survived</p>
              <p className="text-3xl font-bold text-blue-600">{round}</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
              <p className="text-sm text-gray-600 font-medium">Total Earnings</p>
              <p className="text-3xl font-bold text-green-600">
                {formatCredits(totalEarnings)}
              </p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
              <p className="text-sm text-gray-600 font-medium">Avg per Round</p>
              <p className="text-3xl font-bold text-purple-600">{efficiency}</p>
              <p className="text-xs text-gray-500 mt-1">credits/round</p>
            </div>
            
            <div className={`${display.isVoluntaryEnd ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'} rounded-lg p-4 border-2`}>
              <p className="text-sm text-gray-600 font-medium">Final Credits</p>
              <p className={`text-3xl font-bold ${display.isVoluntaryEnd ? 'text-amber-600' : 'text-red-600'}`}>
                {formatCredits(credits)}
              </p>
              {display.isVoluntaryEnd && (
                <p className="text-xs text-green-600 font-semibold mt-1">✓ Finished with credits!</p>
              )}
            </div>
          </div>

          {display.isVoluntaryEnd && credits > 100 && (
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-4 border-2 border-amber-300">
              <p className="text-center text-amber-800 font-semibold">
                🏆 Excellent run! You finished with {formatCredits(credits)} credits!
              </p>
            </div>
          )}

          {display.tip && (
            <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-300">
              <p className="text-center text-gray-600 text-sm">
                {display.tip}
              </p>
            </div>
          )}
        </div>

        <div className="text-center">
          <button
            onClick={onReturnToMenu}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            aria-label="Return to main menu"
          >
            Return to Menu
          </button>
        </div>
      </div>
    </div>
  );
}
