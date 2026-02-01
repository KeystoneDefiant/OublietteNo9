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

/**
 * Hook for managing theme-based audio playback
 * Handles graceful fallback when audio files are missing
 */
export function useThemeAudio() {
  const audioInstancesRef = useRef<AudioInstances>({
    soundEffects: new Map(),
    backgroundMusic: null,
  });
  const themeConfigRef = useRef<ThemeConfig | null>(null);
  const volumeRef = useRef(1.0);

  // Load theme config and initialize audio
  useEffect(() => {
    const loadThemeAudio = async () => {
      const theme = getSelectedTheme();
      const config = await loadThemeConfig(theme);
      themeConfigRef.current = config;
    };

    loadThemeAudio();
  }, []);

  /**
   * Play a sound effect based on event type
   * Gracefully falls back to silence if file is missing or invalid
   */
  const playSound = useCallback((event: SoundEvent, handRank?: HandRank) => {
    try {
      const config = themeConfigRef.current;
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

      // Reuse existing audio instance or create new one
      const audioKey = `${event}-${handRank || ''}`;
      let audio = audioInstancesRef.current.soundEffects.get(audioKey);

      if (!audio) {
        audio = new Audio();
        audioInstancesRef.current.soundEffects.set(audioKey, audio);
      }

      // Build full path relative to theme sounds directory
      const theme = getSelectedTheme();
      const fullPath = `/sounds/${theme}/${audioPath}`;

      audio.src = fullPath;
      audio.volume = volumeRef.current;

      // Reset playback to start
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
   */
  const playMusic = useCallback(() => {
    try {
      const config = themeConfigRef.current;
      if (!config?.music?.backgroundMusic) return;

      const audio = new Audio();
      audio.src = `/sounds/${getSelectedTheme()}/${config.music.backgroundMusic}`;
      audio.loop = true;
      audio.volume = volumeRef.current * gameConfig.audio.musicVolume;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Gracefully handle missing music file
        });
      }

      audioInstancesRef.current.backgroundMusic = audio;
    } catch {
      // Graceful silence fallback
    }
  }, []);

  /**
   * Stop background music
   */
  const stopMusic = useCallback(() => {
    const audio = audioInstancesRef.current.backgroundMusic;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, []);

  /**
   * Set volume for all audio (0.0 to 1.0)
   */
  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    volumeRef.current = clampedVolume;

    // Update all sound effect volumes
    audioInstancesRef.current.soundEffects.forEach((audio) => {
      audio.volume = clampedVolume;
    });

    // Update background music volume
    if (audioInstancesRef.current.backgroundMusic) {
      audioInstancesRef.current.backgroundMusic.volume = clampedVolume * 0.7;
    }
  }, []);

  /**
   * Stop all audio (sound effects and music)
   */
  const stopAll = useCallback(() => {
    audioInstancesRef.current.soundEffects.forEach((audio) => {
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
