// src/app/api/game-generator/route.js
import { NextResponse } from 'next/server';
import { GameBuilder } from '../../lib/game-engine/game-builder';

// Import all components
import '../../lib/game-engine/components/';

// Ensure the global games Map exists
if (!global.games) {
  global.games = new Map();
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { prompt } = body;
    
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Invalid prompt' },
        { status: 400 }
      );
    }
    
    // Determine game type from prompt
    const gameType = determineGameType(prompt);
    
    // Create game based on template
    const builder = new GameBuilder();
    const templateComponents = loadTemplate(gameType);
    
    templateComponents.forEach(component => {
      builder.addComponent(component.name, component.config);
    });
    
    // Generate game code
    const gameCode = builder.build();
    const components = builder.getComponentList();
    
    // Generate unique ID
    const gameId = Math.random().toString(36).substring(2, 15);
    
    // Store game data
    const gameData = {
      id: gameId,
      prompt,
      gameType: gameType.charAt(0).toUpperCase() + gameType.slice(1),
      gameCode,
      components,
      createdAt: new Date().toISOString()
    };
    
    global.games.set(gameId, gameData);
    
    console.log(`Created ${gameType} game with ID: ${gameId}`);
    
    return NextResponse.json({ id: gameId });
  } catch (error) {
    console.error('Error generating game:', error);
    return NextResponse.json(
      { error: 'Failed to generate game' },
      { status: 500 }
    );
  }
}

function determineGameType(prompt) {
  const promptLower = prompt.toLowerCase();
  
  if (promptLower.includes('rpg') || 
      promptLower.includes('adventure') || 
      promptLower.includes('explore')) {
    return 'rpg';
  }
  
  if (promptLower.includes('shoot') || 
      promptLower.includes('fps') || 
      promptLower.includes('space')) {
    return 'shooter';
  }
  
  if (promptLower.includes('race') || 
      promptLower.includes('car') || 
      promptLower.includes('driving')) {
    return 'racing';
  }
  
  // Default to RPG
  return 'rpg';
}

function loadTemplate(templateName) {
    switch (templateName) {
      case 'rpg':
        return [
          { name: 'base', config: { position: [0, 5, 10] } },
          { name: 'lighting', config: {} },
          { name: 'sky', config: { color: '0x87CEEB' } },
          { name: 'ground', config: { size: 100, color: '0x7CFC00' } },
          { name: 'trees', config: { count: 10 } },
          { name: 'player', config: { speed: 0.1 } },
          { name: 'npcs', config: { count: 5 } }
        ];
      
      case 'shooter':
        return [
          { name: 'base', config: { position: [0, 0, 10] } },
          { name: 'lighting', config: {} },
          { name: 'sky', config: { color: '0x000020' } },
          { name: 'player', config: { type: 'spaceship', speed: 0.2 } },
          { name: 'enemies', config: { count: 10, type: 'basic' } }
        ];
        
      case 'racing':
        return [
          { name: 'base', config: { position: [0, 5, 10] } },
          { name: 'lighting', config: {} },
          { name: 'sky', config: { color: '0x87CEEB' } },
          { name: 'ground', config: { size: 200, color: '0x7CFC00' } },
          { name: 'raceTrack', config: {} },
          { name: 'vehicle', config: { type: 'car', maxSpeed: 0.3 } }
        ];
        
      default:
        return [
          { name: 'base', config: {} },
          { name: 'lighting', config: {} },
          { name: 'ground', config: {} },
          { name: 'player', config: {} }
        ];
    }
  }