// src/app/lib/game-engine/components/characters/player.js
import { registry } from '../../component-registry';

const playerComponent = {
  name: 'player',
  priority: 4,
  dependencies: ['base', 'lighting'],
  modifiesAnimation: true,
  generate: (config = {}) => {
    const color = config.color || '0x00ff00';
    const speed = config.speed || 0.1;
    
    return {
      code: `
// Add player character
const characterGeometry = new THREE.BoxGeometry(1, 2, 1);
const characterMaterial = new THREE.MeshStandardMaterial({ color: ${color} });
const character = new THREE.Mesh(characterGeometry, characterMaterial);
character.position.y = 1;
character.position.x = ${config.x || 0};
character.position.z = ${config.z || 0};
character.castShadow = true;
scene.add(character);
`,
      animationCode: `
// Move character based on input
const moveSpeed = ${speed};

if (keys.w || keys.ArrowUp) character.position.z -= moveSpeed;
if (keys.s || keys.ArrowDown) character.position.z += moveSpeed;
if (keys.a || keys.ArrowLeft) character.position.x -= moveSpeed;
if (keys.d || keys.ArrowRight) character.position.x += moveSpeed;

// Face direction of movement
if ((keys.a || keys.ArrowLeft) && !(keys.d || keys.ArrowRight)) {
  character.rotation.y = Math.PI / 2;
} else if ((keys.d || keys.ArrowRight) && !(keys.a || keys.ArrowLeft)) {
  character.rotation.y = -Math.PI / 2;
} else if ((keys.w || keys.ArrowUp) && !(keys.s || keys.ArrowDown)) {
  character.rotation.y = 0;
} else if ((keys.s || keys.ArrowDown) && !(keys.w || keys.ArrowUp)) {
  character.rotation.y = Math.PI;
}

// Update camera to follow character
camera.position.x = character.position.x;
camera.position.z = character.position.z + 10;
camera.lookAt(character.position);
`
    };
  }
};

registry.register('player', playerComponent);

export default playerComponent;