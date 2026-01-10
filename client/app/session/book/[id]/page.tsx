/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import { Volume2, VolumeOff, Loader2, BookOpen, Tag, ArrowLeft } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { API } from '@/lib/api';
import { toast } from 'sonner';

interface Note {
  ID: string;
  page_number: string;
  content: string;
  created_at: string;
}

const FocusBookMode = () => {
  const { id: bookId } = useParams();
  const router = useRouter();
  const videoId = 'qe3l1rvJMlA';
  const [book, setBook] = useState<any>(null);
  const [subject, setSubject] = useState<any>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [pageNumber, setPageNumber] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [audio, setAudio] = useState(true);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const bookRes = await axios.get(`${API}/api/books/${bookId}`, { headers });
      setBook(bookRes.data);

      if (bookRes.data.SubjectId) {
        const subjectRes = await axios.get(`${API}/api/subjects/${bookRes.data.SubjectId}`, {
          headers,
        });
        setSubject(subjectRes.data);
      }

      const notesRes = await axios.get(`${API}/api/notes/book/${bookId}`, { headers });

      if (Array.isArray(notesRes.data.notes)) {
        setNotes(notesRes.data.notes);
      } else {
        setNotes([]);
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      setNotes([]);
      toast.error('فشل في تحميل بيانات الجلسة');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookId) fetchData();
  }, [bookId]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0) {
      handleTimerEnd();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleTimerEnd = () => {
    if (!isBreak) {
      setIsBreak(true);
      setTimeLeft(5 * 60);
      toast.info('وقت الراحة! استرح قليلاً');
    } else {
      setIsBreak(false);
      setTimeLeft(25 * 60);
      setIsActive(false);
      toast.success('عدنا للتركيز');
    }
  };

  const saveNote = async () => {
    if (!noteContent) return;
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(
        `${API}/api/notes`,
        {
          book_id: bookId,
          page_number: pageNumber,
          content: noteContent,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log(response);

      setNotes([response.data.note, ...notes]);
      setNoteContent('');
      setPageNumber('');
      toast.success('تم تدوين الملاحظة');
    } catch (error) {
      toast.error('فشل حفظ الملاحظة');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (loading)
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-500 w-12 h-12" />
      </div>
    );

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white antialiased">
      <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full w-auto h-auto">
          <YouTube
            videoId={videoId}
            opts={{
              playerVars: {
                autoplay: 1,
                controls: 0,
                rel: 0,
                mute: audio ? 1 : 0,
                loop: 1,
                playlist: videoId,
              },
            }}
            className="youtube-container"
          />
        </div>
      </div>

      {isBreak ? (
        <div className="relative z-30 flex flex-col items-center justify-center h-screen w-full animate-in fade-in zoom-in duration-700">
          <div className="text-center p-12 rounded-[3rem] bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl">
            <h2 className="text-4xl font-bold text-orange-400 mb-4 animate-bounce">وقت الراحة</h2>
            <div className="text-[12rem] font-black tracking-tighter text-white animate-pulse leading-none">
              {formatTime(timeLeft)}
            </div>
            <button
              onClick={() => setIsBreak(false)}
              className="mt-12 px-10 py-4 bg-white/10 rounded-2xl border border-white/10 transition-all"
            >
              إنهاء الراحة
            </button>
          </div>
        </div>
      ) : (
        <div className="relative z-20 flex flex-col items-center p-6 md:p-12 h-screen overflow-y-auto custom-scrollbar">
          <div className="fixed top-6 left-6 right-6 flex justify-between items-center z-50">
            <button
              onClick={() => router.back()}
              className="p-3 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 hover:bg-white/10 transition-all"
            >
              <ArrowLeft />
            </button>
            <div className="flex gap-3">
              <div className="hidden md:flex flex-col items-end px-4">
                <span className="text-orange-500 font-bold text-xs uppercase tracking-widest">
                  {subject?.Title || 'بدون مادة'}
                </span>
                <span className="text-white text-lg font-bold">{book?.Title}</span>
              </div>
              <button
                onClick={() => setAudio(!audio)}
                className="p-3 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 hover:bg-white/10 transition-all"
              >
                {audio ? <VolumeOff /> : <Volume2 />}
              </button>
            </div>
          </div>

          <header className="mb-12 text-center mt-12">
            <h1 className="text-2xl font-light tracking-[0.3em] text-gray-400 uppercase">
              Focus Session
            </h1>
            <div className="h-1 w-20 bg-orange-500 mx-auto mt-2 rounded-full"></div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full max-w-6xl">
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 shadow-2xl text-center">
                <div className="text-[7rem] font-thin tracking-tighter mb-8 tabular-nums">
                  {formatTime(timeLeft)}
                </div>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setIsActive(!isActive)}
                    className={`flex-1 max-w-[200px] py-5 rounded-2xl font-bold transition-all ${isActive ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'}`}
                  >
                    {isActive ? 'إيقاف مؤقت' : 'ابدأ التركيز'}
                  </button>
                  <button
                    onClick={() => {
                      setIsActive(false);
                      setTimeLeft(25 * 60);
                    }}
                    className="px-8 py-5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all"
                  >
                    إعادة
                  </button>
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/10">
                <h3 className="text-lg font-semibold mb-5 flex items-center gap-3">
                  <span className="p-2 bg-orange-500/20 rounded-lg text-orange-500">✏️</span> تدوين
                  سريع لـ {book?.Title}
                </h3>
                <input
                  type="text"
                  placeholder="رقم الصفحة..."
                  value={pageNumber}
                  onChange={(e) => setPageNumber(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-xl mb-4 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                />
                <textarea
                  placeholder="اكتب فكرتك هنا..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-xl h-28 mb-4 focus:ring-1 focus:ring-orange-500 outline-none transition-all resize-none"
                />
                <button
                  onClick={saveNote}
                  className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-orange-600 transition-all"
                >
                  حفظ في السجل
                </button>
              </div>
            </div>

            <div className="flex flex-col h-full max-h-[700px]">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="text-orange-500">●</span> ملاحظات الكتاب السابقة
              </h3>
              <div className="space-y-4 overflow-y-auto pr-4 custom-scrollbar">
                {notes?.length === 0 ? (
                  <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 text-gray-500">
                    لا توجد ملاحظات لهذا الكتاب بعد
                  </div>
                ) : (
                  notes?.map((item) => (
                    <div
                      key={item.ID}
                      className="bg-white/5 hover:bg-white/10 p-6 rounded-2xl border border-white/5 transition-all"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-orange-500 font-bold uppercase">
                            Page
                          </span>
                          <span className="text-xl font-mono">#{item.page_number || '--'}</span>
                        </div>
                        <span className="text-[10px] text-gray-500">
                          {new Date(item.created_at).toLocaleDateString('ar-DZ')}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed border-t border-white/5 pt-4">
                        {item.content}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .youtube-container iframe {
          width: 100vw;
          height: 100vh;
          transform: scale(1.8);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(249, 115, 22, 0.3);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default FocusBookMode;
