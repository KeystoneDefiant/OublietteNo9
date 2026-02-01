import { FailureStateType, GameState } from '../types';
import { getFailureStateDescription } from '../utils/failureConditions';

interface GameHeaderProps {
  credits: number;
  round?: number;
  efficiency?: string;
  failureState?: FailureStateType;
  gameState?: GameState; // Optional full state for failure state description
  musicEnabled?: boolean;
  soundEffectsEnabled?: boolean;
  onToggleMusic?: () => void;
  onToggleSoundEffects?: () => void;
  onShowPayoutTable?: () => void;
}

export function GameHeader({ credits, round, efficiency, failureState, gameState, musicEnabled, soundEffectsEnabled, onToggleMusic, onToggleSoundEffects, onShowPayoutTable }: GameHeaderProps) {
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
            Credits: <span className="text-green-600">{credits}</span>
          </p>
          {round !== undefined && (
            <p className="text-lg font-bold text-gray-800">
              Round: <span className="text-blue-600">{round}</span>
            </p>
          )}
          {efficiency !== undefined && (
            <p className="text-lg font-bold text-gray-800">
              Efficiency: <span className="text-purple-600">{efficiency}</span>
            </p>
          )}
        </div>
        {failureState && failureDescription && (
          <div className="bg-red-50 border-2 border-red-400 rounded-lg shadow-lg px-6 py-3">
            <p className="text-sm font-semibold text-red-800 mb-1">⚠️ Failure Condition</p>
            <p className="text-sm font-medium text-red-700">{failureDescription}</p>
          </div>
        )}
      </div>
      
      {/* Audio Controls */}
      <div className="flex items-center gap-2">
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
