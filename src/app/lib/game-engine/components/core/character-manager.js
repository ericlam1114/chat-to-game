// src/app/lib/game-engine/character-manager.js
import { registry } from './component-registry';

/**
 * Character Manager
 * 
 * Handles the swapping of main characters in the game.
 * This is implemented as a separate module to avoid modifying the registry.
 */
export class CharacterManager {
  constructor() {
    this.activeCharacter = null;
    this.activeCharacterType = null;
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
    
    return character;
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
      case 'plane':
        const airplaneComponent = registry.get('airplane');
        if (airplaneComponent) {
          eval(airplaneComponent.generate(config).code);
          newCharacter = window.airplane || null; // Assuming the code exposes 'airplane'
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
  
  // Setup key listener for character swapping
  document.addEventListener('keydown', (e) => {
    // Character swap hotkeys
    if (e.key === '1') window.swapCharacter('player');
    if (e.key === '2') window.swapCharacter('vehicle');
    if (e.key === '3') window.swapCharacter('airplane');
  });
  
  console.log('Character swapping system initialized');
  
  // Initialize with default character (player)
  window.swapCharacter('player');
}