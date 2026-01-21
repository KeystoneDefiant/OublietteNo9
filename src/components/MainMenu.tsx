interface MainMenuProps {
  onStartRun: () => void;
  onCredits: () => void;
  onRules: () => void;
  onSettings: () => void;
}

export function MainMenu({ onStartRun, onCredits, onRules, onSettings }: MainMenuProps) {
  return (
    <div
      id="mainMenu-screen"
      className="fixed inset-0 bg-gradient-to-br from-green-900 via-green-800 to-green-900 flex items-center justify-center z-50"
    >
      <div className="p-12 max-w-md w-full mx-4">
        <img src="images/logos/number9.png" alt="Logo" />
      </div>
      <div className="bg-white rounded-lg shadow-2xl p-12 max-w-md w-full mx-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Oubliette Number 9</h1>
        <div className="space-y-4">
          <button
            onClick={onStartRun}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg"
          >
            Start Run
          </button>
          <button
            onClick={onCredits}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg"
          >
            Credits
          </button>
          <button
            onClick={onRules}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg"
          >
            Rules
          </button>
          <button
            onClick={onSettings}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg"
          >
            Settings
          </button>
        </div>
        <p className="text-center text-gray-500 mt-8 text-sm">It's video poker. But not.</p>
      </div>
    </div>
  );
}
