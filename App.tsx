
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { VideoEditor } from './components/VideoEditor';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { VideoMetadata, VideoSegment, CropConfig } from './types';

const App: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [segments, setSegments] = useState<VideoSegment[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isCancelMaleVoice, setIsCancelMaleVoice] = useState(false);
  const [isLooping, setIsLooping] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [markClickCount, setMarkClickCount] = useState(0);
  const [cropConfig, setCropConfig] = useState<CropConfig>({
    enabled: false,
    x: 0,
    y: 0,
    width: 0,
    height: 0
  });

  // 监听 Enter 键触发 mark point
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && metadata && !isExporting) {
        e.preventDefault();
        addSegment();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [metadata, isExporting, currentTime, markClickCount]);

  const handleExport = async () => {
    if (!videoFile || segments.length === 0) return;

    setIsExporting(true);
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('mute', isMuted.toString());
    formData.append('cancelMaleVoice', isCancelMaleVoice.toString());
    formData.append('segments', JSON.stringify(segments));
    formData.append('cropConfig', JSON.stringify(cropConfig));

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
        duration: 0,
        size: file.size,
        type: file.type,
        url: url
      });
      setSegments([]);
      setMarkClickCount(0);
      setCropConfig({ enabled: false, x: 0, y: 0, width: 0, height: 0 });
    }
  };

  const addSegment = () => {
    // 基数次点击（1,3,5...）：新建分段（开放状态，end 等于 start）
    // 偶数次点击（2,4,6...）：闭合前一个分段
    if (markClickCount % 2 === 0) {
      // 基数次：创建新分段，开放状态
      const newSegment: VideoSegment = {
        id: Math.random().toString(36).substr(2, 9),
        start: currentTime,
        end: currentTime,
        label: `Segment ${Math.floor(markClickCount / 2) + 1}`
      };
      setSegments(prev => [...prev, newSegment]);
    } else {
      // 偶数次：闭合前一个分段
      setSegments(prev => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (lastIdx >= 0) {
          updated[lastIdx] = {
            ...updated[lastIdx],
            end: currentTime
          };
        }
        return updated;
      });
    }
    setMarkClickCount(prev => prev + 1);
  };

  const removeSegment = (id: string) => {
    setSegments(prev => prev.filter(s => s.id !== id));
  };

  const updateSegment = (id: string, updates: Partial<VideoSegment>) => {
    setSegments(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      <Header
          onExport={handleExport}
          isExporting={isExporting}
          hasSegments={segments.length > 0}
        />
      
      <main className="flex flex-1 overflow-hidden min-h-0">
        {/* Left Sidebar: Controls & Segments */}
        <Sidebar
          metadata={metadata}
          segments={segments}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          isCancelMaleVoice={isCancelMaleVoice}
          setIsCancelMaleVoice={setIsCancelMaleVoice}
          cropConfig={cropConfig}
          setCropConfig={setCropConfig}
          onAddSegment={addSegment}
          onRemoveSegment={removeSegment}
          onUpdateSegment={updateSegment}
          onFileUpload={handleFileUpload}
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
              onMarkPoint={addSegment}
              hasVideo={!!videoFile}
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
