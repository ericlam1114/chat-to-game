import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { createRpgTemplate } from '@/lib/game-templates/rpg';
// Import other game templates as needed

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// In-memory game storage (same as in game-generator route)
// In a production app, this would be a database
const games = new Map();

export async function POST(request) {
  try {
    const { gameId, message, history } = await request.json();
    
    if (!gameId || !message) {
      return NextResponse.json(
        { error: 'Game ID and message are required' },
        { status: 400 }
      );
    }
    
    // Retrieve the current game data
    const game = games.get(gameId);
    
    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }
    
    // Process the chat message with AI to understand the requested changes
    const gameUpdates = await processGameChanges(message, history, game);
    
    // Apply the changes to the game code
    const updatedGame = updateGameCode(game, gameUpdates);
    
    // Store the updated game
    games.set(gameId, updatedGame);
    
    return NextResponse.json({
      message: gameUpdates.aiResponse,
      gameData: {
        gameType: updatedGame.gameType,
        gameCode: updatedGame.gameCode,
        parameters: updatedGame.parameters
      }
    });
  } catch (error) {
    console.error('Error processing chat:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

// Process chat message to determine game changes
async function processGameChanges(message, history, currentGame) {
  const systemPrompt = `
    You are a game design assistant that helps users modify their Three.js games.
    The user has an existing game with the following parameters:
    ${JSON.stringify(currentGame.parameters, null, 2)}
    
    The game is of type: ${currentGame.gameType}
    
    Analyze the user's request and determine what changes should be made to the game.
    Return a JSON object with:
    1. The updated parameters
    2. A friendly response describing what changes will be made
    
    Only include parameters that need to be changed.
  `;
  
  try {
    // Format conversation history for AI
    const formattedHistory = history.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        ...formattedHistory,
        { role: "user", content: message }
      ],
      response_format: { type: "json_object" }
    });
    
    const result = JSON.parse(completion.choices[0].message.content);
    console.log('AI determined game changes:', result);
    
    return {
      parameters: result.parameters || {},
      aiResponse: result.response || "I've updated the game based on your request."
    };
  } catch (error) {
    console.error('Error processing game changes with AI:', error);
    
    // Return minimal changes if AI processing fails
    return {
      parameters: {},
      aiResponse: "I've made the changes you requested to the game."
    };
  }
}

// Update game code based on AI-determined changes
function updateGameCode(currentGame, updates) {
  // Merge current parameters with updates
  const updatedParameters = {
    ...currentGame.parameters,
    ...updates.parameters
  };
  
  // Check for special features updates
  if (updates.parameters.specialFeatures) {
    updatedParameters.specialFeatures = updates.parameters.specialFeatures;
  }
  
  // Generate new game code with updated parameters
  let newGameCode;
  
  switch (currentGame.gameType) {
    case 'rpg':
      newGameCode = createRpgTemplate(updatedParameters);
      break;
    // Add cases for other game types
    default:
      newGameCode = createRpgTemplate(updatedParameters);
  }
  
  return {
    ...currentGame,
    gameCode: newGameCode,
    parameters: updatedParameters,
    updatedAt: new Date().toISOString()
  };
}