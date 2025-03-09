'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gamepad, Target, PuzzleIcon, Globe, Share2, Download, Lock } from 'lucide-react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('RPG Adventure');
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
    <div className="min-h-screen bg-black text-white">
      {/* Glowing logo */}
      <div className="pt-16 pb-8 flex justify-center">
        <div className="relative">
          <div className="absolute -inset-1 rounded-full bg-indigo-500 opacity-30 blur-md"></div>
          <div className="relative bg-black rounded-full p-6 border border-indigo-500/30">
            <Gamepad size={32} className="text-indigo-400" />
          </div>
        </div>
      </div>

      {/* Main headline */}
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold mb-2 text-white">
          Idea to game in seconds.
        </h1>
        <p className="text-xl text-gray-400">
          Your superhuman game development assistant.
        </p>
      </div>

      {/* Input container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="card bg-zinc-900/70 border-zinc-800 p-6 rounded-2xl">
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
                  <button type="button" className="p-2 text-gray-400 hover:text-white">
                    <Share2 size={20} />
                  </button>
                  <button type="button" className="p-2 text-gray-400 hover:text-white">
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
                    className={`btn btn-primary px-6 py-2 rounded-lg ${
                      isLoading || !prompt.trim() 
                      ? 'opacity-50 cursor-not-allowed' 
                      : ''
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </div>
                    ) : 'Create'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Category buttons */}
      <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto px-4">
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
        <h2 className="text-2xl font-bold text-center mb-3 text-blue-100">Try one of these examples</h2>
        <p className="text-center text-blue-200 mb-8">Click on any example to use it as your starting point</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {examplePrompts.map((example, index) => (
            <button
              key={index}
              onClick={() => setPrompt(example.prompt)}
              className="card group hover:bg-white/10 hover:border-white/20"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="text-4xl group-hover:scale-110 transition-transform duration-300">
                  {example.icon}
                </div>
                <h3 className="text-xl font-semibold text-blue-100">{example.title}</h3>
              </div>
              <p className="text-blue-200 line-clamp-2">
                {example.prompt}
              </p>
            </button>
          ))}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-blue-300/70">
        <p>Powered by Next.js, Three.js and AI</p>
      </footer>
      
      {/* Decorative elements */}
      <div className="fixed top-20 left-20 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl -z-10"></div>
      <div className="fixed bottom-10 right-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl -z-10"></div>
    </div>
  );
}

function CategoryButton({ icon, name, isSelected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 py-2 px-4 rounded-full border ${
        isSelected 
          ? 'bg-zinc-800 border-zinc-700' 
          : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'
      }`}
    >
      <span>{icon}</span>
      <span>{name}</span>
    </button>
  );
}