
import React from 'react';
import { VideoMetadata, VideoSegment } from '../types';
import { formatTime } from '../utils/timeUtils';

interface SidebarProps {
  metadata: VideoMetadata | null;
  segments: VideoSegment[];
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  onAddSegment: () => void;
  onRemoveSegment: (id: string) => void;
  onUpdateSegment: (id: string, updates: Partial<VideoSegment>) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  isExporting: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  metadata,
  segments,
  isMuted,
  setIsMuted,
  onAddSegment,
  onRemoveSegment,
  onUpdateSegment,
  onFileUpload,
  onExport,
  isExporting
}) => {
  return (
    <aside className="w-80 border-r border-zinc-800 flex flex-col bg-zinc-900 shrink-0">
      {/* Import Section */}
      <div className="p-4 border-b border-zinc-800">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Project Assets</h3>
        <label className="flex items-center space-x-3 p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg cursor-pointer border border-zinc-700 transition-colors group">
          <div className="w-10 h-10 bg-zinc-900 rounded flex items-center justify-center group-hover:bg-blue-600 transition-colors">
            <svg className="w-5 h-5 text-zinc-400 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{metadata?.name || 'Import Video'}</p>
            <p className="text-xs text-zinc-500">{metadata ? `${(metadata.size / (1024 * 1024)).toFixed(1)} MB` : 'No file selected'}</p>
          </div>
          <input type="file" className="hidden" accept="video/*" onChange={onFileUpload} />
        </label>
      </div>

      {/* Export Settings */}
      <div className="p-4 border-b border-zinc-800">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Global Output Settings</h3>
        <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
          <div className="flex items-center space-x-3">
            <svg className={`w-5 h-5 ${isMuted ? 'text-red-500' : 'text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMuted ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              )}
            </svg>
            <span className="text-sm font-medium">Mute Output Audio</span>
          </div>
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 focus:outline-none ${isMuted ? 'bg-blue-600' : 'bg-zinc-700'}`}
          >
            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${isMuted ? 'translate-x-5' : 'translate-x-0'}`}></div>
          </button>
        </div>
      </div>

      {/* Segments List */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 flex items-center justify-between shrink-0">
          <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Cuts & Segments</h3>
          <button 
            disabled={!metadata}
            onClick={onAddSegment}
            className="p-1 hover:bg-zinc-800 rounded text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Add Segment"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
          {segments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-zinc-500 italic">No segments added yet.</p>
            </div>
          ) : (
            segments.map((segment, idx) => (
              <div key={segment.id} className="bg-zinc-800/80 rounded-lg p-3 border border-zinc-700 hover:border-zinc-600 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-blue-400">#0{idx + 1}</span>
                  <button 
                    onClick={() => onRemoveSegment(segment.id)}
                    className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase font-bold">Start</label>
                      <input 
                        type="number"
                        step="0.1"
                        min="0"
                        max={segment.end}
                        value={segment.start}
                        onChange={(e) => onUpdateSegment(segment.id, { start: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-zinc-900 text-xs p-1.5 rounded border border-zinc-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-500 uppercase font-bold">End</label>
                      <input 
                        type="number"
                        step="0.1"
                        min={segment.start}
                        max={metadata?.duration || 1000}
                        value={segment.end}
                        onChange={(e) => onUpdateSegment(segment.id, { end: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-zinc-900 text-xs p-1.5 rounded border border-zinc-700"
                      />
                    </div>
                  </div>
                  <div className="text-[10px] text-zinc-500 flex justify-between italic">
                    <span>Duration: {(segment.end - segment.start).toFixed(2)}s</span>
                    <span>{formatTime(segment.start)} - {formatTime(segment.end)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-950/50">
        <button 
          disabled={segments.length === 0 || isExporting}
          onClick={onExport}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-lg font-bold text-sm shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center space-x-2"
        >
          {isExporting ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>Export {segments.length} Clips</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
