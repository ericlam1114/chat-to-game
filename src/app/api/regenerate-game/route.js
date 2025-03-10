// src/app/api/regenerate-game/route.js
import { NextResponse } from "next/server";

// Ensure the global games Map exists
if (!global.games) {
  global.games = new Map();
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { gameId, template } = body;

    if (!gameId || !template) {
      return NextResponse.json(
        { error: "Game ID and template are required" },
        { status: 400 }
      );
    }

    // Retrieve existing game data
    const existingGame = global.games.get(gameId);

    if (!existingGame) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Generate new game code based on template
    const gameCode = generateTemplateCode(template, existingGame.prompt);

    // Update game data
    const updatedGame = {
      ...existingGame,
      gameType: template.charAt(0).toUpperCase() + template.slice(1),
      gameCode,
      updatedAt: new Date().toISOString(),
    };

    // Store updated game
    global.games.set(gameId, updatedGame);

    return NextResponse.json(updatedGame);
  } catch (error) {
    console.error("Error regenerating game:", error);
    return NextResponse.json(
      { error: "Failed to regenerate game" },
      { status: 500 }
    );
  }
}

function generateTemplateCode(template, prompt) {
  switch (template.toLowerCase()) {
    case "rpg":
      return `
// RPG Adventure template for: "${prompt}"
// Game initialization
renderer = initRenderer();
scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 10, 5);
scene.add(directionalLight);

// Ground
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshStandardMaterial({ 
  color: 0x7CFC00,
  roughness: 0.8,
  metalness: 0.2
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.5;
scene.add(ground);

// Character
const characterGeometry = new THREE.BoxGeometry(1, 2, 1);
const characterMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const character = new THREE.Mesh(characterGeometry, characterMaterial);
character.position.y = 1;
scene.add(character);

// Add 5 trees as environment objects
for (let i = 0; i < 5; i++) {
  // Tree trunk
  const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2);
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  
  // Tree top
  const topGeometry = new THREE.ConeGeometry(1, 2, 8);
  const topMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
  const top = new THREE.Mesh(topGeometry, topMaterial);
  top.position.y = 2;
  
  // Tree group
  const tree = new THREE.Group();
  tree.add(trunk);
  tree.add(top);
  
  // Position tree
  const angle = Math.random() * Math.PI * 2;
  const distance = 5 + Math.random() * 15;
  tree.position.set(
    Math.cos(angle) * distance,
    0,
    Math.sin(angle) * distance
  );
  
  scene.add(tree);
}

// Input state
const keys = {
  w: false,
  a: false,
  s: false,
  d: false
};

// Set up keyboard controls
document.addEventListener('keydown', (e) => {
  if (keys.hasOwnProperty(e.key.toLowerCase())) {
    keys[e.key.toLowerCase()] = true;
  }
});

document.addEventListener('keyup', (e) => {
  if (keys.hasOwnProperty(e.key.toLowerCase())) {
    keys[e.key.toLowerCase()] = false;
  }
});

// Game clock
const clock = new THREE.Clock();

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  // Move character
  const delta = clock.getDelta();
  const moveSpeed = 0.1;
  
  if (keys.w) character.position.z -= moveSpeed;
  if (keys.s) character.position.z += moveSpeed;
  if (keys.a) character.position.x -= moveSpeed;
  if (keys.d) character.position.x += moveSpeed;
  
  // Update camera position to follow character
  camera.position.x = character.position.x;
  camera.position.z = character.position.z + 10;
  camera.lookAt(character.position);
  
  renderer.render(scene, camera);
}

animate();

// Instructions
console.log("Use WASD keys to move the character");`;

    case "shooter":
      return `
// Space Shooter template for: "${prompt}"
// Game initialization
renderer = initRenderer();
scene = new THREE.Scene();
scene.background = new THREE.Color(0x000020);
camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.z = 5;

// Player ship
const shipGeometry = new THREE.ConeGeometry(0.5, 1.5, 8);
const shipMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff });
const ship = new THREE.Mesh(shipGeometry, shipMaterial);
shipGeometry.rotateX(Math.PI / 2);
scene.add(ship);

// Stars background
for (let i = 0; i < 1000; i++) {
  const geometry = new THREE.SphereGeometry(0.05, 8, 8);
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);
  
  // Random star positions
  star.position.x = Math.random() * 200 - 100;
  star.position.y = Math.random() * 200 - 100;
  star.position.z = Math.random() * 200 - 200;
  
  scene.add(star);
}

// Bullets array
const bullets = [];
const bulletGeometry = new THREE.SphereGeometry(0.1, 8, 8);
const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

// Enemies array
const enemies = [];
const enemyGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
const enemyMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff });

// Create some enemies
for (let i = 0; i < 10; i++) {
  const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
  enemy.position.set(
    Math.random() * 10 - 5,
    Math.random() * 10 - 5,
    -20 - Math.random() * 10
  );
  scene.add(enemy);
  enemies.push(enemy);
}

// Input state
const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  " ": false
};

// Set up keyboard controls
document.addEventListener('keydown', (e) => {
  if (keys.hasOwnProperty(e.code)) {
    keys[e.code] = true;
  } else if (e.code === 'Space') {
    keys[" "] = true;
  }
});

document.addEventListener('keyup', (e) => {
  if (keys.hasOwnProperty(e.code)) {
    keys[e.code] = false;
  } else if (e.code === 'Space') {
    keys[" "] = false;
  }
});

// Function to create a bullet
function createBullet() {
  const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
  bullet.position.copy(ship.position);
  scene.add(bullet);
  bullets.push(bullet);
}

// Game clock
const clock = new THREE.Clock();
let shootCooldown = 0;

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  const delta = clock.getDelta();
  shootCooldown -= delta;
  
  // Move ship based on keys
  if (keys.ArrowLeft) ship.position.x -= 0.1;
  if (keys.ArrowRight) ship.position.x += 0.1;
  if (keys.ArrowUp) ship.position.y += 0.1;
  if (keys.ArrowDown) ship.position.y -= 0.1;
  
  // Keep ship in bounds
  ship.position.x = Math.max(-5, Math.min(5, ship.position.x));
  ship.position.y = Math.max(-3, Math.min(3, ship.position.y));
  
  // Shooting
  if (keys[" "] && shootCooldown <= 0) {
    createBullet();
    shootCooldown = 0.3; // Bullet cooldown
  }
  
  // Update bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].position.z -= 0.5; // Bullet speed
    
    // Remove bullets that are far away
    if (bullets[i].position.z < -100) {
      scene.remove(bullets[i]);
      bullets.splice(i, 1);
      continue;
    }
    
    // Collision with enemies
    for (let j = enemies.length - 1; j >= 0; j--) {
      if (bullets[i] && bullets[i].position.distanceTo(enemies[j].position) < 1) {
        // Hit! Remove bullet and reset enemy
        scene.remove(bullets[i]);
        bullets.splice(i, 1);
        
        // Reset enemy position
        enemies[j].position.set(
          Math.random() * 10 - 5,
          Math.random() * 10 - 5,
          -20 - Math.random() * 10
        );
        break;
      }
    }
  }
  
  // Move enemies
  enemies.forEach(enemy => {
    enemy.position.z += 0.05;
    
    // Reset enemy if it passes the camera
    if (enemy.position.z > 10) {
      enemy.position.set(
        Math.random() * 10 - 5,
        Math.random() * 10 - 5,
        -20 - Math.random() * 10
      );
    }
  });
  
  renderer.render(scene, camera);
}

animate();

// Instructions
console.log("Use arrow keys to move, space to shoot");`;

    case "platformer":
      return `
// Platformer template for: "${prompt}"
// Game initialization
renderer = initRenderer();
scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 5, 15);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 10, 5);
scene.add(directionalLight);

// Player character
const characterGeometry = new THREE.BoxGeometry(1, 1, 1);
const characterMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const character = new THREE.Mesh(characterGeometry, characterMaterial);
character.position.set(0, 0.5, 0);
scene.add(character);

// Create platforms
const platforms = [];

function createPlatform(x, y, z, width, height, depth) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
  const platform = new THREE.Mesh(geometry, material);
  platform.position.set(x, y, z);
  scene.add(platform);
  platforms.push(platform);
  return platform;
}

// Ground
createPlatform(0, -0.5, 0, 15, 1, 5);

// Platforms
createPlatform(-5, 2, 0, 3, 0.5, 3);
createPlatform(0, 4, 0, 3, 0.5, 3);
createPlatform(5, 6, 0, 3, 0.5, 3);
createPlatform(0, 8, 0, 3, 0.5, 3);
createPlatform(-5, 10, 0, 3, 0.5, 3);

// Physics
let velocity = new THREE.Vector3(0, 0, 0);
const gravity = -0.005;
let isJumping = true;

// Input state
const keys = {
  ArrowLeft: false,
  ArrowRight: false,
  Space: false
};

// Set up keyboard controls
document.addEventListener('keydown', (e) => {
  if (keys.hasOwnProperty(e.code)) {
    keys[e.code] = true;
  }
});

document.addEventListener('keyup', (e) => {
  if (keys.hasOwnProperty(e.code)) {
    keys[e.code] = false;
  }
});

// Game clock
const clock = new THREE.Clock();

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  // Apply gravity
  velocity.y += gravity;
  
  // Move character
  character.position.x += velocity.x;
  character.position.y += velocity.y;
  
  // Collision detection
  let onGround = false;
  
  platforms.forEach(platform => {
    if (
      character.position.x + 0.5 > platform.position.x - platform.geometry.parameters.width/2 &&
      character.position.x - 0.5 < platform.position.x + platform.geometry.parameters.width/2 &&
      character.position.z + 0.5 > platform.position.z - platform.geometry.parameters.depth/2 &&
      character.position.z - 0.5 < platform.position.z + platform.geometry.parameters.depth/2 &&
      character.position.y - 0.5 <= platform.position.y + platform.geometry.parameters.height/2 &&
      character.position.y - 0.5 > platform.position.y + platform.geometry.parameters.height/2 - 0.2
    ) {
      // Landing on top of platform
      onGround = true;
      isJumping = false;
      velocity.y = 0;
      character.position.y = platform.position.y + platform.geometry.parameters.height/2 + 0.5;
    }
  });
  
  // Check if character fell off
  if (character.position.y < -5) {
    character.position.set(0, 5, 0);
    velocity.set(0, 0, 0);
  }
  
  // Horizontal movement
  velocity.x = 0;
  if (keys.ArrowLeft) velocity.x = -0.1;
  if (keys.ArrowRight) velocity.x = 0.1;
  
  // Jumping
  if (keys.Space && onGround) {
    velocity.y = 0.2;
    isJumping = true;
  }
  
  // Update camera
  camera.position.x = character.position.x;
  camera.position.y = character.position.y + 5;
  camera.lookAt(character.position);
  
  renderer.render(scene, camera);
}

animate();

// Instructions
console.log("Use arrow keys to move, space to jump");`;

    case "racing":
      return `
// Racing Game template for: "${prompt}"
// Game initialization
renderer = initRenderer();
scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 10, 5);
scene.add(directionalLight);

// Create car
const car = new THREE.Group();
scene.add(car);

// Car body
const bodyGeometry = new THREE.BoxGeometry(2, 0.5, 4);
const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
body.position.y = 0.5;
car.add(body);

// Car top
const topGeometry = new THREE.BoxGeometry(1.5, 0.5, 2);
const topMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
const top = new THREE.Mesh(topGeometry, topMaterial);
top.position.y = 1;
top.position.z = -0.5;
car.add(top);

// Wheels
const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
wheelGeometry.rotateZ(Math.PI/2);

const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });

// Front-left wheel
const wheelFL = new THREE.Mesh(wheelGeometry, wheelMaterial);
wheelFL.position.set(-1, 0.4, 1.2);
car.add(wheelFL);

// Front-right wheel
const wheelFR = new THREE.Mesh(wheelGeometry, wheelMaterial);
wheelFR.position.set(1, 0.4, 1.2);
car.add(wheelFR);

// Rear-left wheel
const wheelRL = new THREE.Mesh(wheelGeometry, wheelMaterial);
wheelRL.position.set(-1, 0.4, -1.2);
car.add(wheelRL);

// Rear-right wheel
const wheelRR = new THREE.Mesh(wheelGeometry, wheelMaterial);
wheelRR.position.set(1, 0.4, -1.2);
car.add(wheelRR);

// Create race track
const track = new THREE.Group();
scene.add(track);

// Define track points
const trackPoints = [
  new THREE.Vector3(0, 0, -20),
  new THREE.Vector3(20, 0, -15),
  new THREE.Vector3(25, 0, 0),
  new THREE.Vector3(20, 0, 15),
  new THREE.Vector3(0, 0, 20),
  new THREE.Vector3(-20, 0, 15),
  new THREE.Vector3(-25, 0, 0),
  new THREE.Vector3(-20, 0, -15),
  new THREE.Vector3(0, 0, -20)
];

// Create a smooth curve from track points
const trackCurve = new THREE.CatmullRomCurve3(trackPoints);

// Create track segments
const trackWidth = 8;
const trackSegments = 50;
const trackPointsOnCurve = trackCurve.getPoints(trackSegments);

// Create ground
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x7CFC00 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.1;
scene.add(ground);

// Create track
for (let i = 0; i < trackPointsOnCurve.length - 1; i++) {
  const current = trackPointsOnCurve[i];
  const next = trackPointsOnCurve[i + 1];
  
  // Calculate direction and perpendicular
  const direction = new THREE.Vector3().subVectors(next, current).normalize();
  const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x);
  
  // Create track segment
  const segmentGeometry = new THREE.PlaneGeometry(trackWidth, next.distanceTo(current));
  const segmentMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x333333, 
    side: THREE.DoubleSide 
  });
  
  const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);
  segment.position.copy(current).add(next).multiplyScalar(0.5);
  segment.position.y = 0.01; // Just above ground
  
  // Rotate to face next point
  segment.lookAt(next);
  segment.rotateX(Math.PI / 2);
  
  track.add(segment);
}

// Physics variables
let speed = 0;
const maxSpeed = 0.3;
const acceleration = 0.005;
const deceleration = 0.003;
const turnSpeed = 0.03;

// Input state
const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false
};

// Set up keyboard controls
document.addEventListener('keydown', (e) => {
  if (keys.hasOwnProperty(e.code)) {
    keys[e.code] = true;
  }
});

document.addEventListener('keyup', (e) => {
  if (keys.hasOwnProperty(e.code)) {
    keys[e.code] = false;
  }
});

// Game clock
const clock = new THREE.Clock();

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  // Car controls
  if (keys.ArrowUp) {
    speed = Math.min(maxSpeed, speed + acceleration);
  } else if (keys.ArrowDown) {
    speed = Math.max(-maxSpeed / 2, speed - acceleration);
  } else {
    // Slow down when no input
    if (speed > 0) {
      speed = Math.max(0, speed - deceleration);
    } else if (speed < 0) {
      speed = Math.min(0, speed + deceleration);
    }
  }
  
  // Apply speed to car position
  const direction = new THREE.Vector3(0, 0, -1);
  direction.applyQuaternion(car.quaternion);
  car.position.add(direction.multiplyScalar(speed));

  // Car turning
  if (keys.ArrowLeft) {
    car.rotation.y += turnSpeed * Math.abs(speed / maxSpeed);
  }
  if (keys.ArrowRight) {
    car.rotation.y -= turnSpeed * Math.abs(speed / maxSpeed);
  }
  
  // Rotate wheels based on speed
  const wheelRotation = speed * 0.3;
  wheelFL.rotation.x += wheelRotation;
  wheelFR.rotation.x += wheelRotation;
  wheelRL.rotation.x += wheelRotation;
  wheelRR.rotation.x += wheelRotation;
  
  // Update camera to follow car
  const cameraOffset = new THREE.Vector3(0, 4, 10);
  cameraOffset.applyQuaternion(car.quaternion);
  camera.position.copy(car.position).add(cameraOffset);
  camera.lookAt(car.position);
  
  renderer.render(scene, camera);
}

animate();

// Instructions
console.log("Use arrow keys to control the car");`;

    case "open-world":
      return `
// Open World template for: "${prompt}"
// Game initialization
renderer = initRenderer();
scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.FogExp2(0x87CEEB, 0.01);
camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Character
const characterGeometry = new THREE.BoxGeometry(1, 2, 1);
const characterMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const character = new THREE.Mesh(characterGeometry, characterMaterial);
character.position.y = 1;
scene.add(character);

// Ground (terrain)
const terrainSize = 200;
const terrainResolution = 128;
const terrainGeometry = new THREE.PlaneGeometry(
  terrainSize, 
  terrainSize, 
  terrainResolution - 1, 
  terrainResolution - 1
);

// Create terrain heights
const terrainVertices = terrainGeometry.attributes.position.array;
for (let i = 0; i < terrainVertices.length; i += 3) {
  const x = terrainVertices[i];
  const z = terrainVertices[i + 2];
  
  // Simple noise function for hills
  const distance = Math.sqrt(x * x + z * z);
  let height = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 5;
  height += Math.sin(x * 0.05 + z * 0.05) * 10;
  height -= distance * 0.05; // Lower terrain as you go outward
  
  terrainVertices[i + 1] = Math.max(-10, height); // Set Y (height)
}

// Update geometry
terrainGeometry.computeVertexNormals();
terrainGeometry.attributes.position.needsUpdate = true;

const terrainMaterial = new THREE.MeshStandardMaterial({ 
  color: 0x7CFC00,
  wireframe: false,
  flatShading: true
});

const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
terrain.rotation.x = -Math.PI / 2;
scene.add(terrain);

// Trees
function createTree(x, z) {
  const tree = new THREE.Group();
  
  // Get height at this position
  const terrainY = getHeightAt(x, z);
  
  // Tree trunk
  const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1.5);
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.y = 0.75;
  tree.add(trunk);
  
  // Tree top
  const topGeometry = new THREE.ConeGeometry(1, 2, 8);
  const topMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
  const top = new THREE.Mesh(topGeometry, topMaterial);
  top.position.y = 2.5;
  tree.add(top);
  
  // Position tree
  tree.position.set(x, terrainY, z);
  
  scene.add(tree);
  return tree;
}

// Helper function to estimate height at a point on the terrain
function getHeightAt(x, z) {
  // Convert world coordinates to terrain coordinates
  const terrainX = (x + terrainSize / 2) / terrainSize;
  const terrainZ = (z + terrainSize / 2) / terrainSize;
  
  // Simple estimation based on our noise function
  const distance = Math.sqrt(x * x + z * z);
  let height = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 5;
  height += Math.sin(x * 0.05 + z * 0.05) * 10;
  height -= distance * 0.05;
  
  return Math.max(-10, height);
}

// Create many trees in the world
const trees = [];
for (let i = 0; i < 50; i++) {
  const x = Math.random() * 150 - 75;
  const z = Math.random() * 150 - 75;
  trees.push(createTree(x, z));
}

// Game physics
let velocity = new THREE.Vector3();
const gravity = new THREE.Vector3(0, -0.01, 0);
let isGrounded = false;

// Input state
const keys = {
  w: false,
  a: false,
  s: false,
  d: false,
  " ": false
};

// Set up keyboard controls
document.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  if (keys.hasOwnProperty(key)) {
    keys[key] = true;
  }
});

document.addEventListener('keyup', (e) => {
  const key = e.key.toLowerCase();
  if (keys.hasOwnProperty(key)) {
    keys[key] = false;
  }
});

// Game clock
const clock = new THREE.Clock();

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  const delta = clock.getDelta();
  
  // Character movement direction
  const moveDir = new THREE.Vector3(0, 0, 0);
  
  if (keys.w) moveDir.z -= 1;
  if (keys.s) moveDir.z += 1;
  if (keys.a) moveDir.x -= 1;
  if (keys.d) moveDir.x += 1;
  
  if (moveDir.length() > 0) {
    moveDir.normalize();
    
    // Apply movement to character
    character.position.x += moveDir.x * 0.2;
    character.position.z += moveDir.z * 0.2;
    
    // Rotate character to face movement direction
    if (moveDir.x !== 0 || moveDir.z !== 0) {
      const angle = Math.atan2(moveDir.x, moveDir.z);
      character.rotation.y =
      const angle = Math.atan2(moveDir.x, moveDir.z);
      character.rotation.y = angle;
    }
  }
  
  // Apply gravity
  velocity.add(gravity);
  character.position.add(velocity);
  
  // Get terrain height at character position
  const terrainY = getHeightAt(character.position.x, character.position.z);
  
  // Check if character is on ground
  if (character.position.y < terrainY + 1) {
    character.position.y = terrainY + 1;
    velocity.y = 0;
    isGrounded = true;
  } else {
    isGrounded = false;
  }
  
  // Jumping
  if (keys[" "] && isGrounded) {
    velocity.y = 0.2;
    isGrounded = false;
  }
  
  // Update camera to follow character
  camera.position.x = character.position.x;
  camera.position.y = character.position.y + 5;
  camera.position.z = character.position.z + 10;
  camera.lookAt(character.position);
  
  renderer.render(scene, camera);
}

animate();

// Instructions
console.log("Use WASD to move, spacebar to jump");`;

    default:
      return `
// Default game template for: "${prompt}"
// Game initialization
renderer = initRenderer();
scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 10, 5);
scene.add(directionalLight);

// Ground
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshStandardMaterial({ 
  color: 0x7CFC00,
  roughness: 0.8,
  metalness: 0.2
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.5;
scene.add(ground);

// Character
const characterGeometry = new THREE.BoxGeometry(1, 2, 1);
const characterMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const character = new THREE.Mesh(characterGeometry, characterMaterial);
character.position.y = 1;
scene.add(character);

// Input state
const keys = {
  w: false,
  a: false,
  s: false,
  d: false
};

// Set up keyboard controls
document.addEventListener('keydown', (e) => {
  if (keys.hasOwnProperty(e.key.toLowerCase())) {
    keys[e.key.toLowerCase()] = true;
  }
});

document.addEventListener('keyup', (e) => {
  if (keys.hasOwnProperty(e.key.toLowerCase())) {
    keys[e.key.toLowerCase()] = false;
  }
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  // Move character
  const moveSpeed = 0.1;
  
  if (keys.w) character.position.z -= moveSpeed;
  if (keys.s) character.position.z += moveSpeed;
  if (keys.a) character.position.x -= moveSpeed;
  if (keys.d) character.position.x += moveSpeed;
  
  // Update camera to follow character
  camera.position.x = character.position.x;
  camera.position.z = character.position.z + 10;
  camera.lookAt(character.position);
  
  renderer.render(scene, camera);
}

animate();

// Instructions
console.log("Use WASD keys to move the character");`;
  }
}
