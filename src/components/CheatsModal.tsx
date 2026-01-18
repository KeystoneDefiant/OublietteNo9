interface CheatsModalProps {
  onClose: () => void;
  onAddCredits: (amount: number) => void;
  onAddHands: (amount: number) => void;
}

export function CheatsModal({ onClose, onAddCredits, onAddHands }: CheatsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Cheats</h2>

        <div className="space-y-3 mb-6">
          <button
            onClick={() => {
              onAddCredits(1000);
              onClose();
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Add 1000 Credits
          </button>
          <button
            onClick={() => {
              onAddCredits(10000);
              onClose();
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Add 10000 Credits
          </button>
          <button
            onClick={() => {
              onAddHands(10);
              onClose();
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Add 10 Parallel Hands
          </button>
          <button
            onClick={() => {
              onAddHands(50);
              onClose();
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Add 50 Parallel Hands
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
