'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Gamepad, Target, PuzzleIcon, Globe, Share2, Download, Lock, Sparkles } from 'lucide-react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('RPG Adventure');
  const [isTyping, setIsTyping] = useState(true);
  const router = useRouter();

  // Example prompts that showcase the app's capabilities
  const examplePrompts = [
    {
      title: "Fantasy RPG",
      prompt: "Create a medieval fantasy RPG with a magic system and dragon enemies",
      icon: "🐉"
    },
    {
      title: "Space Shooter",
      prompt: "Build a space shooter with asteroids and alien enemies",
      icon: "🚀"
    },
    {
      title: "Platformer",
      prompt: "Design a colorful platformer with coin collection and enemy jumping",
      icon: "🎮"
    },
    {
      title: "Racing Game",
      prompt: "Make a racing game with futuristic hovercars and neon city tracks",
      icon: "🏎️"
    }
  ];

  // Typewriter effect
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsTyping(false);
    }, 3000);
    
    return () => clearTimeout(timeout);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/game-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error('Failed to generate game');
      
      const data = await response.json();
      router.push(`/workspace/${data.id}`);
    } catch (error) {
      console.error('Error generating game:', error);
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="bg-stars"></div>
      <div className="gradient-orb orb-1"></div>
      <div className="gradient-orb orb-2"></div>
      
      {/* Glowing logo */}
      <div className="pt-16 pb-8 flex justify-center">
        <div className="relative">
          <div className="absolute -inset-10 rounded-full bg-indigo-500 opacity-20 blur-xl"></div>
          <div className="relative bg-black/50 rounded-full p-6 border border-indigo-500/30 logo-glow">
            <Gamepad size={32} className="text-indigo-400" />
          </div>
        </div>
      </div>

      {/* Main headline with typewriter effect */}
      <div className="text-center mb-12 relative">
        <h1 className={`text-6xl font-bold mb-2 text-white inline-block ${isTyping ? 'typewriter' : 'text-glow'}`}>
          Idea to game in seconds.
        </h1>
        <p className="text-xl text-gray-400 mt-4 opacity-0 animate-[fadeIn_1s_ease-in_forwards_2s]">
          Your superhuman game development assistant.
        </p>
        <div className="absolute -z-10 top-1/2 left-1/2 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* Input container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="card bg-zinc-900/70 border-zinc-800 p-6 rounded-2xl glow-border transform transition-all hover:scale-[1.01]">
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your game idea..."
                className="input bg-zinc-950 border-zinc-800 mb-6 text-lg p-6 rounded-xl"
              />
              
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <button type="button" className="p-2 text-gray-400 hover:text-white transition-all duration-300 hover:scale-110">
                    <Share2 size={20} />
                  </button>
                  <button type="button" className="p-2 text-gray-400 hover:text-white transition-all duration-300 hover:scale-110">
                    <Download size={20} />
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center mr-2">
                    <Lock size={16} className="text-gray-400 mr-1" />
                    <span className="text-gray-400">Public</span>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || !prompt.trim()}
                    className={`btn btn-primary px-6 py-2 rounded-lg flex items-center ${
                      isLoading || !prompt.trim() 
                      ? 'opacity-50 cursor-not-allowed' 
                      : ''
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white spin-glow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </div>
                    ) : (
                      <>
                        <Sparkles size={16} className="mr-2 opacity-75" />
                        Create
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Category buttons */}
      <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto px-4 mb-12">
        <CategoryButton 
          icon={<Gamepad size={20} />} 
          name="RPG Adventure" 
          isSelected={selectedCategory === 'RPG Adventure'}
          onClick={() => setSelectedCategory('RPG Adventure')}
        />
        <CategoryButton 
          icon={<Target size={20} />} 
          name="Strategy" 
          isSelected={selectedCategory === 'Strategy'}
          onClick={() => setSelectedCategory('Strategy')}
        />
        <CategoryButton 
          icon={<PuzzleIcon size={20} />} 
          name="Puzzle Game" 
          isSelected={selectedCategory === 'Puzzle Game'}
          onClick={() => setSelectedCategory('Puzzle Game')}
        />
        <CategoryButton 
          icon={<Globe size={20} />} 
          name="Open World" 
          isSelected={selectedCategory === 'Open World'}
          onClick={() => setSelectedCategory('Open World')}
        />
      </div>

      {/* Examples section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-center mb-3 text-blue-100 text-glow">Try one of these examples</h2>
        <p className="text-center text-blue-200 mb-8">Click on any example to use it as your starting point</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {examplePrompts.map((example, index) => (
            <button
              key={index}
              onClick={() => setPrompt(example.prompt)}
              className="example-card card group hover:bg-white/10 hover:border-white/20 transition-all"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="text-4xl transform group-hover:scale-110 transition-transform duration-300">
                  {example.icon}
                </div>
                <h3 className="text-xl font-semibold text-blue-100">{example.title}</h3>
              </div>
              <p className="text-blue-200 line-clamp-2">
                {example.prompt}
              </p>
              <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 w-0 group-hover:w-full transition-all duration-500"></div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-blue-300/70">
        <p className="relative inline-block">
          <span className="relative z-10">Powered by Next.js, Three.js and AI</span>
          <span className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 blur-sm -z-10"></span>
        </p>
      </footer>
    </div>
  );
}

function CategoryButton({ icon, name, isSelected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`category-btn flex items-center space-x-2 py-2 px-4 rounded-full border transition-all duration-300 ${
        isSelected 
          ? 'category-btn-selected' 
          : 'bg-zinc-900/80 border-zinc-800 hover:bg-zinc-800/80'
      }`}
    >
      <span className={`transition-transform duration-300 ${isSelected ? 'scale-110' : ''}`}>
        {icon}
      </span>
      <span>{name}</span>
    </button>
  );
}