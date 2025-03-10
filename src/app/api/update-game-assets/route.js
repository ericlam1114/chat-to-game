// src/app/api/update-game-assets/route.js
import { NextResponse } from 'next/server';

// Ensure the global games Map exists
if (!global.games) {
  global.games = new Map();
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { gameId, assetSettings } = body;
    
    if (!gameId || !assetSettings) {
      return NextResponse.json(
        { error: 'Game ID and asset settings are required' },
        { status: 400 }
      );
    }
    
    // Retrieve existing game data
    const existingGame = global.games.get(gameId);
    
    if (!existingGame) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }
    
    // Find the template type from the game type
    const templateType = existingGame.gameType.toLowerCase().includes('rpg') ? 'rpg' : 
                         existingGame.gameType.toLowerCase().includes('shoot') ? 'shooter' :
                         existingGame.gameType.toLowerCase().includes('platform') ? 'platformer' :
                         existingGame.gameType.toLowerCase().includes('rac') ? 'racing' : 'open-world';
    
    // Generate updated game code based on template and settings
    const gameCode = generateCodeWithSettings(templateType, existingGame.prompt, assetSettings);
    
    // Update game data
    const updatedGame = {
      ...existingGame,
      gameCode,
      parameters: {
        ...existingGame.parameters,
        ...assetSettings
      },
      updatedAt: new Date().toISOString()
    };
    
    // Store updated game
    global.games.set(gameId, updatedGame);
    
    return NextResponse.json(updatedGame);
  } catch (error) {
    console.error('Error updating game assets:', error);
    return NextResponse.json(
      { error: 'Failed to update game assets' },
      { status: 500 }
    );
  }
}

function generateCodeWithSettings(template, prompt, settings) {
  // This is a simplified version - in a real implementation,
  // you would take the template code and customize it based on settings
  
  // Convert hex color to 0x format for Three.js
  const characterColor = settings.characterColor ? settings.characterColor.replace('#', '0x') : '0x00ff00';
  const skyColor = settings.skyColor ? settings.skyColor.replace('#', '0x') : '0x87CEEB';
  const groundColor = settings.groundColor ? settings.groundColor.replace('#', '0x') : '0x7CFC00';
  
  // Basic template with customizations
  return `
// ${template.toUpperCase()} template for: "${prompt}"
// Game initialization with custom settings
renderer = initRenderer();
scene = new THREE.Scene();
scene.background = new THREE.Color(${skyColor});
camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 10, 5);
scene.add(directionalLight);

// Ground with custom color
const groundGeometry = new THREE.PlaneGeometry(${settings.worldSize || 100}, ${settings.worldSize || 100});
const groundMaterial = new THREE.MeshStandardMaterial({ 
  color: ${groundColor},
  roughness: 0.8,
  metalness: 0.2
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.5;
scene.add(ground);

// Character with custom color
const characterGeometry = new THREE.BoxGeometry(1, 2, 1);
const characterMaterial = new THREE.MeshStandardMaterial({ color: ${characterColor} });
const character = new THREE.Mesh(characterGeometry, characterMaterial);
character.position.y = 1;
scene.add(character);

// Custom features
${settings.hasTrees ? addTreesCode(settings.worldSize) : '// Trees disabled'}
${settings.hasWater ? addWaterCode(settings.worldSize) : '// Water disabled'}
${settings.hasMountains ? addMountainsCode(settings.worldSize) : '// Mountains disabled'}

// Special features
${settings.specialFeatures?.includes('magic') ? addMagicCode() : '// Magic effects disabled'}
${settings.specialFeatures?.includes('weather') ? addWeatherCode() : '// Weather system disabled'}
${settings.specialFeatures?.includes('airplanes') ? addAirplanesCode() : '// Flying vehicles disabled'}
${settings.specialFeatures?.includes('day-night') ? addDayNightCode() : '// Day/night cycle disabled'}

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
  const moveSpeed = ${settings.moveSpeed || 0.1};
  
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
}

// Helper functions to generate feature-specific code
function addTreesCode(worldSize = 100) {
  return `
// Add trees to environment
for (let i = 0; i < 20; i++) {
  // Tree trunk
  const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2);
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.y = 1;
  
  // Tree top
  const topGeometry = new THREE.ConeGeometry(1, 2, 8);
  const topMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
  const top = new THREE.Mesh(topGeometry, topMaterial);
  top.position.y = 3;
  
  // Tree group
  const tree = new THREE.Group();
  tree.add(trunk);
  tree.add(top);
  
  // Position tree randomly
  const angle = Math.random() * Math.PI * 2;
  const distance = 5 + Math.random() * (${worldSize/2 - 10});
  tree.position.set(
    Math.cos(angle) * distance,
    0,
    Math.sin(angle) * distance
  );
  
  scene.add(tree);
}`;
}

function addWaterCode(worldSize = 100) {
  return `
