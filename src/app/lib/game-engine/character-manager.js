// src/app/lib/game-engine/character-manager.js
import { registry } from './component-registry';

/**
 * Character Manager with Round-Robin Support and Preview Integration
 * 
 * Handles the swapping of main characters in the game.
 * Now includes functionality to cycle through available character types
 * and update the game preview.
 */

export class CharacterManager {
  constructor() {
    this.activeCharacter = null;
    this.activeCharacterType = null;
    
    // Character configuration mapping
    this.characterConfig = {
      'player': {
        componentId: 'player',
        globalVar: 'character',
        defaultConfig: {}
      },
      'vehicle': {
        componentId: 'vehicle',
        globalVar: 'vehicle',
        defaultConfig: {}
      },
      'wizard': {
        componentId: 'wizard',
        globalVar: 'wizardChar',
        defaultConfig: {}
      },
      'airplane': {
        componentId: 'airplane',
        globalVar: 'airplane',
        defaultConfig: {}
      },
      'stylizedAirplane': {
        componentId: 'stylizedAirplane',
        globalVar: 'airplane',
        defaultConfig: {},
        fallback: 'airplane'
      }
      // Add any other character types here
    };
    
    // Define the available character types for round-robin swapping
    // (Using Object.keys ensures we stay in sync with characterConfig)
    this.availableTypes = Object.keys(this.characterConfig);
    
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
  
  /**
   * Get character configuration for a given type
   */
  getCharacterConfig(type) {
    return this.characterConfig[type] || null;
  }
  
  /**
   * Generate updated game code for preview
   */
  generateGameCode(characterType, config = {}) {
    // Get the character configuration
    const charConfig = this.getCharacterConfig(characterType);
    if (!charConfig) return null;
    
    // Merge default config with provided config
    const mergedConfig = { ...charConfig.defaultConfig, ...config };
    
    // Get the component
    let component = registry.get(charConfig.componentId);
    
    // Try fallback if component not found
    if (!component && charConfig.fallback) {
      const fallbackConfig = this.getCharacterConfig(charConfig.fallback);
      if (fallbackConfig) {
        component = registry.get(fallbackConfig.componentId);
      }
    }
    
    if (!component) return null;
    
    // Generate character code
    const generated = component.generate(mergedConfig);
    const characterCode = generated.code || '';
    const animationCode = generated.animationCode || '';
    
    // Create a complete game code with scene setup and the character code
    return `
// Game initialization
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera(
  75, 
  container.clientWidth / container.clientHeight, 
  0.1, 
  1000
);
camera.position.set(0, 5, 10);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Ground
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshStandardMaterial({ 
  color: 0x7CFC00,
  roughness: 0.8,
  metalness: 0.2
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Setup keyboard tracking for movement
const keys = {};
document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
});
document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

// Add character
${characterCode}

// Animation loop
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  
  const delta = clock.getDelta();
  
  // Update controls if available
  if (window.controls) {
    controls.update();
  }
  
  // Character animation code
  ${animationCode}
  
  // Render
  renderer.render(scene, camera);
}

// Start animation
animate();
    `;
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
    
    // Get character configuration
    const charConfig = characterManager.getCharacterConfig(newType);
    if (!charConfig) {
      console.error(`Unknown character type: ${newType}`);
      return null;
    }
    
    // Merge default config with provided config
    const mergedConfig = { ...charConfig.defaultConfig, ...config };
    
    // Get the component
    let component = registry.get(charConfig.componentId);
    
    // Try fallback if component not found
    if (!component && charConfig.fallback) {
      console.warn(`Component ${charConfig.componentId} not found, using fallback ${charConfig.fallback}`);
      const fallbackConfig = characterManager.getCharacterConfig(charConfig.fallback);
      if (fallbackConfig) {
        component = registry.get(fallbackConfig.componentId);
      }
    }
    
    if (!component) {
      console.error(`Component for character type ${newType} not found`);
      return null;
    }
    
    // Create new character
    eval(component.generate(mergedConfig).code);
    const newCharacter = window[charConfig.globalVar] || null;
    
    // Store the reference
    if (newCharacter) {
      characterManager.setActiveCharacter(newCharacter, newType);
      window.gameState.activeCharacter = newCharacter;
    }
    
    // Return to previous camera position if needed
    if (config.preserveCameraPosition && window.camera) {
      camera.position.copy(currentPosition);
    }
    
    // Update the game preview by regenerating the game code and notifying the UI
    if (window.updateGamePreview) {
      // Regenerate game code to include the new character
      const updatedGameCode = characterManager.generateGameCode(newType, mergedConfig);
      window.updateGamePreview(updatedGameCode);
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
    // Character swap hotkeys (using the indices to match available types)
    const availableTypes = characterManager.availableTypes;
    const keyNumber = parseInt(e.key);
    if (!isNaN(keyNumber) && keyNumber >= 1 && keyNumber <= availableTypes.length) {
      const typeIndex = keyNumber - 1;
      window.swapCharacter(availableTypes[typeIndex]);
    }
    
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
// Make character manager available globally
window.characterManager = characterManager;
export default characterManager;