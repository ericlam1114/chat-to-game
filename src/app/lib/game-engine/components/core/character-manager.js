// src/app/lib/game-engine/character-manager.js
// Update the character manager to support round-robin swapping

import { registry } from './component-registry';

/**
 * Character Manager with Round-Robin Support
 * 
 * Handles the swapping of main characters in the game.
 * Now includes functionality to cycle through available character types.
 */
export class CharacterManager {
  constructor() {
    this.activeCharacter = null;
    this.activeCharacterType = null;
    
    // Define the available character types for round-robin swapping
    this.availableTypes = [
      'player',
      'vehicle',
      'stylizedAirplane', // Using stylized plane instead of regular airplane
      // Add any other character types here
    ];
    
    // Current index in the round-robin cycle
    this.currentTypeIndex = 0;
  }
  
  /**
   * Removes the currently active character from the scene
   */
  removeActiveCharacter() {
    if (this.activeCharacter) {
      // Remove from scene
      if (window.scene) {
        scene.remove(this.activeCharacter);
      }
      
      // Clean up any associated lights or objects
      if (this.activeCharacter.userData && this.activeCharacter.userData.lights) {
        this.activeCharacter.userData.lights.forEach(light => {
          if (light) scene.remove(light);
        });
      }
      
      // Clean up CSS3D object if this is a stylized airplane
      if (this.activeCharacter.userData && this.activeCharacter.userData.css3dObject) {
        if (window.css3dScene) {
          css3dScene.remove(this.activeCharacter.userData.css3dObject);
        }
      }
      
      // Clean up any event listeners or ongoing animations
      if (this.activeCharacter.userData && this.activeCharacter.userData.cleanup) {
        this.activeCharacter.userData.cleanup();
      }
      
      this.activeCharacter = null;
      this.activeCharacterType = null;
      
      return true;
    }
    
    return false;
  }
  
  /**
   * Get the current reference to the active character
   */
  getActiveCharacter() {
    return this.activeCharacter;
  }
  
  /**
   * Get the type of the current active character
   */
  getActiveCharacterType() {
    return this.activeCharacterType;
  }
  
  /**
   * Set the active character
   */
  setActiveCharacter(character, type) {
    // Remove existing character first
    this.removeActiveCharacter();
    
    // Set the new character
    this.activeCharacter = character;
    this.activeCharacterType = type;
    
    // Update the current type index
    const typeIndex = this.availableTypes.indexOf(type);
    if (typeIndex >= 0) {
      this.currentTypeIndex = typeIndex;
    }
    
    return character;
  }
  
  /**
   * Get the next character type in the cycle
   */
  getNextCharacterType() {
    // Increment the index and wrap around if needed
    this.currentTypeIndex = (this.currentTypeIndex + 1) % this.availableTypes.length;
    return this.availableTypes[this.currentTypeIndex];
  }
  
  /**
   * Get the previous character type in the cycle
   */
  getPrevCharacterType() {
    // Decrement the index and wrap around if needed
    this.currentTypeIndex = (this.currentTypeIndex - 1 + this.availableTypes.length) % this.availableTypes.length;
    return this.availableTypes[this.currentTypeIndex];
  }
}

// Create a singleton instance
export const characterManager = new CharacterManager();

/**
 * Initialize character swapping functionality
 * Call this function once after the game engine is initialized
 */
export function initCharacterSwapping() {
  // Create global references for use in components
  window.gameState = window.gameState || {};
  
  // Function to remove the current active character if it exists
  window.removeActiveCharacter = function() {
    return characterManager.removeActiveCharacter();
  };
  
  // Function to swap the current character with a new type
  window.swapCharacter = function(newType, config = {}) {
    console.log(`Swapping character to: ${newType}`);
    
    // Remove existing character
    window.removeActiveCharacter();
    
    // Get current camera position to maintain continuity
    const currentPosition = new THREE.Vector3();
    if (window.camera) {
      currentPosition.copy(camera.position);
    }
    
    // Update character type in game state
    window.gameState.activeCharacterType = newType;
    
    // Create new character based on type
    let newCharacter = null;
    
    switch(newType) {
      case 'player':
        // We need to execute the code that creates the character
        // The code from the component will add the character to the scene
        const playerComponent = registry.get('player');
        if (playerComponent) {
          eval(playerComponent.generate(config).code);
          newCharacter = window.character || null; // Assuming the code exposes 'character'
        }
        break;
        
      case 'vehicle':
      case 'car':
        const vehicleComponent = registry.get('vehicle');
        if (vehicleComponent) {
          eval(vehicleComponent.generate(config).code);
          newCharacter = window.vehicle || null; // Assuming the code exposes 'vehicle'
        }
        break;
        
      case 'airplane':
        // Use regular airplane
        const airplaneComponent = registry.get('airplane');
        if (airplaneComponent) {
          eval(airplaneComponent.generate(config).code);
          newCharacter = window.airplane || null;
        }
        break;
        
      case 'stylizedAirplane':
      case 'stylizedPlane':
      case 'cssPlane':
        // Use the stylized airplane
        const cssPlaneComponent = registry.get('stylizedAirplane');
        if (cssPlaneComponent) {
          eval(cssPlaneComponent.generate(config).code);
          newCharacter = window.airplane || null;
        } else {
          console.warn('Stylized airplane component not found, falling back to regular airplane');
          const regularPlaneComponent = registry.get('airplane');
          if (regularPlaneComponent) {
            eval(regularPlaneComponent.generate(config).code);
            newCharacter = window.airplane || null;
          }
        }
        break;
        
      default:
        console.error(`Unknown character type: ${newType}`);
        break;
    }
    
    // Store the reference
    if (newCharacter) {
      characterManager.setActiveCharacter(newCharacter, newType);
      window.gameState.activeCharacter = newCharacter;
    }
    
    // Return to previous camera position if needed
    if (config.preserveCameraPosition && window.camera) {
      camera.position.copy(currentPosition);
    }
    
    console.log(`Character swapped to ${newType}`);
    return newCharacter;
  };
  
  // Function to cycle to the next character in the round-robin
  window.nextCharacter = function(config = {}) {
    const nextType = characterManager.getNextCharacterType();
    return window.swapCharacter(nextType, config);
  };
  
  // Function to cycle to the previous character in the round-robin
  window.prevCharacter = function(config = {}) {
    const prevType = characterManager.getPrevCharacterType();
    return window.swapCharacter(prevType, config);
  };
  
  // Setup key listener for character swapping
  document.addEventListener('keydown', (e) => {
    // Character swap hotkeys
    if (e.key === '1') window.swapCharacter('player');
    if (e.key === '2') window.swapCharacter('vehicle');
    if (e.key === '3') window.swapCharacter('airplane');
    if (e.key === '4') window.swapCharacter('stylizedAirplane');
    
    // Round-robin cycling
    if (e.key === 'Tab') {
      // Shift+Tab cycles backward, Tab cycles forward
      if (e.shiftKey) {
        window.prevCharacter();
      } else {
        window.nextCharacter();
      }
      e.preventDefault(); // Prevent tab from changing focus
    }
  });
  
  console.log('Character swapping system initialized with round-robin support');
  
  // Initialize with the first character type
  window.swapCharacter(characterManager.availableTypes[0]);
}