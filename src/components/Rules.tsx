interface RulesProps {
  onClose: () => void;
}

export function Rules({ onClose }: RulesProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Rules</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="space-y-4 text-gray-700">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">How to Play</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>Set your bet amount and select how many parallel hands to play</li>
              <li>Deal your initial 5-card hand</li>
              <li>Hold cards you want to keep by clicking on them</li>
              <li>Draw to generate parallel hands based on your held cards</li>
              <li>Earn credits based on your hand rankings and multipliers</li>
              <li>Buy cool stuff in the store to make big numbers go bigger.</li>
            </ol>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Hand Rankings</h3>
            <p className="mb-2">Hands are ranked from highest to lowest:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Royal Flush</li>
              <li>Straight Flush</li>
              <li>Four of a Kind</li>
              <li>Full House</li>
              <li>Flush</li>
              <li>Straight</li>
              <li>Three of a Kind</li>
              <li>Two Pair</li>
              <li>One Pair (Jacks or better)</li>
            </ol>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Special Features</h3>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>
                <strong>Dead Cards:</strong> Cards that don't count toward any poker hand
              </li>
              <li>
                <strong>Wild Cards:</strong> Count as any suit and rank (max 3 in deck)
              </li>
              <li>
                <strong>Card Removal:</strong> Permanently remove cards from the deck
              </li>
              <li>
                <strong>2x Payout Chance:</strong> Random chance to double your payout
              </li>
              <li>
                <strong>Minimum Bet:</strong> Increases by 5% each round
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
