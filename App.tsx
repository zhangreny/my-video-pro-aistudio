
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { VideoEditor } from './components/VideoEditor';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { VideoMetadata, VideoSegment } from './types';

const App: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [segments, setSegments] = useState<VideoSegment[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!videoFile || segments.length === 0) return;

    setIsExporting(true);
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('mute', isMuted.toString());
    formData.append('segments', JSON.stringify(segments));

    try {
      const response = await fetch('http://localhost:5000/export', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `exported_video_${Date.now()}.mp4`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await response.json();
        alert(`Export failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Make sure the backend is running.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoFile(file);
      setMetadata({
        name: file.name,
        duration: 0, // Will be updated when video loads
        size: file.size,
        type: file.type,
        url: url
      });
      setSegments([]); // Reset segments for new video
    }
  };

  const addSegment = () => {
    const newSegment: VideoSegment = {
      id: Math.random().toString(36).substr(2, 9),
      start: currentTime,
      end: Math.min(currentTime + 5, metadata?.duration || 0),
      label: `Segment ${segments.length + 1}`
    };
    setSegments(prev => [...prev, newSegment]);
  };

  const removeSegment = (id: string) => {
    setSegments(prev => prev.filter(s => s.id !== id));
  };

  const updateSegment = (id: string, updates: Partial<VideoSegment>) => {
    setSegments(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      <Header />
      
      <main className="flex flex-1 overflow-hidden min-h-0">
        {/* Left Sidebar: Controls & Segments */}
        <Sidebar 
          metadata={metadata}
          segments={segments}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          onAddSegment={addSegment}
          onRemoveSegment={removeSegment}
          onUpdateSegment={updateSegment}
          onFileUpload={handleFileUpload}
          onExport={handleExport}
          isExporting={isExporting}
        />

        {/* Center: Video Preview & Timeline */}
        <div className="flex-1 flex flex-col bg-zinc-900 overflow-hidden relative min-h-0">
          {metadata ? (
            <VideoEditor 
              metadata={metadata}
              segments={segments}
              isMuted={isMuted}
              isLooping={isLooping}
              setIsLooping={setIsLooping}
              onTimeUpdate={setCurrentTime}
              setDuration={(d) => setMetadata(prev => prev ? {...prev, duration: d} : null)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 p-8">
              <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center">
                <svg className="w-10 h-10 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold">Start Editing Your Video</h2>
              <p className="text-zinc-400 text-center max-w-sm">
                Import a video file to begin cutting segments, managing audio, and generating smart highlights.
              </p>
              <label className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors cursor-pointer shadow-lg shadow-blue-900/20">
                Choose Video
                <input type="file" className="hidden" accept="video/*" onChange={handleFileUpload} />
              </label>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
