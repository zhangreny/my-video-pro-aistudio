
import React from 'react';

interface HeaderProps {
  onExport?: () => void;
  isExporting?: boolean;
  hasSegments?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onExport, isExporting, hasSegments }) => {
  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between px-6 shrink-0 z-10">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h1 className="text-lg font-bold tracking-tight">VIDEO PRO</h1>
      </div>

      <div className="flex items-center">
        <button
          disabled={!hasSegments || isExporting}
          onClick={onExport}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-lg font-medium text-sm transition-all flex items-center space-x-2"
        >
          {isExporting ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>Export</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
