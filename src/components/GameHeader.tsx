interface GameHeaderProps {
  credits: number;
  round?: number;
  efficiency?: string;
}

export function GameHeader({ credits, round, efficiency }: GameHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
      <div className="flex items-center gap-4">
        {/* Logo Area */}
        <div className="bg-white rounded-lg shadow-lg p-3 h-16 w-24 flex items-center justify-center border-2 border-dashed border-gray-300">
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
      </div>
    </div>
  );
}
