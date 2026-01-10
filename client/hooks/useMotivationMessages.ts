/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef, useCallback } from 'react';
import { messagesBoost } from '@/app/session/watch/[id]/messages';

export const useMotivationMessages = (playedSeconds: number, shortMsgs: string[], sessionId: string, isPlaying: boolean) => {
  const [motivationMsg, setMotivationMsg] = useState('');
  const [achievementGlow, setAchievementGlow] = useState(false);
  const [currentGlowColor, setCurrentGlowColor] = useState<string | null>(null);
  
  const lastProcessedTime = useRef<number>(-1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastShortMsgsRef = useRef<string[]>([]);
  const playedSecondsRef = useRef(playedSeconds);

  useEffect(() => {
    playedSecondsRef.current = playedSeconds;
  }, [playedSeconds]);

  useEffect(() => {
    lastShortMsgsRef.current = shortMsgs;
  }, [shortMsgs]);

  const processMessage = useCallback(() => {
    const currentTime = Math.floor(playedSecondsRef.current);

    if (currentTime === lastProcessedTime.current || !isPlaying) return;
    lastProcessedTime.current = currentTime;

    const boostMsg = messagesBoost.find((msg) => msg.time === currentTime);
    const isMinuteMark = currentTime > 0 && currentTime % 60 === 0;

    if (boostMsg || isMinuteMark) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      if (boostMsg) {
        setMotivationMsg(boostMsg.content);
        setCurrentGlowColor(boostMsg.color);
        setAchievementGlow(true);
      } else if (lastShortMsgsRef.current.length > 0) {
        const randomMsg = lastShortMsgsRef.current[
          Math.floor(Math.random() * lastShortMsgsRef.current.length)
        ];
        setMotivationMsg(randomMsg);
        setAchievementGlow(false);
      }

      timerRef.current = setTimeout(() => {
        setMotivationMsg('');
        setAchievementGlow(false);
        setCurrentGlowColor(null);
      }, 4000);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      processMessage();
    }, 1000);

    return () => {
      clearInterval(interval);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPlaying, processMessage]);

  return { motivationMsg, achievementGlow, currentGlowColor };
};