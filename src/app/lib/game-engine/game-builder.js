// src/app/lib/game-engine/game-builder.js
import { registry } from './component-registry';

export class GameBuilder {
  constructor() {
    this.components = [];
    this.gameState = {
      hasPlayer: false,
      hasGround: false,
      activeAnimationFunctions: []
    };
  }

  addComponent(name, config = {}) {
    const component = registry.get(name);
    if (!component) {
      console.warn(`Component '${name}' not found`);
      return this;
    }
    
    // Check if we already have this component type
    const existingIndex = this.components.findIndex(c => c.name === name);
    if (existingIndex >= 0) {
      // Replace the existing component with the new one
      this.components[existingIndex] = {
        name,
        config,
        generate: component.generate,
        dependencies: component.dependencies || [],
        conflicts: component.conflicts || [],
        modifiesAnimation: !!component.modifiesAnimation,
        priority: component.priority || 5
      };
    } else {
      // Add as a new component
      this.components.push({
        name,
        config,
        generate: component.generate,
        dependencies: component.dependencies || [],
        conflicts: component.conflicts || [],
        modifiesAnimation: !!component.modifiesAnimation,
        priority: component.priority || 5
      });
    }
    
    // Update game state
    if (name === 'player' || name === 'vehicle') {
      this.gameState.hasPlayer = true;
    }
    if (name === 'ground' || name === 'terrain') {
      this.gameState.hasGround = true;
    }
    
    return this;
  }

  build() {
    // Check for missing dependencies
    this.components.forEach(component => {
      component.dependencies.forEach(dep => {
        if (!this.components.some(c => c.name === dep)) {
          // Add missing dependency
          this.addComponent(dep);
        }
      });
    });

    // Add required core components if missing
    if (!this.components.some(c => c.name === 'base')) {
      this.addComponent('base', { position: [0, 0, 10] });
    }
    if (!this.components.some(c => c.name === 'lighting')) {
      this.addComponent('lighting');
    }
    if (!this.gameState.hasGround) {
      this.addComponent('ground');
    }
    if (!this.gameState.hasPlayer) {
      this.addComponent('player');
    }

    // Sort components by priority for proper initialization order
    this.components.sort((a, b) => a.priority - b.priority);

    // Generate code
    let gameCode = '';
    
    // First gather all animation modifications
    let animationFunctions = [];
    
    // Add each component
    this.components.forEach(component => {
      const generated = component.generate(component.config, this.gameState);
      
      // Store animation function if component modifies it
      if (component.modifiesAnimation && generated.animationCode) {
        animationFunctions.push({
          name: component.name,
          code: generated.animationCode
        });
      }
      
      // Add component code
      gameCode += `\n\n// Component: ${component.name}\n`;
      gameCode += generated.code || generated;
    });
    
    // Build animation function with all modifications
    if (animationFunctions.length > 0) {
      gameCode += '\n\n// Combined animation loop\n';
      gameCode += 'const originalAnimate = animate;\n';
      gameCode += 'animate = function() {\n';
      
      // Add all component animation code
      animationFunctions.forEach(fn => {
        gameCode += `  // Animation from ${fn.name}\n`;
        gameCode += `  ${fn.code}\n\n`;
      });
      
      // Call original animate
      gameCode += '  originalAnimate();\n';
      gameCode += '};\n';
    }

    return gameCode;
  }
  
  getComponentList() {
    return this.components.map(c => ({
      name: c.name,
      config: c.config
    }));
  }
}