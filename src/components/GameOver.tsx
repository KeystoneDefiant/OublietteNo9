interface GameOverProps {
  round: number;
  totalEarnings: number;
  credits: number;
  onReturnToMenu: () => void;
}

export function GameOver({
  round,
  totalEarnings,
  credits,
  onReturnToMenu,
}: GameOverProps) {
  const efficiency = round > 0 ? (totalEarnings / round).toFixed(2) : '0.00';

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">Game Over</h1>
        
        <div className="space-y-4 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-lg font-semibold text-gray-700">
              Final Stats
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Rounds Played</p>
              <p className="text-2xl font-bold text-blue-600">{round}</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Earnings</p>
              <p className="text-2xl font-bold text-green-600">{totalEarnings}</p>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Efficiency</p>
              <p className="text-2xl font-bold text-purple-600">{efficiency} credits/round</p>
            </div>
            
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Final Credits</p>
              <p className="text-2xl font-bold text-red-600">{credits}</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={onReturnToMenu}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors text-lg"
          >
            Return to Menu
          </button>
        </div>
      </div>
    </div>
  );
}
