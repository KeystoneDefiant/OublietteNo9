import { FailureStateType, GameState } from '../types';
import { getFailureStateDescription } from '../utils/failureConditions';
import { formatCredits } from '../utils/format';

type AnimationSpeedMode = 1 | 2 | 3 | 'skip';

interface GameHeaderProps {
  credits: number;
  round?: number;
  efficiency?: string;
  failureState?: FailureStateType;
  gameState?: GameState; // Optional full state for failure state description
  /** When true, hide failure condition in header (e.g. PreDraw shows it in main panel) */
  hideFailureInHeader?: boolean;
  musicEnabled?: boolean;
  soundEffectsEnabled?: boolean;
  onToggleMusic?: () => void;
  onToggleSoundEffects?: () => void;
  onShowPayoutTable?: () => void;
  animationSpeedMode?: AnimationSpeedMode;
  onCycleAnimationSpeed?: () => void;
}

export function GameHeader({ credits, round, efficiency, failureState, gameState, hideFailureInHeader, musicEnabled, soundEffectsEnabled, onToggleMusic, onToggleSoundEffects, onShowPayoutTable, animationSpeedMode = 1, onCycleAnimationSpeed }: GameHeaderProps) {
  const failureDescription = failureState && gameState 
    ? getFailureStateDescription(failureState, gameState)
    : null;

  return (
    <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
      <div className="flex items-center gap-4">
        {/* Logo Area */}
        <div className="bg-white rounded-lg shadow-lg p-3 h-16 w-24 flex items-center justify-center border-2 border-gray-300">
          <span className="text-gray-400 text-xs">
            <img src="images/logos/number9.png" alt="Logo" />
          </span>
        </div>
        <div className="bg-white rounded-lg shadow-lg px-6 py-3 flex gap-4">
          <p className="text-lg font-bold text-gray-800">
            Credits: <span className="text-green-600">{formatCredits(credits)}</span>
          </p>
          {round !== undefined && (
            <p className="text-lg font-bold text-gray-800">
              Round: <span className="text-blue-600">{round}</span>
            </p>
          )}
          {efficiency !== undefined && (
            <p className="text-lg font-bold text-gray-800" title="Average credits earned per round (total earnings ÷ rounds played)">
              Efficiency: <span className="text-purple-600">{efficiency}</span>
            </p>
          )}
        </div>
        {!hideFailureInHeader && failureState && failureDescription && (
          <div className="bg-red-50 border-2 border-red-400 rounded-lg shadow-lg px-6 py-3">
            <p className="text-sm font-semibold text-red-800 mb-1">⚠️ Failure Condition</p>
            <p className="text-sm font-medium text-red-700">{failureDescription}</p>
          </div>
        )}
      </div>
      
      {/* Animation speed + Audio Controls */}
      <div className="flex items-center gap-2">
        {onCycleAnimationSpeed && (
          <button
            onClick={onCycleAnimationSpeed}
            className={`font-bold py-2 px-4 rounded-lg transition-colors shadow-lg ${
              animationSpeedMode === 1
                ? 'bg-indigo-100 hover:bg-indigo-200 text-indigo-800'
                : animationSpeedMode === 2
                  ? 'bg-indigo-200 hover:bg-indigo-300 text-indigo-900'
                  : animationSpeedMode === 3
                    ? 'bg-indigo-400 hover:bg-indigo-500 text-white'
                    : 'bg-red-400 hover:bg-red-500 text-white'
            }`}
            title={
              animationSpeedMode === 1
                ? 'Animation 1× (click for 2×)'
                : animationSpeedMode === 2
                  ? 'Animation 2× (click for 3×)'
                  : animationSpeedMode === 3
                    ? 'Animation 3× (click to skip)'
                    : 'Skip animation (click for 1×)'
            }
          >
            {animationSpeedMode === 1 ? '1×' : animationSpeedMode === 2 ? '2×' : animationSpeedMode === 3 ? '3×' : '⏭'}
          </button>
        )}
        {onShowPayoutTable && (
          <button
            onClick={onShowPayoutTable}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-lg"
            title="Show Payout Table"
          >
            💰 Payouts
          </button>
        )}
        {onToggleMusic && (
          <button
            onClick={onToggleMusic}
            className={`font-bold py-2 px-4 rounded-lg transition-colors shadow-lg ${
              musicEnabled 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-400 hover:bg-gray-500 text-gray-700'
            }`}
            title={musicEnabled ? 'Disable Music' : 'Enable Music'}
          >
            {musicEnabled ? '🎵' : '🔇'}
          </button>
        )}
        {onToggleSoundEffects && (
          <button
            onClick={onToggleSoundEffects}
            className={`font-bold py-2 px-4 rounded-lg transition-colors shadow-lg ${
              soundEffectsEnabled 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-400 hover:bg-gray-500 text-gray-700'
            }`}
            title={soundEffectsEnabled ? 'Disable Sound Effects' : 'Enable Sound Effects'}
          >
            {soundEffectsEnabled ? '🔊' : '🔇'}
          </button>
        )}
      </div>
    </div>
  );
}
