import { GameButton } from './GameButton';

interface CheatsModalProps {
  onClose: () => void;
  onAddCredits: (amount: number) => void;
  onAddHands: (amount: number) => void;
  onSetDevilsDealCheat?: () => void;
}

export function CheatsModal({ onClose, onAddCredits, onAddHands, onSetDevilsDealCheat }: CheatsModalProps) {
  return (
    <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
      <div
        className="game-panel rounded-xl p-6 sm:p-8 max-w-md w-full border border-[var(--game-border)] relative"
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl font-bold hover:opacity-80"
          style={{ color: 'var(--game-text-muted)' }}
          aria-label="Close cheats"
        >
          ×
        </button>
        <h2 className="text-xl sm:text-2xl font-bold mb-6" style={{ color: 'var(--game-accent-gold)' }}>
          Cheats
        </h2>

        <div className="space-y-3 mb-6">
          <GameButton
            onClick={() => {
              onAddCredits(1000);
              onClose();
            }}
            variant="secondary"
            size="md"
            fullWidth
          >
            Add 1000 Credits
          </GameButton>
          <GameButton
            onClick={() => {
              onAddCredits(10000);
              onClose();
            }}
            variant="secondary"
            size="md"
            fullWidth
          >
            Add 10000 Credits
          </GameButton>
          <GameButton
            onClick={() => {
              onAddHands(10);
              onClose();
            }}
            variant="secondary"
            size="md"
            fullWidth
          >
            Add 10 Parallel Hands
          </GameButton>
          <GameButton
            onClick={() => {
              onAddHands(50);
              onClose();
            }}
            variant="secondary"
            size="md"
            fullWidth
          >
            Add 50 Parallel Hands
          </GameButton>
          {onSetDevilsDealCheat && (
            <GameButton
              onClick={() => {
                onSetDevilsDealCheat();
                onClose();
              }}
              variant="secondary"
              size="md"
              fullWidth
            >
              Devil's Deal: 100% Chance, 1% Cost
            </GameButton>
          )}
        </div>

        <GameButton onClick={onClose} variant="ghost" size="md" fullWidth>
          Close
        </GameButton>
      </div>
    </div>
  );
}
