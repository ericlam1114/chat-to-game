// src/app/lib/game-engine/components/environment/sky.js
import { registry } from '../../component-registry';

const skyComponent = {
  name: 'sky',
  priority: 2,
  dependencies: ['base'],
  generate: (config = {}) => {
    const color = config.color || '0x87CEEB';
    const hasClouds = config.clouds !== false;
    
    return `
// Add sky background
scene.background = new THREE.Color(${color});

${hasClouds ? `
// Add simple cloud objects
for (let i = 0; i < ${config.cloudCount || 5}; i++) {
  const cloudGroup = new THREE.Group();
  
  // Create multiple spheres for each cloud
  const numSpheres = 5 + Math.floor(Math.random() * 5);
  const sphereSize = 3 + Math.random() * 2;
  
  for (let j = 0; j < numSpheres; j++) {
    const cloudGeometry = new THREE.SphereGeometry(
      sphereSize * (0.5 + Math.random() * 0.5), 
      8, 8
    );
    const cloudMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
      roughness: 1,
      metalness: 0
    });
    
    const cloudSphere = new THREE.Mesh(cloudGeometry, cloudMaterial);
    
    // Position sphere within the cloud
    cloudSphere.position.set(
      (Math.random() - 0.5) * sphereSize * 2,
      (Math.random() - 0.5) * sphereSize * 0.5,
      (Math.random() - 0.5) * sphereSize * 2
    );
    
    cloudGroup.add(cloudSphere);
  }
  
  // Position cloud in the sky
  cloudGroup.position.set(
    Math.random() * 100 - 50,
    30 + Math.random() * 15,
    Math.random() * 100 - 50
  );
  
  scene.add(cloudGroup);
}` : ''}

${config.stars ? `
// Add stars to the night sky
const starCount = ${config.starCount || 200};
const starGeometry = new THREE.BufferGeometry();
const starPositions = new Float32Array(starCount * 3);

for (let i = 0; i < starCount * 3; i += 3) {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const radius = 80 + Math.random() * 20;
  
  // Convert spherical to Cartesian coordinates
  starPositions[i] = radius * Math.sin(phi) * Math.cos(theta);
  starPositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
  starPositions[i + 2] = radius * Math.cos(phi);
}

starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));

const starMaterial = new THREE.PointsMaterial({
  color: 0xFFFFFF,
  size: 0.5
});

const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);` : ''}
`;
  }
};

registry.register('sky', skyComponent);

export default skyComponent;