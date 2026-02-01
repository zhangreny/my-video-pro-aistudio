
import React from 'react';
import { VideoSegment } from '../types';

interface TimelineProps {
  duration: number;
  currentTime: number;
  segments: VideoSegment[];
  onSeek: (time: number) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  duration,
  currentTime,
  segments,
  onSeek
}) => {
  const getPercentage = (time: number) => (time / duration) * 100;

  return (
    <div className="relative h-12 bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden group cursor-crosshair">
      {/* Grid Lines */}
      <div className="absolute inset-0 flex justify-between px-1 opacity-10 pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-full w-px bg-zinc-400"></div>
        ))}
      </div>

      {/* Segments Display */}
      {segments.map((segment) => (
        <div 
          key={segment.id}
          className="absolute top-0 bottom-0 bg-blue-500/30 border-x border-blue-500/50 flex items-center justify-center text-[10px] font-bold text-blue-300"
          style={{
            left: `${getPercentage(segment.start)}%`,
            width: `${getPercentage(segment.end - segment.start)}%`
          }}
        >
          <span className="truncate px-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {segment.label}
          </span>
        </div>
      ))}

      {/* Click-to-seek Overlay */}
      <div 
        className="absolute inset-0 z-10"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const percentage = x / rect.width;
          onSeek(percentage * duration);
        }}
      ></div>

      {/* Playhead */}
      <div 
        className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none shadow-[0_0_10px_rgba(239,68,68,0.5)]"
        style={{ left: `${getPercentage(currentTime)}%` }}
      >
        <div className="absolute -top-1 -left-1 w-2 h-2 bg-red-500 rotate-45"></div>
      </div>
    </div>
  );
};
