// src/app/lib/game-engine/components/environment/ground.js
import { registry } from '../../component-registry';

const groundComponent = {
  name: 'ground',
  priority: 2,
  dependencies: ['base'],
  generate: (config = {}) => {
    const size = config.size || 100;
    const color = config.color || '0x7CFC00';
    
    return `
// Add ground
const groundGeometry = new THREE.PlaneGeometry(${size}, ${size});
const groundMaterial = new THREE.MeshStandardMaterial({ 
  color: ${color},
  roughness: 0.8,
  metalness: 0.2
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.5;
ground.receiveShadow = true;
scene.add(ground);
`;
  }
};

registry.register('ground', groundComponent);

export default groundComponent;