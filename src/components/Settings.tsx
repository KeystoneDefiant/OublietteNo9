interface SettingsProps {
  onClose: () => void;
  /** Current audio settings (for volume sliders) */
  audioSettings?: { musicVolume: number; soundEffectsVolume: number };
  /** Called when music volume slider changes (0–1) */
  onMusicVolumeChange?: (value: number) => void;
  /** Called when sound effects volume slider changes (0–1) */
  onSoundEffectsVolumeChange?: (value: number) => void;
}

export function Settings({
  onClose,
  audioSettings,
  onMusicVolumeChange,
  onSoundEffectsVolumeChange,
}: SettingsProps) {
  const musicVolume = audioSettings?.musicVolume ?? 0.7;
  const soundEffectsVolume = audioSettings?.soundEffectsVolume ?? 1.0;

  const hasAudioControls =
    onMusicVolumeChange != null || onSoundEffectsVolumeChange != null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            aria-label="Close settings"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {hasAudioControls && (
            <div className="border-2 border-gray-200 rounded-lg p-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Audio</h3>
              <div className="space-y-4">
                {onMusicVolumeChange != null && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Music volume
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={musicVolume}
                      onChange={(e) =>
                        onMusicVolumeChange(parseFloat(e.target.value))
                      }
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 accent-blue-600"
                      aria-label="Music volume"
                    />
                    <span className="text-sm text-gray-600 ml-2">
                      {Math.round(musicVolume * 100)}%
                    </span>
                  </div>
                )}
                {onSoundEffectsVolumeChange != null && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sound effects volume
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={soundEffectsVolume}
                      onChange={(e) =>
                        onSoundEffectsVolumeChange?.(
                          parseFloat(e.target.value)
                        )
                      }
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200 accent-blue-600"
                      aria-label="Sound effects volume"
                    />
                    <span className="text-sm text-gray-600 ml-2">
                      {Math.round(soundEffectsVolume * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {!hasAudioControls && (
            <p className="text-gray-600">No settings available.</p>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
