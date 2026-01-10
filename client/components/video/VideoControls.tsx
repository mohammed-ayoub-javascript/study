import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Pause, Play, VolumeX, Volume2, RotateCcw, FastForward, Rewind } from 'lucide-react';

interface VideoControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  controlsVisible: boolean;
  playedSeconds: number;
  duration: number;
  togglePlay: () => void;
  toggleMute: () => void;
  handleSeek: (value: number[]) => void;
  formatTime: (seconds: number) => string;
  onRewind: () => void;
  onFastForward: () => void;
  onReset: () => void;
}

export const VideoControls: React.FC<VideoControlsProps> = ({
  isPlaying,
  isMuted,
  controlsVisible,
  playedSeconds,
  duration,
  togglePlay,
  toggleMute,
  handleSeek,
  formatTime,
  onRewind,
  onFastForward,
  onReset,
}) => {
  return (
    <AnimatePresence>
      {controlsVisible && (
        <motion.div
          animate={{ 
            opacity: 1, 
            y: isPlaying ? 0 : -window.innerHeight / 4,
            width: isPlaying ? "95%" : "280px",      
            left: isPlaying ? "" : "40%",                             
          }}
          exit={{ opacity: 0, y: 50 }}
          transition={{
            type: "spring",
            damping: 25,     
            stiffness: 150, 
            mass: 1         
          }}
          className="absolute bottom-10 z-50 flex justify-center pointer-events-none"
        >
          <motion.div 
            layout
            className="flex items-center w-full h-full gap-2 p-4 rounded-3xl bg-black/60 backdrop-blur-2xl border border-white/20 pointer-events-auto shadow-2xl"
          >
            <motion.div layout className="flex items-center gap-1 flex-1 justify-start">
              
              <Button 
                variant="ghost" size="icon"
                onClick={onRewind}
                className="text-white hover:bg-white/10 rounded-full"
              >
                <FastForward size={20} fill="currentColor" />
              </Button>

              <Button 
                variant="ghost" size="icon"
                onClick={togglePlay}
                className="text-white hover:bg-white/20 rounded-full w-14 h-14"
              >
                {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
              </Button>

              <Button 
                variant="ghost" size="icon"
                onClick={onFastForward}
                className="text-white hover:bg-white/10 rounded-full"
              >
                <Rewind size={20} fill="currentColor" />
              </Button>

              <Button 
                variant="ghost" size="icon"
                onClick={toggleMute}
                className="text-white hover:bg-white/10 rounded-full ml-2"
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </Button>
            </motion.div>

            <AnimatePresence>
              {isPlaying && (
                <motion.div 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "100%" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex items-center gap-3 flex-1 px-4"
                >
                  <span className="text-[10px] font-mono text-white/70">{formatTime(playedSeconds)}</span>
                  <Slider
                    value={[playedSeconds]}
                    max={duration}
                    step={1}
                    onValueChange={handleSeek}
                    className="cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-white/70">{formatTime(duration)}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div layout className="flex items-center justify-end">
              <Button 
                variant="ghost" size="icon"
                onClick={onReset}
                className="text-white hover:bg-white/10 rounded-full w-12 h-12"
              >
                <RotateCcw size={20} />
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};