// Add water to environment
const waterGeometry = new THREE.PlaneGeometry(${worldSize/3}, ${worldSize/3});
const waterMaterial = new THREE.MeshStandardMaterial({
  color: 0x4444ff,
  transparent: true,
  opacity: 0.7,
  roughness: 0.1,
  metalness: 0.8
});
const water = new THREE.Mesh(waterGeometry, waterMaterial);
water.rotation.x = -Math.PI / 2;
water.position.y = 0.05;
scene.add(water);`;
}

function addMountainsCode(worldSize = 100) {
  return `
// Add mountains to environment
for (let i = 0; i < 5; i++) {
  const height = 10 + Math.random() * 10;
  const radius = 5 + Math.random() * 5;
  
  const geometry = new THREE.ConeGeometry(radius, height, 8);
  const material = new THREE.MeshStandardMaterial({
    color: 0x888888,
    roughness: 0.9,
    metalness: 0.1
  });
  
  const mountain = new THREE.Mesh(geometry, material);
  
  // Position mountain
  const angle = (i / 5) * Math.PI * 2;
  const distance = ${worldSize/2 - 15};
  mountain.position.set(
    Math.cos(angle) * distance,
    height / 2,
    Math.sin(angle) * distance
  );
  
  scene.add(mountain);
}`;
}

function addMagicCode() {
  return `
// Add magic particle effects
const particleCount = 500;
const particles = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
  // Random positions in a sphere
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.random() * 10;
  const y = Math.random() * 10;
  
  positions[i * 3] = Math.cos(angle) * radius;
  positions[i * 3 + 1] = y;
  positions[i * 3 + 2] = Math.sin(angle) * radius;
  
  // Purple/blue colors
  colors[i * 3] = 0.5 + Math.random() * 0.5; // R
  colors[i * 3 + 1] = 0; // G
  colors[i * 3 + 2] = 0.5 + Math.random() * 0.5; // B
}

particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const particleMaterial = new THREE.PointsMaterial({
  size: 0.1,
  vertexColors: true,
  transparent: true,
  opacity: 0.8
});

const particleSystem = new THREE.Points(particles, particleMaterial);
scene.add(particleSystem);

// Animate particles in the loop
const originalAnimate = animate;
animate = function() {
  const positions = particles.attributes.position.array;
  const time = clock.getElapsedTime();
  
  for (let i = 0; i < particleCount; i++) {
    const ix = i * 3;
    const iy = i * 3 + 1;
    const iz = i * 3 + 2;
    
    positions[iy] += Math.sin(time + i * 0.1) * 0.01;
    
    // Swirl effect
    const angle = Math.atan2(positions[iz], positions[ix]) + 0.01;
    const radius = Math.sqrt(positions[ix] * positions[ix] + positions[iz] * positions[iz]);
    
    positions[ix] = Math.cos(angle) * radius;
    positions[iz] = Math.sin(angle) * radius;
  }
  
  particles.attributes.position.needsUpdate = true;
  
  // Call original animate
  originalAnimate();
};`;
}

function addWeatherCode() {
  return `
// Add weather system (rain)
const rainCount = 1000;
const rainGeometry = new THREE.BufferGeometry();
const rainPositions = new Float32Array(rainCount * 3);

for (let i = 0; i < rainCount * 3; i += 3) {
  rainPositions[i] = Math.random() * 50 - 25;
  rainPositions[i + 1] = Math.random() * 30;
  rainPositions[i + 2] = Math.random() * 50 - 25;
}

rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));

const rainMaterial = new THREE.PointsMaterial({
  color: 0x8888ff,
  size: 0.1,
  transparent: true,
  opacity: 0.6
});

const rain = new THREE.Points(rainGeometry, rainMaterial);
scene.add(rain);

