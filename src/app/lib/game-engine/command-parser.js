// src/app/lib/game-engine/command-parser.js
export function parseGameCommand(message) {
    const messageLower = message.toLowerCase();
    let command = { type: 'unknown' };
    
    // Add component commands
    if (messageLower.match(/add (a |an |some )?tree/)) {
      command = { 
        type: 'add', 
        component: 'tree', 
        config: extractTreeConfig(messageLower)
      };
    }
    else if (messageLower.match(/add (a |an |some )?water/)) {
      command = { 
        type: 'add', 
        component: 'water', 
        config: extractWaterConfig(messageLower)
      };
    }
    else if (messageLower.match(/add (a |an |some )?(car|vehicle)/)) {
      command = { 
        type: 'add', 
        component: 'vehicle', 
        config: extractVehicleConfig(messageLower)
      };
    }
    else if (messageLower.match(/add (a |an |some )?plane/)) {
      command = { 
        type: 'add', 
        component: 'vehicle', 
        config: { type: 'airplane', ...extractVehicleConfig(messageLower) }
      };
    }
    else if (messageLower.match(/add (a |an |some )?(enemy|enemies)/)) {
      command = { 
        type: 'add', 
        component: 'enemies', 
        config: extractEnemyConfig(messageLower)
      };
    }
    
    // Change component commands
    else if (messageLower.match(/change (the )?(sky|sky color)/)) {
      command = { 
        type: 'update', 
        component: 'sky', 
        config: extractColorConfig(messageLower)
      };
    }
    else if (messageLower.match(/change (the )?(ground|terrain|ground color)/)) {
      command = { 
        type: 'update', 
        component: 'ground', 
        config: extractColorConfig(messageLower)
      };
    }
    
    // Template commands
    else if (messageLower.includes('make it an rpg')) {
      command = { type: 'template', template: 'rpg' };
    }
    else if (messageLower.includes('make it a shooter')) {
      command = { type: 'template', template: 'shooter' };
    }
    else if (messageLower.includes('make it a racing game')) {
      command = { type: 'template', template: 'racing' };
    }
    
    return command;
  }
  
  // Helper functions to extract configuration options
  function extractColorConfig(message) {
    const colors = {
      'red': '0xff0000',
      'green': '0x00ff00',
      'blue': '0x0000ff',
      'yellow': '0xffff00',
      'purple': '0xff00ff',
      'cyan': '0x00ffff',
      'orange': '0xff8800',
      'pink': '0xff88ff',
      'black': '0x000000',
      'white': '0xffffff',
      'gray': '0x888888'
    };
    
    // Check for color mentions
    for (const [colorName, colorValue] of Object.entries(colors)) {
      if (message.includes(colorName)) {
        return { color: colorValue };
      }
    }
    
    return {};
  }
  
  function extractTreeConfig(message) {
    const config = {};
    
    // Check for count
    const countMatch = message.match(/(\d+) trees?/);
    if (countMatch) {
      config.count = parseInt(countMatch[1]);
    }
    
    // Check for position
    if (message.includes('on the left')) {
      config.x = -20;
    } else if (message.includes('on the right')) {
      config.x = 20;
    }
    
    return config;
  }
  
  function extractWaterConfig(message) {
    const config = {};
    
    // Check for size
    if (message.includes('lake')) {
      config.size = 30;
    } else if (message.includes('pond')) {
      config.size = 15;
    } else if (message.includes('ocean')) {
      config.size = 100;
    }
    
    return Object.assign(config, extractColorConfig(message));
  }
  
  function extractVehicleConfig(message) {
    const config = {};
    
    // Check for vehicle type
    if (message.includes('fast')) {
      config.maxSpeed = 0.5;
      config.acceleration = 0.01;
    }
    
    return Object.assign(config, extractColorConfig(message));
  }
  
  function extractEnemyConfig(message) {
    const config = {};
    
    // Check for enemy count
    const countMatch = message.match(/(\d+) enem(y|ies)/);
    if (countMatch) {
      config.count = parseInt(countMatch[1]);
    }
    
    // Check for enemy type
    if (message.includes('flying')) {
      config.type = 'flying';
    }
    
    return config;
  }