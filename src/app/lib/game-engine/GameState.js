// src/app/lib/game-engine/GameState.js
export class GameState {
    constructor() {
      this.currentCharacterType = 'player';
      this.characterConfig = {};
      this.listeners = [];
    }
    
    // Method to change character
    setCharacterType(type, config = {}) {
      this.currentCharacterType = type;
      this.characterConfig = config;
      // Notify listeners of character change
      this.notifyListeners();
    }
    
    // Add a listener for state changes
    addListener(callback) {
      this.listeners.push(callback);
      return () => {
        const index = this.listeners.indexOf(callback);
        if (index >= 0) this.listeners.splice(index, 1);
      };
    }
    
    // Notify all listeners of state change
    notifyListeners() {
      this.listeners.forEach(callback => callback(this));
    }
  }
  
  // Create a singleton
  export const gameState = new GameState();