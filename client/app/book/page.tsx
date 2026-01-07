/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';

const Book = () => {
  const videoId = "qe3l1rvJMlA";
  
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false); 

  const [pageNumber, setPageNumber] = useState("");
  const [note, setNote] = useState("");
  const [savedData, setSavedData] = useState([]);

  useEffect(() => {
    const request = indexedDB.open("EndLineDB", 1);
    request.onupgradeneeded = (e  : any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("bookNotes")) {
        db.createObjectStore("bookNotes", { keyPath: "id", autoIncrement: true });
      }
    };
    loadNotes();
  }, []);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerEnd();
    }
    return () => clearInterval(interval as any);
  }, [isActive, timeLeft]);

  const handleTimerEnd = () => {
    if (!isBreak) {
      setIsBreak(true);
      setTimeLeft(5 * 60); 
      setIsActive(true); 
    } else {
      setIsBreak(false);
      setTimeLeft(25 * 60);
      setIsActive(false);
    }
  };

  const formatTime = (seconds : number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const saveNote = () => {
    if (!note) return;
    const request = indexedDB.open("EndLineDB", 1);
    request.onsuccess = (e : any) => {
      const db = e.target.result;
      const transaction = db.transaction("bookNotes", "readwrite");
      const store = transaction.objectStore("bookNotes");
      store.add({ page: pageNumber, content: note, date: new Date().toLocaleString() });
      setNote(""); setPageNumber(""); loadNotes();
    };
  };

  const loadNotes = () => {
    const request = indexedDB.open("EndLineDB", 1);
    request.onsuccess = (e : any) => {
      const db = e.target.result;
      const transaction = db.transaction("bookNotes", "readonly");
      const store = transaction.objectStore("bookNotes");
      const getAll = store.getAll();
      getAll.onsuccess = () => setSavedData(getAll.result.reverse());
    };
  };

const videoOptions = {
  playerVars: {
    autoplay: 1,
    controls: 0,
    rel: 0,          
    showinfo: 0,
    mute: 0,         
    loop: 1,         
    playlist: videoId, 
    origin: typeof window !== 'undefined' ? window.location.origin : '',
  },
};
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white antialiased">
      
      <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full w-auto h-auto">
          <YouTube videoId={videoId} opts={videoOptions} className="youtube-container" onReady={(event) => {
    event.target.playVideo();
   
  }} />
        </div>
      </div>

      {isBreak ? (
        <div className="relative z-30 flex flex-col items-center justify-center h-screen w-full animate-in fade-in zoom-in duration-700">
          <div className="text-center p-12 rounded-[3rem] bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl">
            <h2 className="text-4xl font-bold text-orange-400 mb-4 animate-bounce">وقت الراحة</h2>
            <p className="text-gray-400 mb-8">استرخِ قليلاً، أنت تبلي بلاءً حسناً</p>
            <div className="text-[12rem] font-black tracking-tighter text-white animate-pulse leading-none">
              {formatTime(timeLeft)}
            </div>
            <button 
               onClick={() => setIsBreak(false)} 
               className="mt-12 px-10 py-4 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 transition-all"
            >
              إنهاء الراحة والعودة للعمل
            </button>
          </div>
        </div>
      ) : (
        <div className="relative z-20 flex flex-col items-center p-6 md:p-12 h-screen overflow-y-auto animate-in fade-in slide-in-from-bottom duration-700">
          
          <header className="mb-12 text-center ">
            <h1 className="text-4xl font-extrabold tracking-tight drop-shadow-2xl">
              وضع الكتاب <span className="text-orange-500">EndLine</span>
            </h1>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full max-w-6xl">
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[2rem] border border-white/10 shadow-2xl text-center transition-all hover:bg-white/10">
                <p className="text-xs font-bold text-orange-400 uppercase tracking-[0.2em] mb-4">Focus Session</p>
                <div className="text-8xl font-thin tracking-tighter mb-8">{formatTime(timeLeft)}</div>
                <div className="flex gap-4 justify-center">
                  <button onClick={() => setIsActive(!isActive)} className={`flex-1 max-w-[160px] py-4 rounded-2xl font-bold transition-all ${isActive ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 hover:scale-105'}`}>
                    {isActive ? 'إيقاف مؤقت' : 'ابدأ الآن'}
                  </button>
                  <button onClick={() => {setIsActive(false); setTimeLeft(25 * 60);}} className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all">إعادة</button>
                </div>
              </div>

              <div className="bg-black/40 backdrop-blur-md p-8 rounded-[2rem] border border-white/10 shadow-inner">
                <h3 className="text-lg font-semibold mb-5 flex items-center gap-3 text-gray-200">
                  <span className="p-2 bg-orange-500/20 rounded-lg text-orange-500">✏️</span> مفكرة الدراسة
                </h3>
                <input type="number" placeholder="رقم الصفحة الحالية" value={pageNumber} onChange={(e) => setPageNumber(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl mb-4 focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-gray-600" />
                <textarea placeholder="ما هي الفكرة التي تود تدوينها؟" value={note} onChange={(e) => setNote(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl h-28 mb-4 focus:ring-2 focus:ring-orange-500 outline-none transition-all resize-none placeholder:text-gray-600" />
                <button onClick={saveNote} className="w-full bg-white text-black hover:bg-orange-500 hover:text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all duration-500 shadow-xl">تثبيت الملاحظة</button>
              </div>
            </div>

            <div className="flex flex-col h-full max-h-[650px]">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-white"><span className="text-orange-500">●</span> سجل المراجعة</h3>
              <div className="space-y-4 overflow-y-auto pr-4 custom-scrollbar">
                {savedData.length === 0 ? (
                  <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 text-gray-500 italic">سجلك فارغ.. ابدأ في التدوين الآن</div>
                ) : (
                  savedData.map((item : any) => (
                    <div key={item.id} className="group bg-white/5 hover:bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/5 hover:border-orange-500/30 transition-all duration-300 shadow-lg">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col"><span className="text-[10px] text-orange-500 font-bold uppercase tracking-tighter">Page Reference</span><span className="text-xl font-mono text-white">#{item.page || '00'}</span></div>
                        <span className="text-[10px] text-gray-500 bg-black/30 px-2 py-1 rounded italic">{item.date}</span>
                      </div>
                      <p className="text-gray-300 text-sm leading-relaxed border-t border-white/5 pt-4">{item.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .youtube-container iframe { width: 100vw; height: 100vh; transform: scale(1.5); }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,165,0,0.2); border-radius: 10px; }
        @keyframes bounce { 0%, 100% { transform: translateY(-5%); } 50% { transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(0.98); } }
        .animate-bounce { animation: bounce 2s infinite; }
        .animate-pulse { animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>
    </div>
  );
};

export default Book;