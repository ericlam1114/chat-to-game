// src/app/lib/game-engine/components/core/base.js
import { registry } from '../../component-registry';

const baseComponent = {
  name: 'base',
  priority: 1, // Load first
  generate: (config = {}) => {
    const cameraPosition = config.position || [0, 5, 10];
    
    return `
// Game initialization
renderer = initRenderer();
scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(${cameraPosition[0]}, ${cameraPosition[1]}, ${cameraPosition[2]});

// Game state
const keys = {};
document.addEventListener('keydown', (e) => { 
  keys[e.code] = true; 
  if (e.code === 'Space') keys[' '] = true;
  if (e.key) keys[e.key.toLowerCase()] = true;
});
document.addEventListener('keyup', (e) => { 
  keys[e.code] = false;
  if (e.code === 'Space') keys[' '] = false;
  if (e.key) keys[e.key.toLowerCase()] = false;
});

// Game clock
const clock = new THREE.Clock();

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
`;
  }
};

registry.register('base', baseComponent);

export default baseComponent;