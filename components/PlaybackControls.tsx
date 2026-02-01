
import React from 'react';
import { formatTime } from '../utils/timeUtils';

interface PlaybackControlsProps {
  isPlaying: boolean;
  togglePlay: () => void;
  currentTime: number;
  duration: number;
  isLooping: boolean;
  setIsLooping: (loop: boolean) => void;
  seek: (time: number) => void;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  togglePlay,
  currentTime,
  duration,
  isLooping,
  setIsLooping,
  seek
}) => {
  return (
    <div className="flex items-center space-x-6">
      <button 
        onClick={togglePlay}
        className="text-zinc-100 hover:text-blue-500 transition-colors p-2 bg-zinc-800 rounded-full shadow-inner"
      >
        {isPlaying ? (
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        ) : (
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      <div className="flex-1 flex flex-col space-y-1">
        <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
          <span>{formatTime(currentTime)}</span>
          <span className="text-zinc-600">/</span>
          <span>{formatTime(duration)}</span>
        </div>
        <input 
          type="range"
          min="0"
          max={duration || 100}
          step="0.01"
          value={currentTime}
          onChange={(e) => seek(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-500 transition-all"
        />
      </div>

      <div className="flex items-center space-x-3">
        <button 
          onClick={() => setIsLooping(!isLooping)}
          className={`p-2 rounded-full transition-all duration-200 ${isLooping ? 'bg-blue-600/20 text-blue-500 shadow-sm' : 'text-zinc-500 hover:text-white'}`}
          title={isLooping ? "Looping Enabled" : "Looping Disabled"}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  );
};
