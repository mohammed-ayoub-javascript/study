/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect, useState, useCallback, useRef, useMemo, SetStateAction } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'sonner';
import { API } from '@/lib/api';
import { getShortMessages, getFromLocalDB, saveToLocalDB } from '@/database/database';
import { useVideoPlayer } from '@/hooks/useVideoPlayer';
import { usePomodoro } from '@/hooks/usePomodoro';
import { useMotivationMessages } from '@/hooks/useMotivationMessages';
import { VideoData } from '@/types/types';
import { VideoControls } from '@/components/video/VideoControls';
import { MotivationOverlay } from '@/components/messages/MotivationOverlay';
import { BreakMessage } from '@/components/messages/BreakMessage';
import { VideoInfo } from '@/components/video/VideoInfo';
import { PomodoroTimer } from '@/components/pomodoro/PomodoroTimer';
import RotatePhone from '@/components/ui/RotatePhone';

const Watch = () => {
  const { id } = useParams();
  const router = useRouter();
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [shortMsgs, setMessages] = useState<string[]>([]);
  const [, setIsPortrait] = useState(false);
  const [forceLandscape, setForceLandscape] = useState(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedTimeRef = useRef<number>(0);
  const orientationCheckRef = useRef<NodeJS.Timeout | null>(null);
  const orientationListenerRef = useRef<(() => void) | null>(null);

  const {
    playerRef,
    playedSeconds,
    setPlayedSeconds,
    duration,
    setDuration,
    isPlaying,
    setIsPlaying,
    isMuted,
    controlsVisible,
    setControlsVisible,
    togglePlay,
    toggleMute,
    resetControlsTimeout,
    handleSeek,
    handleKeyDown,
    formatTime,
  } = useVideoPlayer();

  const {
    phase: pomodoroPhase,
    timeLeft: pomodoroTimeLeft,
    isPausedByPomodoro,
    showBreakMessage,
    setIsPausedByPomodoro,
    setShowBreakMessage,
    formatTime: formatPomodoroTime,
  } = usePomodoro();

  const { motivationMsg, achievementGlow, currentGlowColor } = useMotivationMessages(
    playedSeconds,
    shortMsgs,
    id as string,
    isPlaying
  );

  const checkOrientation = useCallback(() => {
    if (!mountedRef.current) return;

    const isPortraitMode = window.innerHeight > window.innerWidth;
    setIsPortrait(isPortraitMode);

    if (isPortraitMode && window.innerWidth < 768) {
      setForceLandscape(true);
    } else {
      setForceLandscape(false);
    }
  }, []);

  const attemptOrientationLock = useCallback(() => {
    if (typeof window === 'undefined' || !window.screen?.orientation?.lock) return;

    try {
      window.screen.orientation
        .lock('landscape')
        .then(() => {
          console.log('Screen orientation locked to landscape');
          setForceLandscape(false);
        })
        .catch((err: any) => {
          console.log('Orientation lock not supported:', err);
        });
    } catch (err) {
      console.log('Orientation lock error:', err);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    checkOrientation();

    const handleResize = () => {
      if (orientationCheckRef.current) {
        clearTimeout(orientationCheckRef.current);
      }
      orientationCheckRef.current = setTimeout(checkOrientation, 200);
    };

    orientationListenerRef.current = handleResize;

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      attemptOrientationLock();
    }

    getShortMessages().then((data) => {
      if (mountedRef.current) {
        setMessages(data as string[]);
      }
    });

    return () => {
      mountedRef.current = false;

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
      if (orientationCheckRef.current) {
        clearTimeout(orientationCheckRef.current);
        orientationCheckRef.current = null;
      }

      if (orientationListenerRef.current) {
        window.removeEventListener('resize', orientationListenerRef.current);
        window.removeEventListener('orientationchange', orientationListenerRef.current);
        orientationListenerRef.current = null;
      }

      if (typeof window !== 'undefined' && window.screen?.orientation?.unlock) {
        try {
          window.screen.orientation.unlock();
        } catch (err) {
          console.log('Orientation unlock error:', err);
        }
      }
    };
  }, []);

  useEffect(() => {
    if (!playerRef.current || !mountedRef.current) return;

    if (isPausedByPomodoro) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
      toast.warning('⚠️ وقت الراحة! تم إيقاف المقطع مؤقتاً.');
    } else if (pomodoroPhase === 'work' && mountedRef.current) {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  }, [isPausedByPomodoro, pomodoroPhase]);

  const fetchSession = useCallback(async () => {
    if (!id || !mountedRef.current) return;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}/api/sessions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });

      if (mountedRef.current) {
        setVideoData(res.data);
        const serverTime = res.data.watched_time || 0;

        const localProgress = await getFromLocalDB(id as string);
        const localTime = localProgress ? localProgress.watched_time : 0;

        const timeToSeek = localTime > serverTime ? localTime : serverTime;
        setPlayedSeconds(timeToSeek);

        if (playerRef.current && playerRef.current.seekTo) {
          playerRef.current.seekTo(timeToSeek, true);
        }

        if (localTime > serverTime && mountedRef.current) {
          toast.info('تم استئناف الدراسة من حيث توقفت (حفظ محلي)');
        }
      }
    } catch (err) {
      console.error('Error fetching session:', err);
    }
  }, [id]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const updateWatchedTimeOnServer = useCallback(
    async (currentTime: number, status: string = 'pending') => {
      try {
        await axios.put(
          `${API}/api/sessions/${id}`,
          { watched_time: currentTime, status },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            timeout: 5000,
          }
        );
      } catch (err) {
        console.error('Update failed', err);
      }
    },
    [id]
  );

  const saveProgress = useCallback(
    (currentTime: number) => {
      if (Math.abs(currentTime - lastSavedTimeRef.current) > 5) {
        saveToLocalDB(id as string, currentTime);
        lastSavedTimeRef.current = currentTime;
      }

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          updateWatchedTimeOnServer(currentTime);
        }
      }, 30000);
    },
    [id, updateWatchedTimeOnServer]
  );

  const updateProgress = useCallback(() => {
    const player = playerRef.current;
    if (!player || !mountedRef.current || typeof player.getPlayerState !== 'function') return;

    if (player.getPlayerState() === 1) {
      const currentTime = Math.floor(player.getCurrentTime());
      if (mountedRef.current) {
        setPlayedSeconds(currentTime);
      }
      saveProgress(currentTime);
    }
  }, [saveProgress]);

  useEffect(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    if (isPlaying && !isPausedByPomodoro && mountedRef.current) {
      progressIntervalRef.current = setInterval(updateProgress, 2000);
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [isPlaying, isPausedByPomodoro, updateProgress]);

  const onPlayerReady: YouTubeProps['onReady'] = useCallback(
    (event: {
      target: {
        getDuration: () => SetStateAction<number>;
        seekTo: (arg0: number, arg1: boolean) => void;
      };
    }) => {
      if (!mountedRef.current) return;

      playerRef.current = event.target;
      setDuration(event.target.getDuration());
      if (playedSeconds > 0) {
        event.target.seekTo(playedSeconds, true);
      }
      resetControlsTimeout();
    },
    [playedSeconds]
  );

  const onPlayerEnd: YouTubeProps['onEnd'] = useCallback(
    (event: { target: { getDuration: () => number } }) => {
      if (!mountedRef.current) return;

      const finalTime = Math.floor(event.target.getDuration());
      updateWatchedTimeOnServer(finalTime, 'completed');
      toast.success('🎉 مبروك! أنهيت المهمة بنجاح.');

      setTimeout(() => {
        if (mountedRef.current) {
          router.back();
        }
      }, 3000);
    },
    [updateWatchedTimeOnServer]
  );

  const getYouTubeId = useCallback((url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  }, []);

  const handleMouseMove = useCallback(() => {
    if (!mountedRef.current) return;
    setControlsVisible(true);
    resetControlsTimeout();
  }, [resetControlsTimeout]);

  useEffect(() => {
    const container = videoContainerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove, { passive: true });
    }

    const handleKeyDownWrapper = (e: KeyboardEvent) => handleKeyDown(e);
    window.addEventListener('keydown', handleKeyDownWrapper, { passive: true });

    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
      window.removeEventListener('keydown', handleKeyDownWrapper);
    };
  }, [handleMouseMove, handleKeyDown]);

  const youtubeId = useMemo(() => {
    return videoData ? getYouTubeId(videoData.VideoURL) : undefined;
  }, [videoData]);

  if (!videoData)
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center font-mono">
        LOADING SESSION...
      </div>
    );

  if (forceLandscape && window.innerWidth < 768) {
    return <RotatePhone />;
  }

  return (
    <div
      className="relative h-[100dvh] w-screen bg-black overflow-hidden flex items-center justify-center landscape:justify-start"
      ref={videoContainerRef}
    >
      <style jsx global>{`
        /* تصميم للشاشات الكبيرة والهواتف في الوضع الأفقي */
        iframe {
          width: 100vw !important;
          height: 100vh !important;
          object-fit: contain;
          position: absolute;
          top: 0;
          left: 0;
          background-color: black;
        }

        /* تحسين للهواتف في الوضع الأفقي */
        @media (max-width: 767px) and (orientation: landscape) {
          iframe {
            object-fit: cover !important;
            transform: scale(1.1); /* تكبير بسيط لملء الشاشة */
          }
        }

        /* للشاشات الكبيرة */
        @media (min-width: 768px) {
          iframe {
            object-fit: cover !important;
          }
        }

        body {
          overflow: hidden;
          margin: 0;
          padding: 0;
          user-select: none;
          background-color: black;
        }

        /* منع التداخل مع عناصر التحكم على الهواتف */
        @media (max-width: 767px) {
          .video-controls-container {
            padding-bottom: env(safe-area-inset-bottom, 20px);
          }
        }
      `}</style>

      <div className="absolute inset-0 w-full h-full z-20 pointer-events-none">
        <MotivationOverlay
          motivationMsg={motivationMsg}
          achievementGlow={achievementGlow}
          currentGlowColor={currentGlowColor}
        />
      </div>

      <div className="absolute pointer-events-none inset-0 z-0 bg-black w-full h-full flex items-center justify-center">
        <YouTube
          key={youtubeId}
          videoId={youtubeId as any}
          opts={{
            height: '100%',
            width: '100%',
            playerVars: {
              autoplay: 1,
              controls: 0,
              rel: 0,
              showinfo: 0,
              iv_load_policy: 3,
              modestbranding: 1,
              disablekb: 1,
              playsinline: 1,
            },
          }}
          className="w-full h-full"
          onReady={onPlayerReady}
          onEnd={onPlayerEnd}
          onError={(e) => console.error('YouTube player error:', e)}
        />
      </div>

      <div className="absolute top-4 left-4 z-30 scale-75 sm:scale-100 origin-top-left">
        <PomodoroTimer
          phase={pomodoroPhase}
          timeLeft={pomodoroTimeLeft}
          formatTime={formatPomodoroTime}
        />
      </div>

      <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-end">
        <div className="pointer-events-auto w-full video-controls-container">
          <VideoControls
            isPlaying={isPlaying}
            isMuted={isMuted}
            controlsVisible={controlsVisible}
            playedSeconds={playedSeconds}
            duration={duration}
            togglePlay={togglePlay}
            toggleMute={toggleMute}
            handleSeek={handleSeek}
            formatTime={formatTime}
            onRewind={() => playerRef.current?.seekTo(playerRef.current.getCurrentTime() - 5)}
            onFastForward={() => playerRef.current?.seekTo(playerRef.current.getCurrentTime() + 5)}
            onReset={() => playerRef.current?.seekTo(0)}
          />
        </div>
      </div>

      <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center">
        <BreakMessage showBreakMessage={showBreakMessage} />
      </div>

      <div className="absolute top-4 right-4 z-30 hidden md:block">
        <VideoInfo
          videoData={videoData}
          remainingTime={duration - playedSeconds}
          percentage={duration > 0 ? (playedSeconds / duration) * 100 : 0}
          playedSeconds={playedSeconds}
        />
      </div>
    </div>
  );
};

export default Watch;
