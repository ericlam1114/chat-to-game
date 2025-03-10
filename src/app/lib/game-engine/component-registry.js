// src/app/lib/game-engine/component-registry.js
export class ComponentRegistry {
    constructor() {
      this.components = {};
    }
  
    register(name, component) {
      this.components[name] = component;
      return this;
    }
  
    get(name) {
      return this.components[name];
    }
  
    getAll() {
      return this.components;
    }
  }
  
  export const registry = new ComponentRegistry();