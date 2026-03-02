interface RulesProps {
  onClose: () => void;
}

export function Rules({ onClose }: RulesProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="game-panel rounded-lg shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold" style={{ color: 'var(--game-accent-gold)' }}>Rules</h2>
          <button
            onClick={onClose}
            className="text-2xl font-bold hover:opacity-80"
            style={{ color: 'var(--game-text-muted)' }}
          >
            ×
          </button>
        </div>

        <div className="space-y-4" style={{ color: 'var(--game-text)' }}>
          <div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--game-accent-gold)' }}>How to Play</h3>
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
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--game-accent-gold)' }}>Hand Rankings</h3>
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
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--game-accent-gold)' }}>Special Features</h3>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>
                <strong>Dead Cards:</strong> Cards that don't count toward any poker hand. Add these
                to your deck for an infusion of credits, max of 10.
              </li>
              <li>
                <strong>Wild Cards:</strong> Count as any suit and rank to help form better hands.
                Max of 3 in your deck.
              </li>
              <li>
                <strong>Extra Draw:</strong> Gives you one additional draw per round to improve your
                hand.
              </li>
              <li>
                <strong>Devil's Deal:</strong> A card that will give you the best possible hand is offered to you as a deal. The cost is how much that hand would be worth after all parallel hands would be played with it, plus a little 'house edge'. Be careful when choosing this! It can be very useful, but can also be used extremely wrong!
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="font-bold py-2 px-6 rounded-lg transition-colors border-2 hover:opacity-90"
            style={{ backgroundColor: 'var(--game-accent-red)', borderColor: 'var(--game-accent-gold)', color: 'var(--game-text)' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
