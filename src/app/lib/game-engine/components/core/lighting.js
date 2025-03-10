// src/app/lib/game-engine/components/core/lighting.js
import { registry } from '../../component-registry';

const lightingComponent = {
  name: 'lighting',
  priority: 2, // Load early
  dependencies: ['base'],
  generate: (config = {}) => {
    const intensity = config.intensity || 0.5;
    const directionalIntensity = config.directionalIntensity || 0.8;
    const shadows = config.shadows !== false; // Enable shadows by default
    
    return `
// Add lighting to the scene
const ambientLight = new THREE.AmbientLight(0x404040, ${intensity});
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, ${directionalIntensity});
directionalLight.position.set(${config.lightX || 10}, ${config.lightY || 20}, ${config.lightZ || 10});
${shadows ? `
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -25;
directionalLight.shadow.camera.right = 25;
directionalLight.shadow.camera.top = 25;
directionalLight.shadow.camera.bottom = -25;

// Enable shadows in the renderer
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
` : ''}
scene.add(directionalLight);
`;
  }
};

registry.register('lighting', lightingComponent);

export default lightingComponent;