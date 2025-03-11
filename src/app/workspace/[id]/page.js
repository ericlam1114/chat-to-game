'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import ChatInterface from '@/components/chat/ChatInterface';
import GamePreview from '@/components/game/GamePreview';
import TemplateSelector from '@/components/game/TemplateSelector';
import { Gamepad, Code, Share2, ChevronLeft, Settings, RefreshCcw } from 'lucide-react';

export default function WorkspacePage() {
  const params = useParams();
  const gameId = params.id;
  
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [showCode, setShowCode] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  
  useEffect(() => {
    async function fetchGameData() {
      try {
        const response = await fetch(`/api/games/${gameId}`);
        
        if (!response.ok) throw new Error('Failed to fetch game data');
        
        const data = await response.json();
        setGameData(data);
        
        // Initialize chat with the original prompt
        setMessages([
          { 
            role: 'user', 
            content: data.prompt 
          },
          { 
            role: 'assistant', 
            content: `I've created a game based on your description: "${data.prompt}". You can see it in the preview panel. Feel free to ask for any changes or additions!` 
          }
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching game data:', error);
        setLoading(false);
      }
    }
    
    if (gameId) {
      fetchGameData();
    }
  }, [gameId]);

  useEffect(() => {
    // Make sure this function is available immediately
    window.updateGamePreview = (newGameCode) => {
      console.log("Updating game preview with new code:", newGameCode.substring(0, 100) + "...");
      setGameData(prev => ({
        ...prev,
        gameCode: newGameCode
      }));
    };
    
    // Add specific character swap handlers
    window.handleCharacterSwap = (characterType) => {
      console.log(`WorkspacePage: Handling character swap to ${characterType}`);
      // Force a character swap in the preview
      if (window.characterManager && window.characterManager.generateGameCode) {
        const newCode = window.characterManager.generateGameCode(characterType, {});
        window.updateGamePreview(newCode);
      }
    };
    
    // Add listener for hotkeys
    const handleKeyDown = (e) => {
      // Number keys 1-5 for character swapping
      const keyNumber = parseInt(e.key);
      if (!isNaN(keyNumber) && keyNumber >= 1 && keyNumber <= 5) {
        console.log(`Key ${keyNumber} pressed for character swap`);
        const characterTypes = ['player', 'vehicle', 'wizard', 'airplane', 'stylizedAirplane'];
        if (characterTypes[keyNumber-1]) {
          window.handleCharacterSwap(characterTypes[keyNumber-1]);
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.updateGamePreview = null;
      window.handleCharacterSwap = null;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);


  
  async function handleSendMessage(message) {
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    
    // Show loading indicator
    setMessages(prev => [...prev, { role: 'assistant', content: '...', loading: true }]);
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId,
          message,
          history: messages.map(msg => ({ role: msg.role, content: msg.content }))
        }),
      });
      
      if (!response.ok) throw new Error('Failed to get response');
      
      const data = await response.json();
      
      // Replace loading message with actual response
      setMessages(prev => prev.slice(0, prev.length - 1).concat({ 
        role: 'assistant', 
        content: data.message 
      }));
      
      // Update game data if there were changes
      if (data.gameData) {
        setGameData(data.gameData);
      }
    } catch (error) {
      console.error('Error in chat:', error);
      // Replace loading message with error
      setMessages(prev => prev.slice(0, prev.length - 1).concat({ 
        role: 'assistant', 
        content: 'Sorry, there was an error processing your request. Please try again.' 
      }));
    }
  }

  const handleSelectTemplate = async (templateId) => {
    setLoading(true);
    try {
      const response = await fetch('/api/regenerate-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId,
          template: templateId,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to regenerate game');
      
      const data = await response.json();
      setGameData(data);
      
      // Add a message about the template change
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `I've updated the game to use the ${templateId.toUpperCase()} template. You can now customize it or request specific changes.` 
      }]);
      
    } catch (error) {
      console.error('Error regenerating game:', error);
    } finally {
      setLoading(false);
      setShowTemplateSelector(false);
    }
  };

  const handleUpdateAssets = async (assetSettings) => {
    setLoading(true);
    try {
      const response = await fetch('/api/update-game-assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId,
          assetSettings,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to update game assets');
      
      const data = await response.json();
      setGameData(data);
      
      // Add a message about the asset changes
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `I've updated the game assets as requested. Let me know if you'd like to make any more changes.` 
      }]);
      
    } catch (error) {
      console.error('Error updating game assets:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Header */}
      <div className="flex-none h-16 border-b border-zinc-800 flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <a href="/" className="flex items-center text-gray-400 hover:text-white">
            <ChevronLeft size={20} className="mr-1" />
            <span>Back</span>
          </a>
          <div className="h-6 border-l border-zinc-700"></div>
          <div className="flex items-center">
            <Gamepad className="text-indigo-400 mr-2" size={20} />
            <h1 className="text-xl font-semibold">Game Workspace</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowTemplateSelector(!showTemplateSelector)}
            className="btn flex items-center space-x-2 bg-zinc-800 hover:bg-zinc-700"
          >
            <Settings size={16} />
            <span>Template & Assets</span>
          </button>
          <button
            onClick={() => setShowCode(!showCode)}
            className="btn flex items-center space-x-2 bg-zinc-800 hover:bg-zinc-700"
          >
            <Code size={16} />
            <span>{showCode ? 'Hide Code' : 'Show Code'}</span>
          </button>
          <button
            onClick={() => {/* Share functionality */}}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Share2 size={16} />
            <span>Share Game</span>
          </button>
        </div>
      </div>
      
      {/* Template Selector Panel (conditionally rendered) */}
      {showTemplateSelector && (
        <div className="border-b border-zinc-800 overflow-auto max-h-96">
          <TemplateSelector 
            onSelectTemplate={handleSelectTemplate}
            onUpdateAssets={handleUpdateAssets}
          />
        </div>
      )}
      
      <div className="flex-grow flex overflow-hidden">
        {/* Chat Interface - Left Panel */}
        <div className="w-1/2 border-r border-zinc-800 flex flex-col">
          <ChatInterface 
            messages={messages} 
            onSendMessage={handleSendMessage} 
          />
        </div>
        
        {/* Game Preview - Right Panel */}
        <div className="w-1/2 flex flex-col bg-zinc-950">
          {loading ? (
            <div className="flex-grow flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="animate-spin mb-4">
                  <RefreshCcw size={32} className="text-indigo-400" />
                </div>
                <div className="text-xl text-gray-400">Loading game...</div>
              </div>
            </div>
          ) : !gameData ? (
            <div className="flex-grow flex items-center justify-center">
              <div className="text-xl text-gray-400">Game data not found</div>
            </div>
          ) : (
            <>
              <div className={`${showCode ? 'h-1/2' : 'flex-grow'} relative overflow-hidden card pulse-glow border-none rounded-none`}>
                <div className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                  {gameData.gameType || 'Custom Game'}
                </div>
                <GamePreview 
                  gameCode={gameData.gameCode} 
                  gameType={gameData.gameType}
                />
              </div>
              
              {showCode && (
                <div className="h-1/2 border-t border-zinc-800 overflow-auto">
                  <div className="p-2 bg-zinc-900 border-b border-zinc-800 text-sm font-mono flex justify-between items-center">
                    <span>Game Code</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(gameData.gameCode);
                      }}
                      className="px-2 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 rounded"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="p-4 text-sm overflow-auto bg-zinc-900 h-full">
                    <code className="text-gray-300">{gameData.gameCode}</code>
                  </pre>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}