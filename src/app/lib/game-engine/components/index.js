// src/app/lib/game-engine/components/index.js
// This file imports and registers all available components

// Import core components
import './core/base';
import './core/lighting';

// Import environment components
import './environment/ground';
import './environment/sky';
import './environment/water';
import './environment/trees';

// Import character components
import './characters/player';
import './characters/vehicle';
import './characters/airplane';

// Import gameplay components
import './gameplay/collectibles';
import './gameplay/enemies';

// Note: Just importing these files will register them with the registry
// due to the registry.register() calls in each component file

console.log('All game components loaded and registered');