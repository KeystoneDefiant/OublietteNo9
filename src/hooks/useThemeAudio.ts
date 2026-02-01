import { useEffect, useRef, useCallback } from 'react';
import { HandRank, ThemeConfig } from '../types';
import { getSelectedTheme, loadThemeConfig } from '../utils/themeManager';
import { gameConfig } from '../config/gameConfig';

type SoundEvent =
  | 'buttonClick'
  | 'shopPurchase'
  | 'screenTransition'
  | 'returnToPreDraw'
  | 'handScoring';

interface AudioInstances {
  soundEffects: Map<string, HTMLAudioElement>;
  backgroundMusic: HTMLAudioElement | null;
}

// Global audio cache shared across all hook instances
// This ensures sounds are downloaded once and reused forever
const globalAudioCache: AudioInstances = {
  soundEffects: new Map(),
  backgroundMusic: null,
};

// Global theme config cache
let globalThemeConfig: ThemeConfig | null = null;

/**
 * Hook for managing theme-based audio playback
 * Handles graceful fallback when audio files are missing
 * Supports audio settings to enable/disable music and sound effects
 * Uses a global cache to prevent re-downloading audio files
 */
export function useThemeAudio(audioSettings?: { musicEnabled: boolean; soundEffectsEnabled: boolean }) {
  const volumeRef = useRef(1.0);
  const audioSettingsRef = useRef(audioSettings || { musicEnabled: true, soundEffectsEnabled: true });

  // Update settings ref when prop changes
  useEffect(() => {
    if (audioSettings) {
      audioSettingsRef.current = audioSettings;
    }
  }, [audioSettings]);

  // Load theme config once globally and cache it
  useEffect(() => {
    const loadThemeAudio = async () => {
      if (!globalThemeConfig) {
        const theme = getSelectedTheme();
        const config = await loadThemeConfig(theme);
        globalThemeConfig = config;
      }
    };

    loadThemeAudio();
  }, []);

  /**
   * Play a sound effect based on event type
   * Gracefully falls back to silence if file is missing or invalid
   * Checks soundEffectsEnabled setting before playing
   * Uses global cache to prevent re-downloading
   */
  const playSound = useCallback((event: SoundEvent, handRank?: HandRank) => {
    // Check if sound effects are enabled
    if (!audioSettingsRef.current.soundEffectsEnabled) return;
    
    try {
      const config = globalThemeConfig;
      if (!config?.sounds) return;

      let audioPath: string | undefined;

      if (event === 'buttonClick') {
        audioPath = config.sounds.buttonClick;
      } else if (event === 'shopPurchase') {
        audioPath = config.sounds.shopPurchase;
      } else if (event === 'screenTransition') {
        audioPath = config.sounds.screenTransition;
      } else if (event === 'returnToPreDraw') {
        audioPath = config.sounds.returnToPreDraw;
      } else if (handRank && config.sounds.handScoring) {
        audioPath = config.sounds.handScoring[handRank];
      }

      if (!audioPath) return; // No audio configured for this event

      // Build full path relative to theme sounds directory
      const theme = getSelectedTheme();
      const fullPath = `./sounds/${theme}/${audioPath}`;

      // Reuse existing audio instance from GLOBAL cache or create new one
      const audioKey = `${event}-${handRank || ''}`;
      let audio = globalAudioCache.soundEffects.get(audioKey);

      if (!audio) {
        // Create new audio instance and set src only once
        audio = new Audio(fullPath); // Set src in constructor
        audio.volume = volumeRef.current;
        globalAudioCache.soundEffects.set(audioKey, audio);
      }

      // Reset playback to start (don't reset src!)
      audio.currentTime = 0;

      // Play with error handling
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Gracefully handle missing audio file
          // This is expected behavior - just log and continue
        });
      }
    } catch {
      // Graceful silence fallback for any audio errors
    }
  }, []);

  /**
   * Play background music (loops indefinitely)
   * Checks musicEnabled setting before playing
   * Uses global cache to prevent re-downloading
   */
  const playMusic = useCallback(() => {
    // Check if music is enabled
    if (!audioSettingsRef.current.musicEnabled) return;
    
    try {
      const config = globalThemeConfig;
      if (!config?.music?.backgroundMusic) return;

      const theme = getSelectedTheme();
      const musicPath = `./sounds/${theme}/${config.music.backgroundMusic}`;

      // Reuse existing music instance from GLOBAL cache if available
      let audio = globalAudioCache.backgroundMusic;
      
      // Check if we need to create a new instance (doesn't exist or src changed)
      // Note: audio.src will be an absolute URL, so we check if it ends with our path
      if (!audio || !audio.src.endsWith(musicPath)) {
        // Create new audio instance only if needed (src changed or doesn't exist)
        audio = new Audio(musicPath); // Set src in constructor
        audio.loop = true;
        audio.volume = volumeRef.current * gameConfig.audio.musicVolume;
        globalAudioCache.backgroundMusic = audio;
      }

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Gracefully handle missing music file
        });
      }
    } catch {
      // Graceful silence fallback
    }
  }, []);

  /**
   * Stop background music
   * Uses global cache
   */
  const stopMusic = useCallback(() => {
    const audio = globalAudioCache.backgroundMusic;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  /**
   * Set volume for all audio (0.0 to 1.0)
   * Uses global cache
   */
  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    volumeRef.current = clampedVolume;

    // Update all sound effect volumes in global cache
    globalAudioCache.soundEffects.forEach((audio) => {
      audio.volume = clampedVolume;
    });

    // Update background music volume in global cache
    if (globalAudioCache.backgroundMusic) {
      globalAudioCache.backgroundMusic.volume = clampedVolume * 0.7;
    }
  }, []);

  /**
   * Stop all audio (sound effects and music)
   * Uses global cache
   */
  const stopAll = useCallback(() => {
    globalAudioCache.soundEffects.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });

    stopMusic();
  }, [stopMusic]);

  return {
    playSound,
    playMusic,
    stopMusic,
    setVolume,
    stopAll,
  };
}
