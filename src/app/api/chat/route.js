// src/app/api/chat/route.js
import { NextResponse } from 'next/server';
import { GameBuilder } from '../../lib/game-engine/game-builder';
import { parseGameCommand } from '../../lib/game-engine/command-parser';
import { registry } from '../../lib/game-engine/component-registry';

// Import all components
import '../../lib/game-engine/components';

// Ensure the global games Map exists
if (!global.games) {
  global.games = new Map();
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { gameId, message, history } = body;
    
    // Get existing game data
    const game = global.games.get(gameId);
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    // Parse command from message
    const command = parseGameCommand(message);
    
    // Create new game builder and load existing components
    const builder = new GameBuilder();
    
    // Add existing components from game state
    if (game.components) {
      game.components.forEach(component => {
        builder.addComponent(component.name, component.config);
      });
    }
    
    // Process command
    let responseMessage = "I'm not sure how to do that in the game. Try asking to add specific elements like trees, water, or enemies.";
    
    if (command.type === 'add') {
      // Add new component
      builder.addComponent(command.component, command.config);
      responseMessage = `I've added ${command.component} to your game!`;
    }
    else if (command.type === 'update') {
      // Find and update existing component
      const existingComponentIndex = game.components.findIndex(c => c.name === command.component);
      
      if (existingComponentIndex >= 0) {
        // Replace with updated component
        builder.components[existingComponentIndex] = {
          name: command.component,
          config: { ...game.components[existingComponentIndex].config, ...command.config }
        };
        
        responseMessage = `I've updated the ${command.component} in your game!`;
      } else {
        builder.addComponent(command.component, command.config);
        responseMessage = `I've added ${command.component} to your game with your requested settings!`;
      }
    }
    else if (command.type === 'template') {
      // Clear existing components and use template
      const templateComponents = loadTemplate(command.template);
      
      builder = new GameBuilder();
      templateComponents.forEach(component => {
        builder.addComponent(component.name, component.config);
      });
      
      responseMessage = `I've transformed your game into a ${command.template} game!`;
    }
    
    // Generate new game code
    const gameCode = builder.build();
    const components = builder.getComponentList();
    
    // Update game data
    const updatedGame = {
      ...game,
      gameCode,
      components
    };
    
    // Store updated game
    global.games.set(gameId, updatedGame);
    
    return NextResponse.json({
      message: responseMessage,
      gameData: updatedGame
    });
  } catch (error) {
    console.error('Error processing chat:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

// Helper to load predefined templates
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