// src/app/lib/game-engine/character-manager.js
import { registry } from './component-registry';
import { gameState } from './GameState';

/**
 * Character Manager with Round-Robin Support and Preview Integration
 * 
 * Handles the swapping of main characters in the game using a state-based approach.
 */
export class CharacterManager {
  constructor() {
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
    };
    
    // Define the available character types for round-robin swapping
    this.availableTypes = Object.keys(this.characterConfig);
    
    // Current index in the round-robin cycle
    this.currentTypeIndex = 0;
  }
  
  /**
   * Get character configuration for a given type
   */
  getCharacterConfig(type) {
    return this.characterConfig[type] || null;
  }
  
  /**
   * Get the next character type in the cycle
   */
  getNextCharacterType() {
    this.currentTypeIndex = (this.currentTypeIndex + 1) % this.availableTypes.length;
    return this.availableTypes[this.currentTypeIndex];
  }
  
  /**
   * Get the previous character type in the cycle
   */
  getPrevCharacterType() {
    this.currentTypeIndex = (this.currentTypeIndex - 1 + this.availableTypes.length) % this.availableTypes.length;
    return this.availableTypes[this.currentTypeIndex];
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
  
  // Function to swap the current character with a new type
  // Function to swap the current character with a new type
window.swapCharacter = function(newType, config = {}) {
    console.log(`Swapping character to: ${newType}`);
    
    // Reset all global character variables
    window.character = null;
    window.vehicle = null;
    window.airplane = null;
    window.wizardChar = null;
    
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
    
    // Update the game preview by regenerating the game code
    if (window.updateGamePreview) {
      const updatedGameCode = characterManager.generateGameCode(newType, mergedConfig);
      window.updateGamePreview(updatedGameCode);
    }
    
    // Trigger character swap event to completely refresh the renderer
    window.dispatchEvent(new Event("characterSwapped"));
    
    console.log(`Character swap event dispatched for: ${newType}`);
    return true;
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