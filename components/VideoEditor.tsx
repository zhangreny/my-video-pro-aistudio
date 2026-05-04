
import React, { useRef, useState, useEffect } from 'react';
import { VideoMetadata, VideoSegment, CropConfig } from '../types';
import { Timeline } from './Timeline';
import { PlaybackControls } from './PlaybackControls';

interface VideoEditorProps {
  metadata: VideoMetadata;
  segments: VideoSegment[];
  isMuted: boolean;
  isLooping: boolean;
  setIsLooping: (loop: boolean) => void;
  onTimeUpdate: (time: number) => void;
  setDuration: (duration: number) => void;
  onMarkPoint?: () => void;
  hasVideo?: boolean;
  cropConfig?: CropConfig;
  videoWidth?: number;
  videoHeight?: number;
}

export const VideoEditor: React.FC<VideoEditorProps> = ({
  metadata,
  segments,
  isMuted,
  isLooping,
  setIsLooping,
  onTimeUpdate,
  setDuration,
  onMarkPoint,
  hasVideo,
  cropConfig,
  videoWidth,
  videoHeight
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [actualVideoSize, setActualVideoSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);
      onTimeUpdate(time);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setActualVideoSize({
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight
      });
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const seek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-black overflow-hidden">
      {/* Main Preview Container - min-h-0 is crucial for flex children to shrink */}
      <div className="flex-1 min-h-0 relative flex items-center justify-center p-4 overflow-hidden">
        <video 
          ref={videoRef}
          src={metadata.url}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          loop={isLooping}
          className="max-h-full max-w-full object-contain rounded shadow-2xl shadow-black transition-all duration-300"
          onClick={togglePlay}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        
        {/* Play Overlay */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/20 group hover:bg-black/40 transition-all z-10"
          >
            <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8 md:w-10 md:h-10 text-white fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </button>
        )}

        {/* Crop Overlay */}
        {cropConfig && cropConfig.enabled && actualVideoSize.width > 0 && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: '100%',
              height: '100%'
            }}
          >
            <div
              className="absolute border-2 border-red-500 bg-red-500/10"
              style={{
                left: `${(cropConfig.x / actualVideoSize.width) * 100}%`,
                top: `${(cropConfig.y / actualVideoSize.height) * 100}%`,
                width: `${(cropConfig.width / actualVideoSize.width) * 100}%`,
                height: `${(cropConfig.height / actualVideoSize.height) * 100}%`,
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)'
              }}
            >
              {/* Corner handles */}
              {[
                { top: -4, left: -4 },
                { top: -4, right: -4 },
                { bottom: -4, left: -4 },
                { bottom: -4, right: -4 }
              ].map((pos, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-red-500 rounded-sm"
                  style={pos}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Control Bar - Fixed at bottom via shrink-0 in the flex container */}
      <div className="bg-zinc-900 border-t border-zinc-800 px-6 py-4 space-y-4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] shrink-0 z-20">
        <PlaybackControls
          isPlaying={isPlaying}
          togglePlay={togglePlay}
          currentTime={currentTime}
          duration={metadata.duration}
          isLooping={isLooping}
          setIsLooping={setIsLooping}
          seek={seek}
          onMarkPoint={onMarkPoint}
          hasVideo={hasVideo}
        />
        
        <Timeline
          duration={metadata.duration}
          currentTime={currentTime}
          segments={segments}
          onSeek={seek}
          cropConfig={cropConfig}
          videoWidth={actualVideoSize.width}
          videoHeight={actualVideoSize.height}
        />
      </div>
    </div>
  );
};
