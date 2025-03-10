// src/app/lib/game-engine/components/environment/water.js
import { registry } from '../../component-registry';

const waterComponent = {
  name: 'water',
  priority: 3,
  dependencies: ['base', 'lighting'],
  modifiesAnimation: true,
  generate: (config = {}) => {
    const size = config.size || 50;
    const depth = config.depth || 'shallow'; // 'shallow', 'deep'
    const color = config.color || (depth === 'deep' ? '0x0077BE' : '0x4AC7FF');
    const animated = config.animated !== false;
    
    return {
      code: `
// Add water surface
const waterGeometry = new THREE.PlaneGeometry(${size}, ${size}, ${animated ? '16' : '1'}, ${animated ? '16' : '1'});
const waterMaterial = new THREE.MeshStandardMaterial({
  color: ${color},
  transparent: true,
  opacity: 0.8,
  roughness: 0.1,
  metalness: 0.6
});

const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.rotation.x = -Math.PI / 2;
water.position.y = 0.05; // Slightly above ground to avoid z-fighting
${depth === 'deep' ? `
// For deep water, add underwater effect
const waterDepthGeometry = new THREE.BoxGeometry(${size}, ${config.waterHeight || 5}, ${size});
const waterDepthMaterial = new THREE.MeshStandardMaterial({
  color: ${color},
  transparent: true,
  opacity: 0.4,
  roughness: 0,
  metalness: 0.8
});

const waterDepth = new THREE.Mesh(waterDepthGeometry, waterDepthMaterial);
waterDepth.position.y = -${(config.waterHeight || 5) / 2};
scene.add(waterDepth);
` : ''}

// Add water to scene
scene.add(water);
      `,
      animationCode: animated ? `
// Animate water waves
const waterVertices = water.geometry.attributes.position.array;
const waterTime = clock.getElapsedTime() * ${config.waveSpeed || 0.5};

for (let i = 0; i < waterVertices.length; i += 3) {
  const x = waterVertices[i];
  const z = waterVertices[i + 2];
  
  // Create gentle wave effect
  waterVertices[i + 1] = Math.sin(x * 0.05 + waterTime) * 0.2 + 
                          Math.cos(z * 0.05 + waterTime) * 0.2;
}

water.geometry.attributes.position.needsUpdate = true;
` : ''
    };
  }
};

registry.register('water', waterComponent);

export default waterComponent;