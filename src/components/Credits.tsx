interface CreditsProps {
  onClose: () => void;
}

export function Credits({ onClose }: CreditsProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Oubliette No. 9</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Game Design & Development</h3>
            <p className="text-gray-600">Chris Flohr</p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Special Thanks</h3>
            <p className="text-gray-600">You, for taking a peek at this nonsense.</p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Stuff I'm working on</h3>
            <ul className="text-gray-600">
              <li>Shop will only give you 3 options, with rarity percentages</li>
              <li>
                Pricing will be adjusted for single vs bundle parallel hands - she real screwed at
                the moment
              </li>
              <li>Special game modes that alter the starting configuration, deck, and balance</li>
              <li>Art?</li>
              <li>Better animations when seeing your hands</li>
              <li>More themes!</li>
              <li>Sound effects and music</li>
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
