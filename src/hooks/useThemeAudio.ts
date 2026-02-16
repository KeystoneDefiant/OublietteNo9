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

// For multiple music tracks: last played index to avoid back-to-back
let lastPlayedMusicIndex: number = -1;

// Same-hand volume ducking: count of handScoring plays per rank this round (reset each round)
const handRankPlaysThisRound: Record<string, number> = {};

/**
 * Hook for managing theme-based audio playback
 * Handles graceful fallback when audio files are missing
 * Supports audio settings to enable/disable music and sound effects
 * Uses a global cache to prevent re-downloading audio files
 */
export interface ThemeAudioSettings {
  musicEnabled: boolean;
  soundEffectsEnabled: boolean;
  musicVolume?: number;
  soundEffectsVolume?: number;
}

const defaultAudioSettings: ThemeAudioSettings = {
  musicEnabled: true,
  soundEffectsEnabled: true,
  musicVolume: 0.7,
  soundEffectsVolume: 1.0,
};

export function useThemeAudio(audioSettings?: ThemeAudioSettings) {
  const audioSettingsRef = useRef(audioSettings || defaultAudioSettings);

  // Update settings ref and live volume when prop changes
  useEffect(() => {
    if (audioSettings) {
      audioSettingsRef.current = audioSettings;
      const musicVol = audioSettings.musicVolume ?? 0.7;
      const sfxVol = audioSettings.soundEffectsVolume ?? 1.0;
      if (globalAudioCache.backgroundMusic) {
        globalAudioCache.backgroundMusic.volume = musicVol;
      }
      globalAudioCache.soundEffects.forEach((audio) => {
        audio.volume = sfxVol;
      });
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

      const baseVolume = audioSettingsRef.current.soundEffectsVolume ?? 1.0;
      let volume = baseVolume;

      // Same-hand volume ducking: after 5 plays of same rank this round, reduce by 25% each additional time
      if (event === 'handScoring' && handRank) {
        handRankPlaysThisRound[handRank] = (handRankPlaysThisRound[handRank] || 0) + 1;
        const count = handRankPlaysThisRound[handRank];
        if (count > 5) {
          volume = baseVolume * Math.pow(0.75, count - 5);
        }
      }

      if (!audio) {
        audio = new Audio(fullPath);
        audio.volume = volume;
        globalAudioCache.soundEffects.set(audioKey, audio);
      } else {
        audio.volume = volume;
      }

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
   * Play background music. Single track loops; multiple tracks play in random order (no back-to-back).
   * Checks musicEnabled setting before playing.
   */
  const playMusic = useCallback(() => {
    if (!audioSettingsRef.current.musicEnabled) return;

    try {
      const config = globalThemeConfig;
      const raw = config?.music?.backgroundMusic;
      if (!raw) return;

      const theme = getSelectedTheme();
      const tracks = Array.isArray(raw) ? raw : [raw];
      if (tracks.length === 0) return;

      const basePath = `./sounds/${theme}/`;
      const volume = audioSettingsRef.current.musicVolume ?? gameConfig.audio.musicVolume;

      const pickNextIndex = (): number => {
        if (tracks.length === 1) return 0;
        let idx = Math.floor(Math.random() * tracks.length);
        if (idx === lastPlayedMusicIndex && tracks.length > 1) {
          idx = (idx + 1) % tracks.length;
        }
        return idx;
      };

      const playTrack = (index: number) => {
        const file = tracks[index];
        lastPlayedMusicIndex = index;
        const musicPath = basePath + file;
        let audio = globalAudioCache.backgroundMusic;

        if (!audio) {
          audio = new Audio(musicPath);
          audio.volume = volume;
          globalAudioCache.backgroundMusic = audio;
        } else {
          audio.src = musicPath;
          audio.volume = volume;
        }

        audio.loop = tracks.length === 1;
        if (tracks.length > 1) {
          const onEnded = () => {
            audio!.removeEventListener('ended', onEnded);
            const nextIdx = pickNextIndex();
            playTrack(nextIdx);
          };
          audio.addEventListener('ended', onEnded);
        }

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {});
        }
      };

      playTrack(pickNextIndex());
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

  /**
   * Reset per-round hand scoring counts (call when starting a new round for volume ducking).
   */
  const resetRoundSoundCounts = useCallback(() => {
    Object.keys(handRankPlaysThisRound).forEach((k) => delete handRankPlaysThisRound[k]);
  }, []);

  return {
    playSound,
    playMusic,
    stopMusic,
    stopAll,
    resetRoundSoundCounts,
  };
}
