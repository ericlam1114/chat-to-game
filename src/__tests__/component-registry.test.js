// src/__tests__/component-registry.test.js
import { ComponentRegistry } from '../app/lib/game-engine/component-registry';

describe('Component Registry', () => {
  test('registers and retrieves components', () => {
    const registry = new ComponentRegistry();
    const mockComponent = { name: 'test', generate: () => 'test code' };
    
    registry.register('test', mockComponent);
    
    expect(registry.get('test')).toBe(mockComponent);
  });
  
  test('returns all registered components', () => {
    const registry = new ComponentRegistry();
    const mockComponent1 = { name: 'test1', generate: () => 'test code 1' };
    const mockComponent2 = { name: 'test2', generate: () => 'test code 2' };
    
    registry.register('test1', mockComponent1);
    registry.register('test2', mockComponent2);
    
    const allComponents = registry.getAll();
    expect(Object.keys(allComponents).length).toBe(2);
    expect(allComponents.test1).toBe(mockComponent1);
    expect(allComponents.test2).toBe(mockComponent2);
  });
});