// src/app/lib/game-engine/components/gameplay/collectibles.js
import { registry } from '../../component-registry';

const collectiblesComponent = {
  name: 'collectibles',
  priority: 6,
  dependencies: ['base'],
  modifiesAnimation: true,
  generate: (config = {}) => {
    const type = config.type || 'coin'; // 'coin', 'gem', 'star', 'heart', 'key'
    const count = config.count || 10;
    const distribution = config.distribution || 'random'; // 'random', 'circle', 'grid'
    const animationType = config.animation || 'rotate'; // 'rotate', 'bounce', 'pulse'
    const collectEffect = config.collectEffect || 'simple'; // 'simple', 'particle', 'glow'
    
    let collectibleGeometry;
    let collectibleMaterial;
    
    // Determine collectible appearance based on type
    switch (type) {
      case 'gem':
        collectibleGeometry = `new THREE.OctahedronGeometry(0.5, 0)`;
        collectibleMaterial = `new THREE.MeshStandardMaterial({ 
          color: ${config.color || '0x00FFFF'}, 
          metalness: 0.9, 
          roughness: 0.1,
          transparent: true,
          opacity: 0.9
        })`;
        break;
      case 'star':
        // Custom star geometry
        collectibleGeometry = `(() => {
          const starShape = new THREE.Shape();
          const outerRadius = 0.5;
          const innerRadius = 0.2;
          const spikes = 5;
          
          starShape.moveTo(0, outerRadius);
          
          for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? innerRadius : outerRadius;
            const angle = (Math.PI / spikes) * i;
            starShape.lineTo(Math.sin(angle) * radius, Math.cos(angle) * radius);
          }
          
          const geometry = new THREE.ExtrudeGeometry(starShape, {
            depth: 0.15,
            bevelEnabled: false
          });
          
          return geometry;
        })()`;
        collectibleMaterial = `new THREE.MeshStandardMaterial({ 
          color: ${config.color || '0xFFD700'}, 
          metalness: 0.5, 
          roughness: 0.2
        })`;
        break;
      case 'heart':
        // Custom heart geometry
        collectibleGeometry = `(() => {
          const heartShape = new THREE.Shape();
          
          heartShape.moveTo(0, 0.2);
          heartShape.bezierCurveTo(0, 0.4, 0.25, 0.5, 0.25, 0.25);
          heartShape.bezierCurveTo(0.25, 0.1, 0, 0.1, 0, 0.2);
          heartShape.bezierCurveTo(0, 0.1, -0.25, 0.1, -0.25, 0.25);
          heartShape.bezierCurveTo(-0.25, 0.5, 0, 0.4, 0, 0.2);
          
          const geometry = new THREE.ExtrudeGeometry(heartShape, {
            depth: 0.15,
            bevelEnabled: false
          });
          
          return geometry;
        })()`;
        collectibleMaterial = `new THREE.MeshStandardMaterial({ 
          color: ${config.color || '0xFF0066'}, 
          metalness: 0.2, 
          roughness: 0.5
        })`;
        break;
      case 'key':
        // Key using compound geometry
        collectibleGeometry = `(() => {
          const keyGroup = new THREE.Group();
          
          // Key head
          const headGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.1, 16);
          const headMesh = new THREE.Mesh(headGeometry, new THREE.MeshStandardMaterial({ 
            color: ${config.color || '0xDAA520'}, 
            metalness: 0.8, 
            roughness: 0.2
          }));
          headMesh.rotation.x = Math.PI / 2;
          
          // Key shaft
          const shaftGeometry = new THREE.BoxGeometry(0.1, 0.5, 0.1);
          const shaftMesh = new THREE.Mesh(shaftGeometry, new THREE.MeshStandardMaterial({ 
            color: ${config.color || '0xDAA520'}, 
            metalness: 0.8, 
            roughness: 0.2
          }));
          shaftMesh.position.y = -0.3;
          
          // Key teeth
          const toothGeometry1 = new THREE.BoxGeometry(0.25, 0.1, 0.1);
          const toothMesh1 = new THREE.Mesh(toothGeometry1, new THREE.MeshStandardMaterial({ 
            color: ${config.color || '0xDAA520'}, 
            metalness: 0.8, 
            roughness: 0.2
          }));
          toothMesh1.position.set(0.15, -0.5, 0);
          
          const toothGeometry2 = new THREE.BoxGeometry(0.25, 0.1, 0.1);
          const toothMesh2 = new THREE.Mesh(toothGeometry2, new THREE.MeshStandardMaterial({ 
            color: ${config.color || '0xDAA520'}, 
            metalness: 0.8, 
            roughness: 0.2
          }));
          toothMesh2.position.set(0.15, -0.3, 0);
          
          keyGroup.add(headMesh);
          keyGroup.add(shaftMesh);
          keyGroup.add(toothMesh1);
          keyGroup.add(toothMesh2);
          
          // Fake it as a geometry for consistency with the code structure
          keyGroup.isGroup = true;
          
          return keyGroup;
        })()`;
        collectibleMaterial = `null`; // Materials handled inside the geometry function
        break;
      case 'coin':
      default:
        collectibleGeometry = `new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16)`;
        collectibleMaterial = `new THREE.MeshStandardMaterial({ 
          color: ${config.color || '0xFFD700'}, 
          metalness: 0.8, 
          roughness: 0.2
        })`;
        break;
    }
    
    // Distribution patterns
    let distributionCode;
    switch (distribution) {
      case 'circle':
        distributionCode = `
        // Position in a circle pattern
        const radius = ${config.radius || 15};
        const angle = (i / ${count}) * Math.PI * 2;
        
        collectible.position.set(
          Math.cos(angle) * radius,
          ${config.height || 1} + Math.sin(i) * 0.5,
          Math.sin(angle) * radius
        );`;
        break;
      case 'grid':
        distributionCode = `
        // Position in a grid pattern
        const gridSize = Math.ceil(Math.sqrt(${count}));
        const spacing = ${config.spacing || 3};
        const offset = (gridSize * spacing) / 2;
        
        const row = Math.floor(i / gridSize);
        const col = i % gridSize;
        
        collectible.position.set(
          col * spacing - offset,
          ${config.height || 1} + Math.sin(i) * 0.5,
          row * spacing - offset
        );`;
        break;
      case 'random':
      default:
        distributionCode = `
        // Position randomly
        const angle = Math.random() * Math.PI * 2;
        const distance = ${config.minDistance || 5} + Math.random() * ${config.maxDistance || 15};
        
        collectible.position.set(
          Math.cos(angle) * distance,
          ${config.height || 1} + Math.sin(i) * 0.5,
          Math.sin(angle) * distance
        );`;
        break;
    }
    
    // Animation code
    let animationCode;
    switch (animationType) {
      case 'bounce':
        animationCode = `
        // Bounce animation
        collectible.position.y = initialY + Math.sin(time * 3 + i * 0.5) * 0.3;`;
        break;
      case 'pulse':
        animationCode = `
        // Pulse animation (scale)
        const scale = 1 + Math.sin(time * 2 + i * 0.3) * 0.2;
        collectible.scale.set(scale, scale, scale);`;
        break;
      case 'rotate':
      default:
        animationCode = `
        // Rotate animation
        collectible.rotation.y = time * 2 + i * 0.1;`;
        if (type === 'coin') {
          animationCode += `
        collectible.rotation.x = Math.PI / 2; // Keep coin facing up`;
        }
        break;
    }
    
    // Collection effect
    let collectEffectCode;
    switch (collectEffect) {
      case 'particle':
        collectEffectCode = `
          // Create particle explosion effect
          const particleCount = 10;
          const particleGeometry = new THREE.BufferGeometry();
          const particlePositions = new Float32Array(particleCount * 3);
          
          for (let j = 0; j < particleCount * 3; j += 3) {
            particlePositions[j] = collectible.position.x;
            particlePositions[j + 1] = collectible.position.y;
            particlePositions[j + 2] = collectible.position.z;
          }
          
          particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
          
          const particleMaterial = new THREE.PointsMaterial({
            color: collectible.material.color,
            size: 0.2,
            transparent: true,
            opacity: 0.8
          });
          
          const particles = new THREE.Points(particleGeometry, particleMaterial);
          scene.add(particles);
          
          // Store initial positions and creation time
          const particleData = {
            mesh: particles,
            positions: particlePositions,
            initialPositions: collectible.position.clone(),
            creationTime: time,
            velocities: []
          };
          
          // Generate random velocities for particles
          for (let j = 0; j < particleCount; j++) {
            particleData.velocities.push({
              x: (Math.random() - 0.5) * 0.1,
              y: Math.random() * 0.1 + 0.05,
              z: (Math.random() - 0.5) * 0.1
            });
          }
          
          collectionParticles.push(particleData);`;
        break;
      case 'glow':
        collectEffectCode = `
          // Create glow effect
          const glowGeometry = new THREE.SphereGeometry(1, 16, 16);
          const glowMaterial = new THREE.MeshBasicMaterial({
            color: collectible.material.color,
            transparent: true,
            opacity: 0.7
          });
          
          const glow = new THREE.Mesh(glowGeometry, glowMaterial);
          glow.position.copy(collectible.position);
          scene.add(glow);
          
          // Store glow data
          const glowData = {
            mesh: glow,
            creationTime: time,
            initialScale: 0.5
          };
          
          collectionGlows.push(glowData);`;
        break;
      case 'simple':
      default:
        collectEffectCode = `
          // Simple collection effect (just remove the collectible)`;
        break;
    }
    
    return {
      code: `
// Add collectibles
const collectibles = [];
const collectiblesHitboxes = [];
let score = 0;
const collectionDistance = ${config.collectionDistance || 1.5};
${collectEffect !== 'simple' ? `const collection${collectEffect === 'particle' ? 'Particles' : 'Glows'} = [];` : ''}

// Create collectibles
for (let i = 0; i < ${count}; i++) {
  ${type === 'key' ? 
    `// For key type, which returns a group
    const collectible = ${collectibleGeometry};
    collectible.userData.initialY = ${config.height || 1} + Math.sin(i) * 0.5;` : 
    `// Create collectible mesh
    const collectibleGeometry = ${collectibleGeometry};
    const collectibleMaterial = ${collectibleMaterial};
    const collectible = new THREE.Mesh(collectibleGeometry, collectibleMaterial);
    collectible.userData.initialY = ${config.height || 1} + Math.sin(i) * 0.5;`
  }
  
  // Set initial position
  ${distributionCode}
  
  // Store the original position for animation
  collectible.userData.initialPosition = collectible.position.clone();
  collectible.userData.index = i;
  
  // Add collectible to scene
  scene.add(collectible);
  collectibles.push(collectible);
  
  // Create invisible hitbox for better collision detection
  const hitboxGeometry = new THREE.SphereGeometry(${config.collectionDistance || 1.5}, 8, 8);
  const hitboxMaterial = new THREE.MeshBasicMaterial({ 
    visible: false
  });
  const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
  hitbox.position.copy(collectible.position);
  scene.add(hitbox);
  collectiblesHitboxes.push(hitbox);
}

// Create a scoring display
const scoreElement = document.createElement('div');
scoreElement.style.position = 'absolute';
scoreElement.style.top = '20px';
scoreElement.style.left = '20px';
scoreElement.style.color = 'white';
scoreElement.style.fontFamily = 'Arial, sans-serif';
scoreElement.style.fontSize = '24px';
scoreElement.style.fontWeight = 'bold';
scoreElement.style.textShadow = '2px 2px 4px rgba(0, 0, 0, 0.5)';
scoreElement.innerHTML = 'Score: 0';
container.appendChild(scoreElement);
`,
      animationCode: `
// Animate collectibles
const time = clock.getElapsedTime();

// Handle collection particle or glow effects if enabled
${collectEffect === 'particle' ? `
if (collectionParticles.length > 0) {
  for (let i = collectionParticles.length - 1; i >= 0; i--) {
    const particleData = collectionParticles[i];
    const particleAge = time - particleData.creationTime;
    
    // Remove particles after 1 second
    if (particleAge > 1) {
      scene.remove(particleData.mesh);
      collectionParticles.splice(i, 1);
      continue;
    }
    
    // Animate particles
    const positions = particleData.positions;
    for (let j = 0; j < positions.length; j += 3) {
      const index = j / 3;
      const velocity = particleData.velocities[index];
      
      positions[j] += velocity.x;
      positions[j + 1] += velocity.y - particleAge * 0.1; // Add gravity
      positions[j + 2] += velocity.z;
    }
    
    particleData.mesh.geometry.attributes.position.needsUpdate = true;
    
    // Fade out
    particleData.mesh.material.opacity = 1 - particleAge;
  }
}` : ''}

${collectEffect === 'glow' ? `
if (collectionGlows.length > 0) {
  for (let i = collectionGlows.length - 1; i >= 0; i--) {
    const glowData = collectionGlows[i];
    const glowAge = time - glowData.creationTime;
    
    // Remove glow after 0.5 seconds
    if (glowAge > 0.5) {
      scene.remove(glowData.mesh);
      collectionGlows.splice(i, 1);
      continue;
    }
    
    // Expand and fade out
    const scale = glowData.initialScale + glowAge * 2;
    glowData.mesh.scale.set(scale, scale, scale);
    glowData.mesh.material.opacity = 0.7 * (1 - glowAge * 2);
  }
}` : ''}

// Animate each collectible
collectibles.forEach((collectible, i) => {
  if (collectible.visible) {
    // Apply animation based on config
    const initialY = collectible.userData.initialY;
    ${animationCode}
  }
  
  // Update hitbox position to match collectible
  collectiblesHitboxes[i].position.copy(collectible.position);
});

// Check collision between player/vehicle and collectibles
// This assumes that there's a 'character' or 'vehicle' in the scene
let playerObject;
if (typeof character !== 'undefined') {
  playerObject = character;
} else if (typeof vehicle !== 'undefined') {
  playerObject = vehicle;
}

if (playerObject) {
  for (let i = 0; i < collectibles.length; i++) {
    // Skip already collected items
    if (!collectibles[i].visible) continue;
    
    // Check if player is within collection distance
    const distance = playerObject.position.distanceTo(collectibles[i].position);
    if (distance < collectionDistance) {
      // Mark as collected
      collectibles[i].visible = false;
      collectiblesHitboxes[i].visible = false;
      
      // Update score
      score += ${config.pointValue || 10};
      scoreElement.innerHTML = 'Score: ' + score;
      
      // Play collection sound if available
      if (typeof collectSound !== 'undefined') {
        collectSound.play();
      }
      
      ${collectEffectCode}
    }
  }
}

// Check if all collectibles have been collected
const allCollected = collectibles.every(c => !c.visible);
if (allCollected && typeof onAllCollected === 'function') {
  onAllCollected();
}
`
    };
  }
};

registry.register('collectibles', collectiblesComponent);

export default collectiblesComponent;