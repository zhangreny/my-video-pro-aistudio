
import React from 'react';
import { VideoSegment, CropConfig } from '../types';

interface TimelineProps {
  duration: number;
  currentTime: number;
  segments: VideoSegment[];
  onSeek: (time: number) => void;
  cropConfig?: CropConfig;
  videoWidth?: number;
  videoHeight?: number;
}

export const Timeline: React.FC<TimelineProps> = ({
  duration,
  currentTime,
  segments,
  onSeek,
  cropConfig,
  videoWidth,
  videoHeight
}) => {
  const getPercentage = (time: number) => (time / duration) * 100;

  // Calculate crop region as percentage of video
  const cropLeftPct = videoWidth ? (cropConfig?.x || 0) / videoWidth * 100 : 0;
  const cropTopPct = videoHeight ? (cropConfig?.y || 0) / videoHeight * 100 : 0;
  const cropWidthPct = videoWidth ? (cropConfig?.width || 0) / videoWidth * 100 : 0;
  const cropHeightPct = videoHeight ? (cropConfig?.height || 0) / videoHeight * 100 : 0;

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

      {/* Crop Region Overlay */}
      {cropConfig && cropConfig.enabled && cropConfig.width > 0 && cropConfig.height > 0 && (
        <div
          className="absolute top-0 bottom-0 bg-red-500/20 border border-red-500/50 pointer-events-none"
          style={{
            left: `${cropLeftPct}%`,
            width: `${cropWidthPct}%`
          }}
        />
      )}

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
