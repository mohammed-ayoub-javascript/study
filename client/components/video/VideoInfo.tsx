import React from 'react';
import { VideoData } from '@/types/types';

interface VideoInfoProps {
  videoData: VideoData;
  remainingTime: number;
  percentage: number;
  playedSeconds: number;
}

export const VideoInfo: React.FC<VideoInfoProps> = ({
  videoData,
  remainingTime,
  percentage,
  playedSeconds,
}) => {
  return (
    <>
      <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/90 to-transparent text-white flex justify-between items-start pointer-events-none">
        
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
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </>
  );
};
