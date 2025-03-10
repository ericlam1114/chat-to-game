/**
 * RPG Game Template
 * 
 * This template creates a basic 3D RPG game with:
 * - Character movement
 * - Simple environment
 * - NPC characters
 * - Basic interaction system
 */

export function createRpgTemplate(params = {}) {
    // Set default parameters with fallbacks
    const gameParams = {
      title: params.title || 'RPG Adventure',
      skyColor: params.skyColor || '87CEEB',
      groundColor: params.groundColor || '7CFC00',
      characterColor: params.characterColor || 'FF0000',
      
      // Environment settings
      hasWater: params.hasWater !== undefined ? params.hasWater : true,
      hasTrees: params.hasTrees !== undefined ? params.hasTrees : true,
      hasMountains: params.hasMountains !== undefined ? params.hasMountains : false,
      worldSize: params.worldSize || 100,
      
      // Character settings
      moveSpeed: params.moveSpeed || 0.1,
      
      // NPC settings
      npcCount: params.npcCount || 5,
      npcTypes: params.npcTypes || ['villager', 'merchant', 'guard'],
      
      // Game theme
      theme: params.theme || 'medieval',
      
      // Special features
      specialFeatures: params.specialFeatures || [],
    };
  
    return `
const renderer = initRenderer();
  
    // Game constants
    const WORLD_SIZE = ${gameParams.worldSize};
    const MOVE_SPEED = ${gameParams.moveSpeed};
    
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x${gameParams.skyColor});
    scene.fog = new THREE.Fog(0x${gameParams.skyColor}, 50, 150);
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75, 
      container.clientWidth / container.clientHeight, 
      0.1, 
      1000
    );
    camera.position.set(0, 2, 10);
    
    // Add orbit controls for easier navigation
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.1; // Prevent going below ground
    controls.minDistance = 3;
    controls.maxDistance = 30;
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -25;
    directionalLight.shadow.camera.right = 25;
    directionalLight.shadow.camera.top = 25;
    directionalLight.shadow.camera.bottom = -25;
    scene.add(directionalLight);
    
    // Enable shadows
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Create ground
    const groundGeometry = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x${gameParams.groundColor},
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Create player character
    const player = createCharacter(0x${gameParams.characterColor});
    player.position.set(0, 1, 0);
    scene.add(player);
    
    // Create NPCs
    const npcs = [];
    for (let i = 0; i < ${gameParams.npcCount}; i++) {
      const npcType = ${gameParams.npcTypes}.length > 0 
        ? ${gameParams.npcTypes}[Math.floor(Math.random() * ${gameParams.npcTypes}.length)]
        : 'villager';
      
      const npc = createNPC(npcType);
      
      // Position NPCs randomly around the world
      const angle = Math.random() * Math.PI * 2;
      const distance = 5 + Math.random() * (WORLD_SIZE / 4);
      npc.position.set(
        Math.cos(angle) * distance,
        1,
        Math.sin(angle) * distance
      );
      
      scene.add(npc);
      npcs.push({
        mesh: npc,
        type: npcType,
        walkSpeed: 0.01 + Math.random() * 0.02,
        walkDirection: new THREE.Vector3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize(),
        lastDirectionChange: 0
      });
    }
    
    // Add environment features
    if (${gameParams.hasTrees}) {
      addTrees();
    }
    
    if (${gameParams.hasMountains}) {
      addMountains();
    }
    
    if (${gameParams.hasWater}) {
      addWater();
    }
    
    // Special features
    ${gameParams.specialFeatures.includes('airplanes') ? 'addAirplanes();' : ''}
    ${gameParams.specialFeatures.includes('magic') ? 'addMagicEffects();' : ''}
    ${gameParams.specialFeatures.includes('weather') ? 'addWeatherSystem();' : ''}
    
    // Input state
    const keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      shift: false
    };
    
    // Set up keyboard controls
    document.addEventListener('keydown', (e) => {
      switch (e.key.toLowerCase()) {
        case 'w': keys.forward = true; break;
        case 's': keys.backward = true; break;
        case 'a': keys.left = true; break;
        case 'd': keys.right = true; break;
        case 'shift': keys.shift = true; break;
      }
    });
    
    document.addEventListener('keyup', (e) => {
      switch (e.key.toLowerCase()) {
        case 'w': keys.forward = false; break;
        case 's': keys.backward = false; break;
        case 'a': keys.left = false; break;
        case 'd': keys.right = false; break;
        case 'shift': keys.shift = false; break;
      }
    });
    
    // Game state
    let clock = new THREE.Clock();
    let playerVelocity = new THREE.Vector3();
    
    // Animation loop
    function animate() {
      const delta = clock.getDelta();
      
      // Update player movement
      movePlayer(delta);
      
      // Update NPCs
      updateNPCs(delta);
      
      // Update controls
      controls.update();
      
      // Render scene
      renderer.render(scene, camera);
      
      // Request next frame
      requestAnimationFrame(animate);
    }
    
    // Start animation loop
    animate();
    
    // Character creation function
    function createCharacter(color) {
      const group = new THREE.Group();
      
      // Body
      const bodyGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.4);
      const bodyMaterial = new THREE.MeshStandardMaterial({ color });
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
      body.position.y = 0.6;
      body.castShadow = true;
      group.add(body);
      
      // Head
      const headGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.6);
      const headMaterial = new THREE.MeshStandardMaterial({ color });
      const head = new THREE.Mesh(headGeometry, headMaterial);
      head.position.y = 1.5;
      head.castShadow = true;
      group.add(head);
      
      // Arms
      const armGeometry = new THREE.BoxGeometry(0.25, 0.8, 0.25);
      const armMaterial = new THREE.MeshStandardMaterial({ color });
      
      const leftArm = new THREE.Mesh(armGeometry, armMaterial);
      leftArm.position.set(-0.55, 0.5, 0);
      leftArm.castShadow = true;
      group.add(leftArm);
      
      const rightArm = new THREE.Mesh(armGeometry, armMaterial);
      rightArm.position.set(0.55, 0.5, 0);
      rightArm.castShadow = true;
      group.add(rightArm);
      
      // Legs
      const legGeometry = new THREE.BoxGeometry(0.3, 0.9, 0.3);
      const legMaterial = new THREE.MeshStandardMaterial({ color });
      
      const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
      leftLeg.position.set(-0.25, -0.55, 0);
      leftLeg.castShadow = true;
      group.add(leftLeg);
      
      const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
      rightLeg.position.set(0.25, -0.55, 0);
      rightLeg.castShadow = true;
      group.add(rightLeg);
      
      return group;
    }
    
    // NPC creation function
    function createNPC(type) {
      let color;
      
      switch (type) {
        case 'villager':
          color = 0x964B00;
          break;
        case 'merchant':
          color = 0xFFD700;
          break;
        case 'guard':
          color = 0x808080;
          break;
        default:
          color = 0x0000FF;
      }
      
      return createCharacter(color);
    }
    
    // Move player based on input
    function movePlayer(delta) {
      // Calculate movement direction
      const moveDir = new THREE.Vector3(0, 0, 0);
      
      if (keys.forward) moveDir.z -= 1;
      if (keys.backward) moveDir.z += 1;
      if (keys.left) moveDir.x -= 1;
      if (keys.right) moveDir.x += 1;
      
      if (moveDir.length() > 0) {
        moveDir.normalize();
        
        // Apply move speed
        const speedMultiplier = keys.shift ? 2 : 1;
        moveDir.multiplyScalar(MOVE_SPEED * speedMultiplier);
        
        // Update velocity with smoothing
        playerVelocity.lerp(moveDir, 0.2);
      } else {
        // Slow down when no keys pressed
        playerVelocity.lerp(new THREE.Vector3(0, 0, 0), 0.2);
      }
      
      // Apply movement
      player.position.add(playerVelocity);
      
      // Keep player within world bounds
      const half = WORLD_SIZE / 2 - 2;
      player.position.x = Math.max(-half, Math.min(half, player.position.x));
      player.position.z = Math.max(-half, Math.min(half, player.position.z));
      
      // Update camera to follow player
      const cameraOffset = new THREE.Vector3(0, 5, 10);
      const cameraTarget = new THREE.Vector3(
        player.position.x,
        player.position.y,
        player.position.z
      );
      
      // Update camera position and target
      camera.position.copy(cameraTarget).add(cameraOffset);
      controls.target.copy(cameraTarget);
    }
    
    // Update NPCs movement and behavior
    function updateNPCs(delta) {
      const currentTime = clock.getElapsedTime();
      
      npcs.forEach(npc => {
        // Change direction occasionally
        if (currentTime - npc.lastDirectionChange > 3 + Math.random() * 2) {
          npc.walkDirection.set(
            Math.random() - 0.5,
            0,
            Math.random() - 0.5
          ).normalize();
          npc.lastDirectionChange = currentTime;
        }
        
        // Move NPC
        const movement = npc.walkDirection.clone().multiplyScalar(npc.walkSpeed);
        npc.mesh.position.add(movement);
        
        // Keep NPC within world bounds
        const half = WORLD_SIZE / 2 - 2;
        if (Math.abs(npc.mesh.position.x) > half || Math.abs(npc.mesh.position.z) > half) {
          // If hitting boundary, turn around
          npc.walkDirection.multiplyScalar(-1);
          npc.lastDirectionChange = currentTime;
        }
        
        // Make NPCs face their movement direction
        if (movement.length() > 0.01) {
          npc.mesh.lookAt(
            npc.mesh.position.x + movement.x * 10,
            npc.mesh.position.y,
            npc.mesh.position.z + movement.z * 10
          );
        }
      });
    }
    
    // Add trees to the environment
    function addTrees() {
      const treeCount = Math.floor(WORLD_SIZE / 10);
      
      for (let i = 0; i < treeCount; i++) {
        const tree = createTree();
        
        // Position trees randomly
        const angle = Math.random() * Math.PI * 2;
        const distance = 10 + Math.random() * (WORLD_SIZE / 2 - 15);
        
        tree.position.set(
          Math.cos(angle) * distance,
          0,
          Math.sin(angle) * distance
        );
        
        scene.add(tree);
      }
    }
    
    // Create a simple tree
    function createTree() {
      const group = new THREE.Group();
      
      // Trunk
      const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.4, 2, 8);
      const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.y = 1;
      trunk.castShadow = true;
      group.add(trunk);
      
      // Foliage
      const foliageGeometry = new THREE.ConeGeometry(1.5, 3, 8);
      const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
      const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
      foliage.position.y = 3;
      foliage.castShadow = true;
      group.add(foliage);
      
      return group;
    }
    
    // Add mountains to the environment
    function addMountains() {
      const mountainCount = 5;
      
      for (let i = 0; i < mountainCount; i++) {
        const mountain = createMountain();
        
        // Position mountains around the edge of the world
        const angle = (i / mountainCount) * Math.PI * 2;
        const distance = WORLD_SIZE / 2 - 10;
        
        mountain.position.set(
          Math.cos(angle) * distance,
          0,
          Math.sin(angle) * distance
        );
        
        scene.add(mountain);
      }
    }
    
    // Create a simple mountain
    function createMountain() {
      const height = 15 + Math.random() * 10;
      const radius = 8 + Math.random() * 4;
      
      const geometry = new THREE.ConeGeometry(radius, height, 8);
      const material = new THREE.MeshStandardMaterial({ 
        color: 0x808080,
        roughness: 0.9,
        metalness: 0.1
      });
      
      const mountain = new THREE.Mesh(geometry, material);
      mountain.position.y = height / 2;
      mountain.castShadow = true;
      
      return mountain;
    }
    
    // Add water to the environment
    function addWater() {
      const waterSize = WORLD_SIZE / 4;
      
      const waterGeometry = new THREE.PlaneGeometry(waterSize, waterSize);
      const waterMaterial = new THREE.MeshStandardMaterial({
        color: 0x4682B4,
        transparent: true,
        opacity: 0.8,
        roughness: 0.1,
        metalness: 0.2
      });
      
      const water = new THREE.Mesh(waterGeometry, waterMaterial);
      water.rotation.x = -Math.PI / 2;
      water.position.y = 0.05; // Slightly above ground to avoid z-fighting
      
      scene.add(water);
    }
    
    // Add airplanes if special feature is enabled
    function addAirplanes() {
      const airplaneCount = 3;
      const airplanes = [];
      
      for (let i = 0; i < airplaneCount; i++) {
        const airplane = createAirplane();
        
        // Start airplanes at different positions
        const angle = (i / airplaneCount) * Math.PI * 2;
        const distance = WORLD_SIZE / 3;
        const height = 20 + i * 5;
        
        airplane.position.set(
          Math.cos(angle) * distance,
          height,
          Math.sin(angle) * distance
        );
        
        scene.add(airplane);
        
        airplanes.push({
          mesh: airplane,
          speed: 0.1 + Math.random() * 0.1,
          rotationSpeed: 0.0005,
          center: new THREE.Vector3(0, height, 0),
          radius: distance,
          angle: angle
        });
      }
      
      // Update airplanes in animation loop
      const originalAnimate = animate;
      animate = function() {
        // Update airplane positions
        airplanes.forEach(airplane => {
          airplane.angle += airplane.speed * 0.01;
          
          airplane.mesh.position.x = Math.cos(airplane.angle) * airplane.radius;
          airplane.mesh.position.z = Math.sin(airplane.angle) * airplane.radius;
          
          // Make airplane face direction of travel
          airplane.mesh.rotation.y = airplane.angle + Math.PI / 2;
        });
        
        // Call original animate function
        originalAnimate();
      };
    }
    
    // Create a simple airplane model
    function createAirplane() {
      const group = new THREE.Group();
      
      // Fuselage
      const fuselageGeometry = new THREE.CylinderGeometry(0.3, 0.3, 3, 8);
      fuselageGeometry.rotateZ(Math.PI / 2);
      const fuselageMaterial = new THREE.MeshStandardMaterial({ color: 0xC0C0C0 });
      const fuselage = new THREE.Mesh(fuselageGeometry, fuselageMaterial);
      fuselage.castShadow = true;
      group.add(fuselage);
      
      // Wings
      const wingGeometry = new THREE.BoxGeometry(0.1, 4, 0.8);
      const wingMaterial = new THREE.MeshStandardMaterial({ color: 0xC0C0C0 });
      const wing = new THREE.Mesh(wingGeometry, wingMaterial);
      wing.castShadow = true;
      group.add(wing);
      
      // Tail
      const tailGeometry = new THREE.BoxGeometry(0.1, 1, 0.8);
      tailGeometry.translate(0, 0.5, 0);
      const tailMaterial = new THREE.MeshStandardMaterial({ color: 0xC0C0C0 });
      const tail = new THREE.Mesh(tailGeometry, tailMaterial);
      tail.position.set(-1.3, 0, 0);
      tail.castShadow = true;
      group.add(tail);
      
      // Vertical stabilizer
      const stabilizerGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.1);
      stabilizerGeometry.translate(0, 0.4, 0);
      const stabilizerMaterial = new THREE.MeshStandardMaterial({ color: 0xC0C0C0 });
      const stabilizer = new THREE.Mesh(stabilizerGeometry, stabilizerMaterial);
      stabilizer.position.set(-1.3, 0, 0);
      stabilizer.castShadow = true;
      group.add(stabilizer);
      
      return group;
    }
    
    // Function to add magic effects if enabled
    function addMagicEffects() {
      // Add magic particles
      const particleCount = 500;
      const particles = new THREE.BufferGeometry();
      
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      
      for (let i = 0; i < particleCount; i++) {
        // Random position in a sphere
        const angle = Math.random() * Math.PI * 2;
        const radius = 1 + Math.random() * 20;
        const height = -10 + Math.random() * 20;
        
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = height;
        positions[i * 3 + 2] = Math.sin(angle) * radius;
        
        // Random colors (blue/purple hues for magic)
        colors[i * 3] = 0.3 + Math.random() * 0.3;     // R
        colors[i * 3 + 1] = 0.3 + Math.random() * 0.3; // G
        colors[i * 3 + 2] = 0.7 + Math.random() * 0.3; // B
      }
      
      particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      
      const particleMaterial = new THREE.PointsMaterial({
        size: 0.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.7
      });
      
      const particleSystem = new THREE.Points(particles, particleMaterial);
      scene.add(particleSystem);
      
      // Animate particles
      const originalAnimate = animate;
      animate = function() {
        const positions = particles.attributes.position.array;
        const time = clock.getElapsedTime();
        
        for (let i = 0; i < particleCount; i++) {
          const ix = i * 3;
          const iy = i * 3 + 1;
          const iz = i * 3 + 2;
          
          // Move particles in a swirling pattern
          const x = positions[ix];
          const z = positions[iz];
          
          const angle = Math.atan2(z, x) + 0.01;
          const radius = Math.sqrt(x * x + z * z);
          
          positions[ix] = Math.cos(angle) * radius;
          positions[iz] = Math.sin(angle) * radius;
          
          // Oscillate height
          positions[iy] += Math.sin(time + i * 0.1) * 0.02;
        }
        
        particles.attributes.position.needsUpdate = true;
        
        // Call original animate function
        originalAnimate();
      };
    }
    
    // Function to add weather system if enabled
    function addWeatherSystem() {
      // Simple rain effect
      const rainCount = 1000;
      const rainGeometry = new THREE.BufferGeometry();
      const rainPositions = new Float32Array(rainCount * 3);
      
      for (let i = 0; i < rainCount * 3; i += 3) {
        rainPositions[i] = Math.random() * WORLD_SIZE - WORLD_SIZE / 2;
        rainPositions[i + 1] = Math.random() * 30;
        rainPositions[i + 2] = Math.random() * WORLD_SIZE - WORLD_SIZE / 2;
      }
      
      rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
      
      const rainMaterial = new THREE.PointsMaterial({
        color: 0x9999FF,
        size: 0.1,
        transparent: true,
        opacity: 0.6
      });
      
      const rain = new THREE.Points(rainGeometry, rainMaterial);
      scene.add(rain);
      
      // Animate rain
      const originalAnimate = animate;
      animate = function() {
        const positions = rainGeometry.attributes.position.array;
        
        for (let i = 0; i < rainCount * 3; i += 3) {
          // Move rain down
          positions[i + 1] -= 0.2;
          
          // Reset rain drops that reach the ground
          if (positions[i + 1] < 0) {
            positions[i] = Math.random() * WORLD_SIZE - WORLD_SIZE / 2;
            positions[i + 1] = 30;
            positions[i + 2] = Math.random() * WORLD_SIZE - WORLD_SIZE / 2;
          }
        }
        
        rainGeometry.attributes.position.needsUpdate = true;
        
        // Call original animate function
        originalAnimate();
      };
    }
    `
  }