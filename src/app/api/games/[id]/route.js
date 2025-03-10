import { NextResponse } from 'next/server';

// Create a global store for game data
if (!global.games) {
  global.games = new Map();
  
  // Add sample data for testing
  addSampleGame('24mpi4bkoqswmp7hwvyvwj', {
    prompt: "Create an RPG adventure game",
    gameType: "RPG Adventure",
    gameCode: `
  // Game initialization
  renderer = initRenderer();
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000020);
  camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 5;
  
  // Character creation
  const geometry = new THREE.BoxGeometry(1, 2, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const character = new THREE.Mesh(geometry, material);
  scene.add(character);
  
  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    character.rotation.y += 0.01;
    renderer.render(scene, camera);
  }
  animate();
  `
  });
  
  addSampleGame('lqzx8ly3mciy5kidvc9dn', {
    prompt: "Build a space shooter with asteroids",
    gameType: "Space Shooter",
    gameCode: `
// Game initialization
initRenderer();
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000020);
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.z = 10;

// Ship creation
const shipGeometry = new THREE.ConeGeometry(0.5, 2, 8);
const shipMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
const ship = new THREE.Mesh(shipGeometry, shipMaterial);
scene.add(ship);

// Add stars
for (let i = 0; i < 200; i++) {
  const geometry = new THREE.SphereGeometry(0.1, 8, 8);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);
  
  const x = Math.random() * 100 - 50;
  const y = Math.random() * 100 - 50;
  const z = Math.random() * 100 - 100;
  
  star.position.set(x, y, z);
  scene.add(star);
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  ship.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();
`
  });
  
  addSampleGame('ap3sep8kpxswy0xhzcs28a', {
    prompt: "Create an RPG Shooter with fantasy elements",
    gameType: "RPG Shooter",
    gameCode: `
// Game initialization
initRenderer();
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a0a2a);
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 3, 10);

// Character
const characterGeometry = new THREE.BoxGeometry(1, 2, 1);
const characterMaterial = new THREE.MeshBasicMaterial({ color: 0x0066ff });
const character = new THREE.Mesh(characterGeometry, characterMaterial);
character.position.y = 0.5;
scene.add(character);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  character.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();
`
  });
}

// Helper function to add a sample game with ID
function addSampleGame(id, gameData) {
  global.games.set(id, {
    id,
    ...gameData,
    createdAt: new Date().toISOString()
  });
}

export async function GET(request) {
  // Get the URL path
  const path = request.nextUrl.pathname;
  
  // Extract the ID from the path
  const pathParts = path.split('/');
  const id = pathParts[pathParts.length - 1];
  
  if (!id) {
    return NextResponse.json(
      { error: 'Game ID is required' },
      { status: 400 }
    );
  }
  
  // Get the game from the global store
  const game = global.games.get(id);
  
  if (!game) {
    return NextResponse.json(
      { error: 'Game not found', id },
      { status: 404 }
    );
  }
  
  return NextResponse.json(game);
}