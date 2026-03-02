import { useState } from 'react';
import { GameButton } from './GameButton';

type AnimationSpeedMode = number | 'skip';

interface SettingsProps {
  onClose: () => void;
  audioSettings?: {
    musicEnabled: boolean;
    soundEffectsEnabled: boolean;
    musicVolume: number;
    soundEffectsVolume: number;
    handScoringMinVolumePercent: number;
  };
  onMusicVolumeChange?: (value: number) => void;
  onSoundEffectsVolumeChange?: (value: number) => void;
  onHandScoringMinVolumeChange?: (value: number) => void;
  onToggleMusic?: () => void;
  onToggleSoundEffects?: () => void;
  animationSpeedMode?: AnimationSpeedMode;
  onAnimationSpeedChange?: (speed: number | 'skip') => void;
  cardTheme?: 'light' | 'dark';
  onCardThemeChange?: (theme: 'light' | 'dark') => void;
  onCheatAddCredits?: (amount: number) => void;
  onCheatAddHands?: (amount: number) => void;
  onCheatSetDevilsDeal?: () => void;
}

const ANIMATION_SPEED_MIN = 0.5;
const ANIMATION_SPEED_MAX = 7;
const ANIMATION_SPEED_STEP = 0.5;

export function Settings({
  onClose,
  audioSettings,
  onMusicVolumeChange,
  onSoundEffectsVolumeChange,
  onHandScoringMinVolumeChange,
  onToggleMusic,
  onToggleSoundEffects,
  animationSpeedMode = 1,
  onAnimationSpeedChange,
  cardTheme = 'dark',
  onCardThemeChange,
  onCheatAddCredits,
  onCheatAddHands,
  onCheatSetDevilsDeal,
}: SettingsProps) {
  const [cheatsExpanded, setCheatsExpanded] = useState(false);
  const musicVolume = audioSettings?.musicVolume ?? 0.7;
  const soundEffectsVolume = audioSettings?.soundEffectsVolume ?? 1.0;
  const handScoringMinVolumePercent = audioSettings?.handScoringMinVolumePercent ?? 0;
  const musicEnabled = audioSettings?.musicEnabled ?? true;
  const soundEffectsEnabled = audioSettings?.soundEffectsEnabled ?? true;

  const speedValue =
    animationSpeedMode === 'skip'
      ? ANIMATION_SPEED_MAX
      : Math.min(ANIMATION_SPEED_MAX, Math.max(ANIMATION_SPEED_MIN, animationSpeedMode));

  return (
    <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50 p-4">
      <div
        className="game-panel rounded-xl p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto border border-[var(--game-border)]"
        style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--game-accent-gold)' }}>
            Settings
          </h2>
          <button
            onClick={onClose}
            className="text-2xl font-bold hover:opacity-80"
            style={{ color: 'var(--game-text-muted)' }}
            aria-label="Close settings"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Audio */}
          {(onMusicVolumeChange != null || onSoundEffectsVolumeChange != null || onHandScoringMinVolumeChange != null || onToggleMusic != null || onToggleSoundEffects != null) && (
            <div
              className="rounded-xl p-4 sm:p-6 border border-[var(--game-border)]"
              style={{ background: 'var(--game-bg-panel)' }}
            >
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--game-accent-gold)' }}>
                Audio
              </h3>
              <div className="space-y-4">
                {onMusicVolumeChange != null && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-sm font-medium" style={{ color: 'var(--game-text)' }}>
                        Music
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={onToggleMusic}
                          className="text-sm font-semibold px-2 py-0.5 rounded"
                          style={{
                            background: musicEnabled ? 'var(--game-accent-red)' : 'var(--game-border)',
                            color: 'var(--game-text)',
                          }}
                        >
                          {musicEnabled ? 'On' : 'Mute'}
                        </button>
                        <span className="text-sm" style={{ color: 'var(--game-text-muted)' }}>
                          {Math.round(musicVolume * 100)}%
                        </span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={musicVolume}
                      onChange={(e) => onMusicVolumeChange(parseFloat(e.target.value))}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: 'var(--game-border)',
                        accentColor: 'var(--game-accent-gold)',
                      }}
                      aria-label="Music volume"
                    />
                  </div>
                )}
                {onSoundEffectsVolumeChange != null && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-sm font-medium" style={{ color: 'var(--game-text)' }}>
                        Sound Effects
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={onToggleSoundEffects}
                          className="text-sm font-semibold px-2 py-0.5 rounded"
                          style={{
                            background: soundEffectsEnabled ? 'var(--game-accent-red)' : 'var(--game-border)',
                            color: 'var(--game-text)',
                          }}
                        >
                          {soundEffectsEnabled ? 'On' : 'Mute'}
                        </button>
                        <span className="text-sm" style={{ color: 'var(--game-text-muted)' }}>
                          {Math.round(soundEffectsVolume * 100)}%
                        </span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={soundEffectsVolume}
                      onChange={(e) => onSoundEffectsVolumeChange?.(parseFloat(e.target.value))}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: 'var(--game-border)',
                        accentColor: 'var(--game-accent-gold)',
                      }}
                      aria-label="Sound effects volume"
                    />
                  </div>
                )}
                {onHandScoringMinVolumeChange != null && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-sm font-medium" style={{ color: 'var(--game-text)' }}>
                        Min volume (repeated hands)
                      </label>
                      <span className="text-sm" style={{ color: 'var(--game-text-muted)' }}>
                        {handScoringMinVolumePercent}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={1}
                      value={handScoringMinVolumePercent}
                      onChange={(e) => onHandScoringMinVolumeChange(parseInt(e.target.value, 10))}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: 'var(--game-border)',
                        accentColor: 'var(--game-accent-gold)',
                      }}
                      aria-label="Minimum volume when scoring multiple hands in a row"
                    />
                    <p className="text-xs mt-1" style={{ color: 'var(--game-text-muted)' }}>
                      Floor when scoring many same-rank hands. 0 = can go silent.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Animation Speed */}
          {onAnimationSpeedChange != null && (
            <div
              className="rounded-xl p-4 sm:p-6 border border-[var(--game-border)]"
              style={{ background: 'var(--game-bg-panel)' }}
            >
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--game-accent-gold)' }}>
                Animation Speed
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center gap-2">
                  <label className="text-sm font-medium" style={{ color: 'var(--game-text)' }}>
                    Speed
                  </label>
                  <span className="text-sm font-bold" style={{ color: 'var(--game-accent-gold)' }}>
                    {animationSpeedMode === 'skip' ? 'Skip' : `${speedValue}×`}
                  </span>
                </div>
                <input
                  type="range"
                  min={ANIMATION_SPEED_MIN}
                  max={ANIMATION_SPEED_MAX}
                  step={ANIMATION_SPEED_STEP}
                  value={speedValue}
                  onChange={(e) => onAnimationSpeedChange(parseFloat(e.target.value))}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: 'var(--game-border)',
                    accentColor: 'var(--game-accent-gold)',
                  }}
                  aria-label="Animation speed"
                />
                <div className="flex justify-between text-xs" style={{ color: 'var(--game-text-muted)' }}>
                  <span>0.5×</span>
                  <span>7×</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={animationSpeedMode === 'skip'}
                    onChange={(e) => onAnimationSpeedChange(e.target.checked ? 'skip' : 1)}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: 'var(--game-accent-gold)' }}
                  />
                  <span className="text-sm font-medium" style={{ color: 'var(--game-text)' }}>
                    Skip animations
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Card Theme */}
          {onCardThemeChange != null && (
            <div
              className="rounded-xl p-4 sm:p-6 border border-[var(--game-border)]"
              style={{ background: 'var(--game-bg-panel)' }}
            >
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--game-accent-gold)' }}>
                Card Style
              </h3>
              <div className="space-y-3">
                {[
                  { id: 'light' as const, label: 'Light', desc: 'White cards, traditional red and black' },
                  { id: 'dark' as const, label: 'Dark', desc: 'Dark cards with red and light suit text' },
                ].map(({ id, label, desc }) => (
                  <label
                    key={id}
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors border-2 ${
                      cardTheme === id ? 'border-[var(--game-accent-gold)]' : 'border-transparent'
                    }`}
                    style={{
                      background: cardTheme === id ? 'rgba(201, 162, 39, 0.1)' : 'transparent',
                    }}
                  >
                    <input
                      type="radio"
                      name="cardTheme"
                      value={id}
                      checked={cardTheme === id}
                      onChange={() => onCardThemeChange(id)}
                      className="mt-1 w-4 h-4"
                      style={{ accentColor: 'var(--game-accent-gold)' }}
                      aria-label={`Card style: ${label}`}
                    />
                    <div>
                      <span className="font-semibold" style={{ color: 'var(--game-text)' }}>
                        {label}
                      </span>
                      <p className="text-sm mt-0.5" style={{ color: 'var(--game-text-muted)' }}>
                        {desc}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Cheats (accordion) */}
          {(onCheatAddCredits != null || onCheatAddHands != null || onCheatSetDevilsDeal != null) && (
            <div
              className="rounded-xl border border-[var(--game-border)] overflow-hidden"
              style={{ background: 'var(--game-bg-panel)' }}
            >
              <button
                type="button"
                onClick={() => setCheatsExpanded((prev) => !prev)}
                className="w-full p-4 sm:p-6 flex justify-between items-center text-left hover:opacity-90 transition-opacity"
                aria-expanded={cheatsExpanded}
              >
                <h3 className="text-lg font-bold" style={{ color: 'var(--game-accent-gold)' }}>
                  Cheats
                </h3>
                <span className="text-xl" style={{ color: 'var(--game-text-muted)' }}>
                  {cheatsExpanded ? '▼' : '▶'}
                </span>
              </button>
              {cheatsExpanded && (
                <div className="px-4 pt-0 pb-4 sm:px-6 sm:pb-6 space-y-2">
                  {onCheatAddCredits != null && (
                    <>
                      <GameButton
                        onClick={() => onCheatAddCredits(1000)}
                        variant="secondary"
                        size="sm"
                        fullWidth
                      >
                        Add 1000 Credits
                      </GameButton>
                      <GameButton
                        onClick={() => onCheatAddCredits(10000)}
                        variant="secondary"
                        size="sm"
                        fullWidth
                      >
                        Add 10000 Credits
                      </GameButton>
                      <GameButton
                        onClick={() => onCheatAddCredits(100_000)}
                        variant="secondary"
                        size="sm"
                        fullWidth
                      >
                        Add 100,000 Credits
                      </GameButton>
                    </>
                  )}
                  {onCheatAddHands != null && (
                    <>
                      <GameButton
                        onClick={() => onCheatAddHands(10)}
                        variant="secondary"
                        size="sm"
                        fullWidth
                      >
                        Add 10 Parallel Hands
                      </GameButton>
                      <GameButton
                        onClick={() => onCheatAddHands(50)}
                        variant="secondary"
                        size="sm"
                        fullWidth
                      >
                        Add 50 Parallel Hands
                      </GameButton>
                      <GameButton
                        onClick={() => onCheatAddHands(250)}
                        variant="secondary"
                        size="sm"
                        fullWidth
                      >
                        Add 250 Parallel Hands
                      </GameButton>
                    </>
                  )}
                  {onCheatSetDevilsDeal != null && (
                    <GameButton
                      onClick={onCheatSetDevilsDeal}
                      variant="secondary"
                      size="sm"
                      fullWidth
                    >
                      Devil's Deal: 100% Chance, 1% Cost
                    </GameButton>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <GameButton onClick={onClose} variant="primary" size="md">
            Close
          </GameButton>
        </div>
      </div>
    </div>
  );
}