// Update rain in animation loop
const originalAnimate = animate;
animate = function() {
  const positions = rainGeometry.attributes.position.array;
  
  for (let i = 0; i < rainCount * 3; i += 3) {
    // Rain falls down
    positions[i + 1] -= 0.2;
    
    // Reset raindrops that hit the ground
    if (positions[i + 1] < 0) {
      positions[i] = Math.random() * 50 - 25 + character.position.x;
      positions[i + 1] = 30;
      positions[i + 2] = Math.random() * 50 - 25 + character.position.z;
    }
  }
  
  rainGeometry.attributes.position.needsUpdate = true;
  
  // Make rain follow the character
  rain.position.x = character.position.x;
  rain.position.z = character.position.z;
  
  // Call original animate
  originalAnimate();
};`;
}

function addAirplanesCode() {
  return `
// Add flying vehicles
const airplanes = [];

for (let i = 0; i < 3; i++) {
  // Create airplane body
  const bodyGeometry = new THREE.CylinderGeometry(0.2, 0.2, 3);
  bodyGeometry.rotateZ(Math.PI / 2);
  const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xCCCCCC });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  
  // Wings
  const wingGeometry = new THREE.BoxGeometry(0.1, 3, 0.6);
  const wingMaterial = new THREE.MeshStandardMaterial({ color: 0xCCCCCC });
  const wing = new THREE.Mesh(wingGeometry, wingMaterial);
  
  // Tail
  const tailGeometry = new THREE.BoxGeometry(0.1, 0.8, 0.8);
  const tailMaterial = new THREE.MeshStandardMaterial({ color: 0xCCCCCC });
  const tail = new THREE.Mesh(tailGeometry, tailMaterial);
  tail.position.set(-1.3, 0, 0);
  
  // Combine parts
  const airplane = new THREE.Group();
  airplane.add(body);
  airplane.add(wing);
  airplane.add(tail);
  
  // Position airplane
  const angle = (i / 3) * Math.PI * 2;
  const height = 20 + i * 5;
  const radius = 30;
  
  airplane.position.set(
    Math.cos(angle) * radius,
    height,
    Math.sin(angle) * radius
  );
  
  scene.add(airplane);
  
  // Store airplane data
  airplanes.push({
    mesh: airplane,
    angle: angle,
    radius: radius,
    height: height,
    speed: 0.005 + Math.random() * 0.005
  });
}

// Update airplanes in animation loop
const originalAnimate = animate;
animate = function() {
  // Move airplanes in circles
  airplanes.forEach(airplane => {
    airplane.angle += airplane.speed;
    
    airplane.mesh.position.x = Math.cos(airplane.angle) * airplane.radius;
    airplane.mesh.position.z = Math.sin(airplane.angle) * airplane.radius;
    
    // Make airplane face its direction of travel
    airplane.mesh.rotation.y = airplane.angle + Math.PI / 2;
  });
  
  // Call original animate
  originalAnimate();
};`;
}

function addDayNightCode() {
  return `
// Add day/night cycle
const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x444444, 0.5);
scene.add(hemisphereLight);

const sunLight = new THREE.DirectionalLight(0xFFFFAA, 1);
sunLight.position.set(0, 100, 0);
sunLight.castShadow = true;
scene.add(sunLight);

// Update day/night in animation loop
const originalAnimate = animate;
animate = function() {
  const time = clock.getElapsedTime() * 0.1;
  
  // Calculate sun position based on time
  const sunAngle = time % (Math.PI * 2);
  sunLight.position.x = Math.cos(sunAngle) * 100;
  sunLight.position.y = Math.sin(sunAngle) * 100;
  
  // Change sky color based on sun position
  let skyColor;
  let intensity;
  
  if (sunLight.position.y > 0) {
    // Day
    const dayAmount = Math.min(1, sunLight.position.y / 50);
    skyColor = new THREE.Color(0x87CEEB).lerp(new THREE.Color(0x3366BB), 1 - dayAmount);
    intensity = 0.5 + dayAmount * 0.5;
  } else {
    // Night
    skyColor = new THREE.Color(0x0A0A30);
    intensity = 0.1;
  }
  
  // Update lighting
  scene.background = skyColor;
  hemisphereLight.intensity = intensity;
  sunLight.intensity = Math.max(0, sunLight.position.y / 50);
  
  // Call original animate
  originalAnimate();
};`;
}