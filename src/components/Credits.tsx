import { GameButton } from './GameButton';

interface CreditsProps {
  onClose: () => void;
}

export function Credits({ onClose }: CreditsProps) {
  return (
    <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
      <div
        className="game-panel rounded-xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[var(--game-border)]"
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--game-accent-gold)' }}>
            Oubliette No. 9
          </h2>
          <button
            onClick={onClose}
            className="text-2xl font-bold hover:opacity-80"
            style={{ color: 'var(--game-text-muted)' }}
            aria-label="Close credits"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-2" style={{ color: 'var(--game-accent-gold)' }}>
              Game Design & Development
            </h3>
            <p style={{ color: 'var(--game-text-muted)' }}>Chris Flohr</p>
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-2" style={{ color: 'var(--game-accent-gold)' }}>
              Special Thanks
            </h3>
            <ul className="list-disc list-inside space-y-1" style={{ color: 'var(--game-text-muted)' }}>
              <li>You, for taking a peek at this nonsense.</li>
              <li>Kristen, for actually enjoying this mess of a game.</li>
              <li>Kelsey, for the Devil's Deal idea. Blame her.</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-center">
          <GameButton onClick={onClose} variant="primary" size="md">
            Close
          </GameButton>
        </div>
      </div>
    </div>
  );
}
