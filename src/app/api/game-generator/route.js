import { NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { createRpgTemplate } from '../../lib/game-templates/rpg';
// Import other game templates as needed

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// In-memory game storage (for MVP purposes)
// In a production app, you would use a database
const games = new Map();

export async function POST(request) {
  try {
    const { prompt } = await request.json();
    
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Invalid prompt' },
        { status: 400 }
      );
    }
    
    // Process the prompt with AI to determine game parameters
    const gameParams = await processPromptWithAI(prompt);
    
    // Generate game code based on the identified game type and parameters
    const gameData = generateGameCode(gameParams);
    
    // Store the game data
    const gameId = generateUniqueId();
    games.set(gameId, {
      ...gameData,
      prompt,
      createdAt: new Date().toISOString()
    });
    
    return NextResponse.json({ 
      id: gameId,
      gameType: gameData.gameType
    });
  } catch (error) {
    console.error('Error generating game:', error);
    return NextResponse.json(
      { error: 'Failed to generate game' },
      { status: 500 }
    );
  }
}

// Process the user prompt with AI to extract game parameters
async function processPromptWithAI(prompt) {
  const systemPrompt = `
    You are a game design assistant that helps translate user descriptions into game parameters.
    Extract key information from the user's game description to determine:
    1. Game type (rpg, platformer, shooter, etc.)
    2. Theme (medieval, space, modern, etc.)
    3. Key features (airplanes, magic, weapons, etc.)
    4. Visual elements (colors, environment features)
    
    Respond with a JSON object containing these parameters.
  `;
  
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    
    const result = JSON.parse(completion.choices[0].message.content);
    console.log('AI processed game parameters:', result);
    
    return result;
  } catch (error) {
    console.error('Error processing prompt with AI:', error);
    
    // Fallback to basic parameters if AI processing fails
    return {
      gameType: 'rpg',
      theme: 'medieval',
      features: [],
      environment: {
        skyColor: '87CEEB',
        groundColor: '7CFC00'
      }
    };
  }
}

// Generate Three.js game code based on parameters
function generateGameCode(params) {
  const gameType = params.gameType?.toLowerCase() || 'rpg';
  
  // Map special features from AI to template parameters
  const specialFeatures = [];
  
  if (params.features) {
    if (Array.isArray(params.features)) {
      specialFeatures.push(...params.features);
    } else if (typeof params.features === 'string') {
      specialFeatures.push(params.features);
    } else if (typeof params.features === 'object') {
      // If features is an object, extract keys with true values
      Object.entries(params.features).forEach(([key, value]) => {
        if (value === true) specialFeatures.push(key);
      });
    }
  }
  
  // Prepare template parameters
  const templateParams = {
    title: params.title || 'Game',
    theme: params.theme || 'medieval',
    specialFeatures: specialFeatures,
    
    // Environment settings
    skyColor: params.environment?.skyColor || '87CEEB',
    groundColor: params.environment?.groundColor || '7CFC00',
    hasTrees: params.environment?.trees !== false,
    hasMountains: params.environment?.mountains === true,
    hasWater: params.environment?.water !== false,
    
    // Other settings based on game type
    moveSpeed: params.character?.speed || 0.1,
    npcCount: params.npcs?.count || 5
  };
  
  // Select and apply the appropriate template
  let gameCode;
  
  switch (gameType) {
    case 'rpg':
      gameCode = createRpgTemplate(templateParams);
      break;
    // Add cases for other game types
    default:
      gameCode = createRpgTemplate(templateParams);
  }
  
  return {
    gameType,
    gameCode,
    parameters: templateParams
  };
}

// Generate a unique ID for the game
function generateUniqueId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// API route for fetching a specific game
export async function GET(request) {
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();
  
  if (!id) {
    return NextResponse.json(
      { error: 'Game ID is required' },
      { status: 400 }
    );
  }
  
  const game = games.get(id);
  
  if (!game) {
    return NextResponse.json(
      { error: 'Game not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(game);
}