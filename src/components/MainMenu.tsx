import { GameButton } from './GameButton';

interface MainMenuProps {
  onStartRun: () => void;
  onTutorial: () => void;
  onCredits: () => void;
  onSettings: () => void;
}

export function MainMenu({ onStartRun, onTutorial, onCredits, onSettings }: MainMenuProps) {
  return (
    <div
      id="mainMenu-screen"
      className="fixed inset-0 flex flex-col items-center justify-center z-50 min-h-[100dvh] p-4 sm:p-6 md:p-8"
      style={{
        background: 'linear-gradient(180deg, #050508 0%, #0d0a0c 40%, #120e10 100%)',
      }}
    >
      {/* Logo - top */}
      <div className="flex-shrink-0 mb-6 sm:mb-8 md:mb-10">
        <img
          src="images/logos/number9.png"
          alt="Oubliette Number 9"
          className="w-32 h-auto sm:w-40 md:w-48 max-w-[90vw]"
        />
      </div>

      {/* Main card - fills space on mobile, max width on desktop */}
      <div
        className="w-full max-w-md flex-1 flex flex-col justify-center rounded-2xl p-6 sm:p-8 md:p-10 border border-[var(--game-border)]"
        style={{
          background: 'linear-gradient(180deg, rgba(18, 14, 16, 0.95) 0%, rgba(13, 10, 12, 0.98) 100%)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(201, 162, 39, 0.1)',
        }}
      >
        <h1
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-8"
          style={{ color: 'var(--game-accent-gold)' }}
        >
          Oubliette Number 9
        </h1>

        <div className="space-y-3 sm:space-y-4">
          <GameButton onClick={onStartRun} variant="primary" size="lg" fullWidth>
            Start Run
          </GameButton>
          <GameButton onClick={onTutorial} variant="ghost" size="lg" fullWidth>
            How to Play
          </GameButton>
          <GameButton onClick={onCredits} variant="ghost" size="md" fullWidth>
            Credits
          </GameButton>
          <GameButton onClick={onSettings} variant="ghost" size="md" fullWidth>
            Settings
          </GameButton>
        </div>

        <p
          className="text-center mt-6 sm:mt-8 text-sm"
          style={{ color: 'var(--game-text-muted)' }}
        >
          It's video poker. But not.
        </p>
      </div>
    </div>
  );
}
