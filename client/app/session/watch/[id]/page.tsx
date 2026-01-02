/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useRef } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Progress } from '@/components/ui/progress';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { API } from '@/lib/api';

const getShortMessages = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PomodoroDB', 1);

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction('settings', 'readonly');
      const store = transaction.objectStore('settings');
      const getRequest = store.get('shortMsgs');

      getRequest.onsuccess = () => {
        const msgs = getRequest.result?.value || [];
        resolve(msgs);
      };

      getRequest.onerror = () => reject('فشل جلب البيانات');
    };

    request.onerror = () => reject('فشل فتح قاعدة البيانات');
  });
};

const Watch = () => {
  const { id } = useParams();
  const [videoData, setVideoData] = useState<any>(null);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [motivationMsg, setMotivationMsg] = useState('');
  const playerRef = useRef<any>(null);

  const [pomodoroPhase, setPomodoroPhase] = useState<'work' | 'break'>('work');
  const [pomodoroTimeLeft, setPomodoroTimeLeft] = useState(25 * 60);
  const [isPausedByPomodoro, setIsPausedByPomodoro] = useState(false);
  const [showBreakMessage, setShowBreakMessage] = useState(false);
  const [shortMsgs, setMessages] = useState<string[]>([]);
  const [showMouseWarning, setShowMouseWarning] = useState(false);
  const [mouseWarningTimeout, setMouseWarningTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    getShortMessages().then((data) => {
      setMessages(data as string[]);
    });
  }, []);

  const milestoneMsgs = [
    'أنت تمشي خطوة بخطوة… وهذا كافي 🤍',
    'خذ نفسًا، ما تفعله الآن مهم 🌿',
    'هدوءك وتركيزك يصنعان الفرق ',
    'لا تستعجل النتائج… استمر فقط 🤍',
    'كل مجهود صادق له أثر، حتى لو لم تشعر 🌙',
    'أحسنت! هذا هو الطريق الصحيح 🔥',
    'استمر! أنت أفضل مما كنت عليه 👏',
    'طاقة قوية… لا توقف الآن ⚡',
    'إنجازك واضح، كمل بنفس الروح 💪',
    'هذا المستوى نريده دائمًا 🚀',
    'لا تتراجع الآن، أنت بدأت صح 👊',
    'ركز… لا تضيّع اللي بنيته 🔒',
    'استمرارك قرار، فاختَر الصح ⚠️',
    'لا أعذار، أنت قادر 🔥',
    'كمّل، الراحة ليست الآن ⏳',
    'تذكّر لماذا بدأت… وواصل 🧠❤️',
    'هذا الجهد لن يضيع، أبدًا 🤍',
    'أنت تبني نفسك بصمت، وهذا عظيم 🌱',
    'يومًا ما ستشكر نفسك على هذا 🤍',
    'ما تفعله الآن… حب لنفسك 💙',
  ];

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await axios.get(`${API}/api/sessions/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setVideoData(res.data);
        const savedTime = res.data.watched_time || 0;
        setPlayedSeconds(savedTime);
      } catch (err) {
        console.error('خطأ في جلب بيانات الحصة', err);
      }
    };
    fetchSession();
  }, [id]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const threshold = 50;

      const isNearEdge =
        e.clientX <= threshold ||
        e.clientX >= windowWidth - threshold ||
        e.clientY <= threshold ||
        e.clientY >= windowHeight - threshold;

      if (isNearEdge) {
        setShowMouseWarning(true);

        if (mouseWarningTimeout) {
          clearTimeout(mouseWarningTimeout);
        }

        const timeout = setTimeout(() => {
          setShowMouseWarning(false);
        }, 5000);

        setMouseWarningTimeout(timeout);
      } else {
        setShowMouseWarning(false);
        if (mouseWarningTimeout) {
          clearTimeout(mouseWarningTimeout);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (mouseWarningTimeout) {
        clearTimeout(mouseWarningTimeout);
      }
    };
  }, [mouseWarningTimeout]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current && playerRef.current.getPlayerState() === 1) {
        const currentTime = Math.floor(playerRef.current.getCurrentTime());
        setPlayedSeconds(currentTime);

        if (currentTime > 0 && currentTime % 10 === 0) {
          updateWatchedTimeOnServer(currentTime);
        }

        if (currentTime > 0 && currentTime % 60 === 0) {
          const randomMsg = shortMsgs[Math.floor(Math.random() * shortMsgs.length)];
          setMotivationMsg(randomMsg);
          setTimeout(() => setMotivationMsg(''), 5000);
        }

        if (currentTime > 0 && currentTime % 1800 === 0) {
          const milestone = milestoneMsgs[Math.floor(Math.random() * milestoneMsgs.length)];
          setMotivationMsg(milestone);
          setTimeout(() => setMotivationMsg(''), 10000);
        }

        if (pomodoroPhase === 'work' && !isPausedByPomodoro) {
          setPomodoroTimeLeft((prev) => {
            if (prev <= 1) {
              setPomodoroPhase('break');
              setPomodoroTimeLeft(5 * 60);
              setIsPausedByPomodoro(true);
              setShowBreakMessage(true);

              if (playerRef.current) {
                playerRef.current.pauseVideo();
              }

              return 0;
            }
            return prev - 1;
          });
        }
      }

      if (pomodoroPhase === 'break' && isPausedByPomodoro) {
        setPomodoroTimeLeft((prev) => {
          if (prev <= 1) {
            setPomodoroPhase('work');
            setPomodoroTimeLeft(20 * 60);
            setIsPausedByPomodoro(false);
            setShowBreakMessage(false);

            if (playerRef.current) {
              playerRef.current.playVideo();
            }

            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [playedSeconds, pomodoroPhase, isPausedByPomodoro]);

  const updateWatchedTimeOnServer = async (currentTime: number, status: string = 'pending') => {
    try {
      await axios.put(
        `${API}/api/sessions/${id}`,
        {
          watched_time: currentTime,
          status: status,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      localStorage.setItem(
        'points',
        String((Number(localStorage.getItem('points')) || 0) + videoData.Points)
      );
    } catch (err) {
      console.error('Update failed', err);
    }
  };

  const onPlayerReady: YouTubeProps['onReady'] = async (event) => {
    playerRef.current = event.target;
    setDuration(event.target.getDuration());
    const calculatedPoints = parseFloat(((event.target.getDuration() / 60) * 0.1).toFixed(2));

    if (videoData && videoData.Points === 0) {
      try {
        await axios.put(
          `${API}/api/sessions/${id}`,
          {
            points: calculatedPoints,
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        console.log('Points auto-calculated:', calculatedPoints);
      } catch (err) {
        console.error('Failed to save auto-calculated points', err);
      }
    }

    if (videoData?.watched_time) {
      event.target.seekTo(videoData.watched_time, true);
    }
    if (videoData?.watched_time) {
      event.target.seekTo(videoData.watched_time, true);
    }

    if (pomodoroPhase == 'work') {
      event.target.pauseVideo();
    }
  };

  const route = useRouter();

  const onPlayerEnd: YouTubeProps['onEnd'] = (event) => {
    const finalTime = Math.floor(event.target.getDuration());
    updateWatchedTimeOnServer(finalTime, 'completed');
    toast.success('🎉 مبروك! أنهيت المهمة بنجاح.');

    setTimeout(() => {
      route.back();
    }, 3000);
  };

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url?.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const percentage = duration > 0 ? (playedSeconds / duration) * 100 : 0;
  const remainingTime = duration - playedSeconds;

  if (!videoData)
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        <YouTube
          videoId={getYouTubeId(videoData.VideoURL) || ''}
          onReady={onPlayerReady}
          onEnd={onPlayerEnd}
          className="w-full h-full"
          opts={{
            height: '100%',
            width: '100%',
            playerVars: { autoplay: 1, controls: 1, modestbranding: 1 },
          }}
        />
      </div>

      <AnimatePresence>
        {motivationMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
          >
            <div className="bg-muted backdrop-blur-md px-8 py-4 rounded-2xl border-2 border-white/20 shadow-2xl">
              <h2 className="text-3xl font-bold text-white text-center drop-shadow-md">
                {motivationMsg}
              </h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMouseWarning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
          >
            <div className="bg-gradient-to-r from-red-600/90 to-orange-600/90 backdrop-blur-md px-12 py-8 rounded-2xl border-2 border-white/30 shadow-2xl max-w-lg mx-4">
              <h2 className="text-3xl font-bold text-white text-center drop-shadow-md mb-4">
                ⚠️ لا تخرج!
              </h2>
              <p className="text-xl text-white text-center opacity-90 mb-2">انتبه</p>
              <p className="text-lg text-white/80 text-center">ركز لم يتبقى الكثير لتنهي الدرس</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBreakMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-40"
          >
            <div className="bg-gradient-to-r from-red-500/90 to-orange-500/90 backdrop-blur-md px-12 py-8 rounded-2xl border-2 border-white/30 shadow-2xl">
              <h2 className="text-4xl font-bold text-white text-center drop-shadow-md mb-4">
                ارتاح قليلا
              </h2>
              <p className="text-xl text-white text-center opacity-90">خذ استراحة لمدة 5 دقائق</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm p-3 rounded-xl border border-white/20 shadow-lg z-30">
        <div className="flex flex-col items-center">
          <div
            className={`text-lg font-bold ${pomodoroPhase === 'work' ? 'text-green-400' : 'text-yellow-400'}`}
          >
            {pomodoroPhase === 'work' ? '⏳ وقت العمل' : '☕ استراحة'}
          </div>
          <div className="text-2xl font-mono font-bold text-white">
            {formatTime(pomodoroTimeLeft)}
          </div>
          <div className="text-xs text-gray-300 mt-1">
            {pomodoroPhase === 'work' ? 'باقي للاستراحة' : 'باقي للعمل'}
          </div>
        </div>
      </div>

      <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/90 to-transparent text-white flex justify-between items-start pointer-events-none">
        <div>
          <h1 className="text-2xl font-bold">{videoData.Title}</h1>
          <p className="text-white font-medium">{videoData.Description}</p>
        </div>
        <div className="bg-black/50 p-3 rounded-xl border border-white/10">
          <span className="text-2xl font-mono font-bold">{Math.floor(remainingTime / 60)}</span>
          <span className="text-xs ml-1 text-gray-400 uppercase">Min Left</span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
        <div className="flex justify-between text-xs font-bold text-white mb-2 px-1">
          <span className="bg-muted px-2 py-0.5 rounded">
            {Math.floor(playedSeconds / 60)}:{String(playedSeconds % 60).padStart(2, '0')}
          </span>
          <span>{Math.round(percentage)}%</span>
        </div>
        <Progress value={percentage} className="h-2 bg-white/10" />
      </div>
    </div>
  );
};

export default Watch;
