'use client';

import { useEffect, useRef, useState } from 'react';
import ThreeJsRenderer from './ThreeJsRenderer';

export default function GamePreview({ gameCode, gameType }) {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };
  
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="max-w-md p-6 bg-white rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold text-red-600 mb-2">Error Rendering Game</h3>
          <p className="text-gray-700 mb-4">{error.message}</p>
          <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-60">
            {error.stack}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={handleFullscreen}
          className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
            </svg>
          )}
        </button>
        
        <button
          onClick={() => {/* Restart game functionality */}}
          className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded"
          title="Restart Game"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 4v6h6"></path>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
          </svg>
        </button>
      </div>
      
      <ThreeJsRenderer 
        gameCode={gameCode} 
        gameType={gameType}
        onError={setError}
      />
    </div>
  );
}