/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export const useVideoPlayer = () => {
  const playerRef = useRef<any>(null);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(true);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);

  const togglePlay = useCallback(() => {
    if (playerRef.current) {
      const state = playerRef.current.getPlayerState();
      if (state === 1) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
        setControlsVisible(true);
      } else {
        playerRef.current.playVideo();
        setIsPlaying(true);
        setControlsVisible(true);
      }
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (playerRef.current) {
      if (playerRef.current.isMuted()) {
        playerRef.current.unMute();
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
      setControlsVisible(true);
    }
  }, []);

  const resetControlsTimeout = useCallback(
    (keepVisible = false) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (!keepVisible && isPlaying && isMounted.current) {
        timeoutRef.current = setTimeout(() => {
          if (isMounted.current) {
            setControlsVisible(false);
          }
        }, 2000);
      }
    },
    [isPlaying]
  );

  const handleSeek = useCallback((value: number[]) => {
    const newTime = value[0];
    setPlayedSeconds(newTime);
    playerRef.current?.seekTo(newTime, true);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!playerRef.current) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          const currentTimeRight = playerRef.current.getCurrentTime();
          playerRef.current.seekTo(currentTimeRight + 5, true);
          toast.info('تقديم 5 ثوانٍ', { duration: 1000 });
          break;
        case 'ArrowLeft':
          const currentTimeLeft = playerRef.current.getCurrentTime();
          playerRef.current.seekTo(currentTimeLeft - 5, true);
          toast.info('تأخير 5 ثوانٍ', { duration: 1000 });
          break;
      }
      setControlsVisible(true);
      resetControlsTimeout();
    },
    [togglePlay, resetControlsTimeout]
  );

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const handleKeyDownWrapper = (e: KeyboardEvent) => handleKeyDown(e);

    window.addEventListener('keydown', handleKeyDownWrapper);

    return () => {
      window.removeEventListener('keydown', handleKeyDownWrapper);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (playerRef.current) {
        try {
          playerRef.current.stopVideo();
          playerRef.current.destroy();
        } catch (error) {
          console.warn('Error cleaning up video player:', error);
        }
      }
    };
  }, []);

  return {
    playerRef,
    playedSeconds,
    setPlayedSeconds,
    duration,
    setDuration,
    isPlaying,
    setIsPlaying,
    isMuted,
    setIsMuted,
    controlsVisible,
    setControlsVisible,
    togglePlay,
    toggleMute,
    resetControlsTimeout,
    handleSeek,
    handleKeyDown,
    formatTime,
  };
};
