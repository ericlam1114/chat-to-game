// src/app/lib/game-engine/components/gameplay/enemies.js
import { registry } from '../../component-registry';

const enemiesComponent = {
  name: 'enemies',
  priority: 7,
  dependencies: ['base'],
  modifiesAnimation: true,
  generate: (config = {}) => {
    // Enemy configuration options
    const type = config.type || 'basic'; // 'basic', 'flying', 'patrol', 'boss'
    const count = config.count || 5;
    const speed = config.speed || 0.05;
    const health = config.health || 3;
    const color = config.color || '0xff0000';
    const damage = config.damage || 1;
    const detectionRadius = config.detectionRadius || 15;
    const patrolRadius = config.patrolRadius || 10;
    
    // Enemy type-specific code
    let enemyCreationCode;
    let enemyBehaviorCode;
    
    switch (type) {
      case 'flying':
        enemyCreationCode = `
        // Create flying enemy
        const bodyGeometry = new THREE.SphereGeometry(0.7, 8, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: ${color} });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        
        // Add wings
        const wingGeometry = new THREE.BoxGeometry(2, 0.1, 0.5);
        const wingMaterial = new THREE.MeshStandardMaterial({ color: ${color} });
        const wings = new THREE.Mesh(wingGeometry, wingMaterial);
        wings.position.set(0, 0, 0);
        wings.castShadow = true;
        
        // Add eye glow
        const eyeGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.8 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.3, 0.2, -0.5);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.3, 0.2, -0.5);
        
        // Create enemy group
        const enemy = new THREE.Group();
        enemy.add(body);
        enemy.add(wings);
        enemy.add(leftEye);
        enemy.add(rightEye);
        
        // Set initial position (in the air)
        const angle = Math.random() * Math.PI * 2;
        const radius = ${patrolRadius} + Math.random() * 10;
        enemy.position.set(
          Math.cos(angle) * radius,
          5 + Math.random() * 5, // Flying height
          Math.sin(angle) * radius
        );
        
        // Initialize enemy properties
        enemy.userData.health = ${health};
        enemy.userData.damage = ${damage};
        enemy.userData.speed = ${speed} * (0.8 + Math.random() * 0.4); // Vary speed slightly
        enemy.userData.detectionRadius = ${detectionRadius};
        enemy.userData.initialPosition = enemy.position.clone();
        enemy.userData.initialHeight = enemy.position.y;
        enemy.userData.state = 'patrol';
        enemy.userData.patrolAngle = Math.random() * Math.PI * 2;
        
        scene.add(enemy);
        enemies.push(enemy);`;
        
        enemyBehaviorCode = `
        // Check distance to player
        const distanceToPlayer = enemy.position.distanceTo(player.position);
        
        // Flying enemy behavior
        if (distanceToPlayer < enemy.userData.detectionRadius) {
          // Chase player if detected
          enemy.userData.state = 'chase';
          
          // Direction to player
          const direction = new THREE.Vector3();
          direction.subVectors(player.position, enemy.position).normalize();
          
          // Move towards player
          enemy.position.x += direction.x * enemy.userData.speed;
          enemy.position.z += direction.z * enemy.userData.speed;
          
          // Maintain some height above the player
          const targetHeight = player.position.y + 3;
          if (enemy.position.y < targetHeight) {
            enemy.position.y += enemy.userData.speed;
          } else if (enemy.position.y > targetHeight + 2) {
            enemy.position.y -= enemy.userData.speed;
          }
          
          // Rotate to face player
          enemy.lookAt(player.position);
          
          // Flap wings
          const wing = enemy.children[1]; // Wings are the second child
          wing.rotation.z = Math.sin(time * 10) * 0.3;
        } else {
          // Return to patrolling
          enemy.userData.state = 'patrol';
          
          // Patrol in a circle
          enemy.userData.patrolAngle += 0.01;
          const patrolRadius = ${patrolRadius};
          const targetX = Math.cos(enemy.userData.patrolAngle) * patrolRadius;
          const targetZ = Math.sin(enemy.userData.patrolAngle) * patrolRadius;
          
          // Move towards patrol point
          const patrolPoint = new THREE.Vector3(targetX, enemy.userData.initialHeight, targetZ);
          const directionToPatrol = new THREE.Vector3();
          directionToPatrol.subVectors(patrolPoint, enemy.position).normalize();
          
          enemy.position.x += directionToPatrol.x * enemy.userData.speed * 0.5;
          enemy.position.z += directionToPatrol.z * enemy.userData.speed * 0.5;
          
          // Gradually return to initial height
          if (Math.abs(enemy.position.y - enemy.userData.initialHeight) > 0.1) {
            if (enemy.position.y < enemy.userData.initialHeight) {
              enemy.position.y += enemy.userData.speed * 0.5;
            } else {
              enemy.position.y -= enemy.userData.speed * 0.5;
            }
          }
          
          // Rotate to face direction of movement
          if (directionToPatrol.length() > 0.1) {
            const lookAtPoint = new THREE.Vector3(
              enemy.position.x + directionToPatrol.x * 10,
              enemy.position.y,
              enemy.position.z + directionToPatrol.z * 10
            );
            enemy.lookAt(lookAtPoint);
          }
          
          // Flap wings
          const wing = enemy.children[1];
          wing.rotation.z = Math.sin(time * 8) * 0.2;
        }
        
        // Make eyes glow
        const leftEye = enemy.children[2];
        const rightEye = enemy.children[3];
        
        // Pulse the glow when chasing
        if (enemy.userData.state === 'chase') {
          const glowIntensity = 0.8 + Math.sin(time * 10) * 0.2;
          leftEye.material.opacity = glowIntensity;
          rightEye.material.opacity = glowIntensity;
        } else {
          leftEye.material.opacity = 0.8;
          rightEye.material.opacity = 0.8;
        }`;
        break;
        
      case 'patrol':
        enemyCreationCode = `
        // Create patrolling enemy (guard)
        const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 8);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: ${color} });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1;
        body.castShadow = true;
        
        // Add helmet
        const helmetGeometry = new THREE.CylinderGeometry(0.55, 0.5, 0.5, 8);
        const helmetMaterial = new THREE.MeshStandardMaterial({ color: 0x444444 });
        const helmet = new THREE.Mesh(helmetGeometry, helmetMaterial);
        helmet.position.y = 2.2;
        helmet.castShadow = true;
        
        // Add spear/weapon
        const weaponGeometry = new THREE.CylinderGeometry(0.05, 0.05, 3, 8);
        const weaponMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const weapon = new THREE.Mesh(weaponGeometry, weaponMaterial);
        weapon.rotation.x = Math.PI / 2;
        weapon.position.set(0.7, 1.5, 0);
        weapon.castShadow = true;
        
        // Create enemy group
        const enemy = new THREE.Group();
        enemy.add(body);
        enemy.add(helmet);
        enemy.add(weapon);
        
        // Create patrol path (3-4 points in a small area)
        const pathPoints = [];
        const centerX = Math.random() * 30 - 15;
        const centerZ = Math.random() * 30 - 15;
        const pathPointCount = 3 + Math.floor(Math.random() * 2);
        
        for (let p = 0; p < pathPointCount; p++) {
          const angle = (p / pathPointCount) * Math.PI * 2;
          const x = centerX + Math.cos(angle) * 5;
          const z = centerZ + Math.sin(angle) * 5;
          pathPoints.push(new THREE.Vector3(x, 0, z));
        }
        
        // Set initial position
        enemy.position.copy(pathPoints[0]);
        
        // Initialize enemy properties
        enemy.userData.health = ${health};
        enemy.userData.damage = ${damage};
        enemy.userData.speed = ${speed} * (0.8 + Math.random() * 0.4);
        enemy.userData.detectionRadius = ${detectionRadius};
        enemy.userData.state = 'patrol';
        enemy.userData.patrolPath = pathPoints;
        enemy.userData.currentPathIndex = 0;
        enemy.userData.waitTime = 0;
        
        scene.add(enemy);
        enemies.push(enemy);`;
        
        enemyBehaviorCode = `
        // Check distance to player
        const distanceToPlayer = enemy.position.distanceTo(player.position);
        
        // Patrol enemy behavior
        if (distanceToPlayer < enemy.userData.detectionRadius) {
          // Chase player if detected
          enemy.userData.state = 'chase';
          
          // Direction to player
          const direction = new THREE.Vector3();
          direction.subVectors(player.position, enemy.position).normalize();
          
          // Move towards player
          enemy.position.x += direction.x * enemy.userData.speed;
          enemy.position.z += direction.z * enemy.userData.speed;
          
          // Rotate to face player
          enemy.lookAt(new THREE.Vector3(player.position.x, enemy.position.y, player.position.z));
          
          // Reset patrol wait time
          enemy.userData.waitTime = 0;
        } else {
          // Return to patrolling
          enemy.userData.state = 'patrol';
          
          // Get current patrol point
          const currentPoint = enemy.userData.patrolPath[enemy.userData.currentPathIndex];
          
          // Check if we need to wait at the current point
          if (enemy.userData.waitTime > 0) {
            enemy.userData.waitTime -= deltaTime;
            
            // Look around while waiting
            enemy.rotation.y += deltaTime * 0.5;
          } else {
            // Calculate distance to current patrol point
            const distanceToPoint = enemy.position.distanceTo(currentPoint);
            
            // If close enough to point, move to next one
            if (distanceToPoint < 0.5) {
              enemy.userData.currentPathIndex = (enemy.userData.currentPathIndex + 1) % enemy.userData.patrolPath.length;
              enemy.userData.waitTime = 1 + Math.random() * 2; // Wait 1-3 seconds
            } else {
              // Move towards point
              const direction = new THREE.Vector3();
              direction.subVectors(currentPoint, enemy.position).normalize();
              
              enemy.position.x += direction.x * enemy.userData.speed * 0.5;
              enemy.position.z += direction.z * enemy.userData.speed * 0.5;
              
              // Rotate to face direction of movement
              enemy.lookAt(new THREE.Vector3(currentPoint.x, enemy.position.y, currentPoint.z));
            }
          }
        }`;
        break;
        
      case 'boss':
        enemyCreationCode = `
        // Only create one boss enemy
        const count = 1;
        
        // Create boss enemy (larger and more detailed)
        const bodyGeometry = new THREE.BoxGeometry(3, 3, 3);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: ${color} });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.5;
        body.castShadow = true;
        
        // Add spike details
        const spikeGeometry = new THREE.ConeGeometry(0.3, 1, 4);
        const spikeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
        
        // Add multiple spikes on top
        for (let s = 0; s < 5; s++) {
          const spike = new THREE.Mesh(spikeGeometry, spikeMaterial);
          const angle = (s / 5) * Math.PI * 2;
          spike.position.set(
            Math.cos(angle) * 0.8,
            3,
            Math.sin(angle) * 0.8
          );
          spike.castShadow = true;
          body.add(spike);
        }
        
        // Add glowing eyes
        const eyeGeometry = new THREE.SphereGeometry(0.3, 8, 8);
        const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, transparent: true, opacity: 0.9 });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.7, 0.7, -1.5);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.7, 0.7, -1.5);
        
        // Create enemy group
        const enemy = new THREE.Group();
        enemy.add(body);
        enemy.add(leftEye);
        enemy.add(rightEye);
        
        // Add aura/glow effect
        const auraGeometry = new THREE.SphereGeometry(2, 16, 16);
        const auraMaterial = new THREE.MeshBasicMaterial({
          color: ${color},
          transparent: true,
          opacity: 0.2,
          side: THREE.DoubleSide
        });
        const aura = new THREE.Mesh(auraGeometry, auraMaterial);
        aura.scale.set(1.2, 1.2, 1.2);
        enemy.add(aura);
        
        // Set initial position
        enemy.position.set(0, 0, -${patrolRadius});
        
        // Initialize boss properties (stronger than regular enemies)
        enemy.userData.health = ${health} * 5;
        enemy.userData.maxHealth = ${health} * 5;
        enemy.userData.damage = ${damage} * 2;
        enemy.userData.speed = ${speed} * 0.9; // Slightly slower but stronger
        enemy.userData.detectionRadius = ${detectionRadius} * 1.5;
        enemy.userData.state = 'idle';
        enemy.userData.attackCooldown = 0;
        enemy.userData.attackRange = 5;
        enemy.userData.aura = aura;
        
        scene.add(enemy);
        enemies.push(enemy);
        
        // Create a health bar for the boss
        const healthBarContainer = document.createElement('div');
        healthBarContainer.style.position = 'absolute';
        healthBarContainer.style.bottom = '20px';
        healthBarContainer.style.left = '50%';
        healthBarContainer.style.transform = 'translateX(-50%)';
        healthBarContainer.style.width = '300px';
        healthBarContainer.style.height = '20px';
        healthBarContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        healthBarContainer.style.border = '2px solid #000';
        healthBarContainer.style.borderRadius = '10px';
        healthBarContainer.style.overflow = 'hidden';
        healthBarContainer.style.display = 'none'; // Hidden initially
        
        const healthBar = document.createElement('div');
        healthBar.style.width = '100%';
        healthBar.style.height = '100%';
        healthBar.style.backgroundColor = '#ff0000';
        healthBar.style.transition = 'width 0.3s';
        
        healthBarContainer.appendChild(healthBar);
        container.appendChild(healthBarContainer);
        
        // Store reference to health bar
        enemy.userData.healthBar = healthBar;
        enemy.userData.healthBarContainer = healthBarContainer;`;
        
        enemyBehaviorCode = `
        // Check distance to player
        const distanceToPlayer = enemy.position.distanceTo(player.position);
        
        // Boss enemy behavior
        if (enemy.userData.state === 'idle') {
          // Activate when player gets close
          if (distanceToPlayer < enemy.userData.detectionRadius) {
            enemy.userData.state = 'active';
            enemy.userData.healthBarContainer.style.display = 'block'; // Show health bar
            
            // Maybe add dramatic effect here
            const spotlight = new THREE.SpotLight(0xff0000, 1, 30, Math.PI / 6, 0.5, 2);
            spotlight.position.set(enemy.position.x, 20, enemy.position.z);
            spotlight.target = enemy;
            scene.add(spotlight);
            enemy.userData.spotlight = spotlight;
          } else {
            // Slow rotation while idle
            enemy.rotation.y += deltaTime * 0.2;
          }
        } else if (enemy.userData.state === 'active') {
          // Boss active behavior
          
          // Attack cooldown
          if (enemy.userData.attackCooldown > 0) {
            enemy.userData.attackCooldown -= deltaTime;
          }
          
          // Chase player
          if (distanceToPlayer > enemy.userData.attackRange) {
            // Move towards player
            const direction = new THREE.Vector3();
            direction.subVectors(player.position, enemy.position).normalize();
            
            enemy.position.x += direction.x * enemy.userData.speed;
            enemy.position.z += direction.z * enemy.userData.speed;
            
            // Rotate to face player
            enemy.lookAt(new THREE.Vector3(player.position.x, enemy.position.y, player.position.z));
          } else {
            // In attack range
            if (enemy.userData.attackCooldown <= 0) {
              // Perform attack
              enemy.userData.attackCooldown = 2; // Attack every 2 seconds
              
              // Attack animation
              const originalScale = enemy.scale.clone();
              enemy.scale.multiplyScalar(1.2);
              
              // Reset scale after a short time
              setTimeout(() => {
                if (enemy && enemy.scale) { // Check if enemy still exists
                  enemy.scale.copy(originalScale);
                }
              }, 200);
              
              // Deal damage to player if they have health
              if (player.userData.health) {
                player.userData.health -= enemy.userData.damage;
                // Player hit effect could be added here
              }
            }
          }
          
          // Pulse aura
          const aura = enemy.userData.aura;
          const pulseScale = 1.2 + Math.sin(time * 3) * 0.1;
          aura.scale.set(pulseScale, pulseScale, pulseScale);
          
          // Pulse eye glow
          const leftEye = enemy.children[1];
          const rightEye = enemy.children[2];
          
          const glowIntensity = 0.9 + Math.sin(time * 5) * 0.1;
          leftEye.material.opacity = glowIntensity;
          rightEye.material.opacity = glowIntensity;
          
          // Update health bar
          const healthPercentage = (enemy.userData.health / enemy.userData.maxHealth) * 100;
          enemy.userData.healthBar.style.width = healthPercentage + '%';
        }
        
        // Update spotlight if it exists
        if (enemy.userData.spotlight) {
          enemy.userData.spotlight.position.set(enemy.position.x, 20, enemy.position.z);
        }`;
        break;
        
      case 'basic':
      default:
        enemyCreationCode = `
        // Create basic enemy
        const geometry = new THREE.BoxGeometry(1, 2, 1);
        const material = new THREE.MeshStandardMaterial({ color: ${color} });
        const enemy = new THREE.Mesh(geometry, material);
        
        // Set random initial position
        const angle = Math.random() * Math.PI * 2;
        const radius = ${patrolRadius} + Math.random() * 10;
        enemy.position.set(
          Math.cos(angle) * radius,
          1, // On the ground
          Math.sin(angle) * radius
        );
        
        enemy.castShadow = true;
        
        // Initialize enemy properties
        enemy.userData.health = ${health};
        enemy.userData.damage = ${damage};
        enemy.userData.speed = ${speed} * (0.8 + Math.random() * 0.4); // Vary speed slightly
        enemy.userData.detectionRadius = ${detectionRadius};
        enemy.userData.state = 'wander';
        enemy.userData.wanderAngle = Math.random() * Math.PI * 2;
        enemy.userData.wanderTime = 0;
        
        scene.add(enemy);
        enemies.push(enemy);`;
        
        enemyBehaviorCode = `
        // Check distance to player
        const distanceToPlayer = enemy.position.distanceTo(player.position);
        
        // Basic enemy behavior
        if (distanceToPlayer < enemy.userData.detectionRadius) {
          // Chase player if detected
          enemy.userData.state = 'chase';
          
          // Direction to player
          const direction = new THREE.Vector3();
          direction.subVectors(player.position, enemy.position).normalize();
          
          // Move towards player
          enemy.position.x += direction.x * enemy.userData.speed;
          enemy.position.z += direction.z * enemy.userData.speed;
          
          // Rotate to face player
          enemy.lookAt(new THREE.Vector3(player.position.x, enemy.position.y, player.position.z));
        } else {
          // Return to wandering
          enemy.userData.state = 'wander';
          
          // Update wander time
          enemy.userData.wanderTime += deltaTime;
          
          // Change direction occasionally
          if (enemy.userData.wanderTime > 3) {
            enemy.userData.wanderAngle = Math.random() * Math.PI * 2;
            enemy.userData.wanderTime = 0;
          }
          
          // Move in wander direction
          const direction = new THREE.Vector3(
            Math.cos(enemy.userData.wanderAngle),
            0,
            Math.sin(enemy.userData.wanderAngle)
          );
          
          enemy.position.x += direction.x * enemy.userData.speed * 0.5;
          enemy.position.z += direction.z * enemy.userData.speed * 0.5;
          
          // Rotate to face direction of movement
          enemy.lookAt(new THREE.Vector3(
            enemy.position.x + direction.x,
            enemy.position.y,
            enemy.position.z + direction.z
          ));
        }`;
        break;
    }
    
    return {
      code: `
// Add enemies
const enemies = [];
const playerDamageTime = 0.5; // Time between damage instances
let lastDamageTime = 0;

// Create enemies
for (let i = 0; i < ${type === 'boss' ? 1 : count}; i++) {
  ${enemyCreationCode}
}

// Create collision meshes for enemies (for collision detection)
const enemyColliders = enemies.map(enemy => {
  const colliderGeometry = new THREE.SphereGeometry(1, 8, 8);
  const colliderMaterial = new THREE.MeshBasicMaterial({
    visible: false
  });
  const collider = new THREE.Mesh(colliderGeometry, colliderMaterial);
  collider.position.copy(enemy.position);
  scene.add(collider);
  return collider;
});

`,
      animationCode: `
// Update enemies
const time = clock.getElapsedTime();
const deltaTime = clock.getDelta();

// Get player object (character or vehicle)
let player;
if (typeof character !== 'undefined') {
  player = character;
} else if (typeof vehicle !== 'undefined') {
  player = vehicle;
}

if (player) {
  // Check if enough time has passed since last damage
  lastDamageTime -= deltaTime;
  
  // Update each enemy
  enemies.forEach((enemy, index) => {
    // Skip if enemy is dead
    if (!enemy.visible) return;
    
    ${enemyBehaviorCode}
    
    // Update collider position
    enemyColliders[index].position.copy(enemy.position);
    
    // Check for collision with player
    const distanceToPlayer = enemy.position.distanceTo(player.position);
    
    // Deal damage to player if colliding and cooldown is complete
    if (distanceToPlayer < 2 && lastDamageTime <= 0) {
      // Apply damage to player if it has health system
      if (player.userData.health !== undefined) {
        player.userData.health -= enemy.userData.damage;
        
        // Show damage effect
        player.visible = false;
        setTimeout(() => {
          if (player) player.visible = true;
        }, 100);
        
        setTimeout(() => {
          if (player) player.visible = false;
        }, 200);
        
        setTimeout(() => {
          if (player) player.visible = true;
        }, 300);
        
        // Damage cooldown
        lastDamageTime = playerDamageTime;
      }
    }
  });
  
  // Handle player attacks
  // This assumes there's some way for the player to attack
  // For example, with a key press (e.g., Space)
  if (keys[' '] && player.userData.attackCooldown <= 0) {
    // Set attack cooldown
    player.userData.attackCooldown = player.userData.attackSpeed || 0.5;
    
    // Attack animation could be added here
    
    // Check for enemies in attack range
    enemies.forEach(enemy => {
      if (!enemy.visible) return;
      
      const distanceToEnemy = player.position.distanceTo(enemy.position);
      const attackRange = player.userData.attackRange || 2.5;
      
      if (distanceToEnemy < attackRange) {
        // Damage enemy
        enemy.userData.health -= player.userData.attackDamage || 1;
        
        // Check if enemy defeated
        if (enemy.userData.health <= 0) {
          enemy.visible = false;
          
          // Hide collider too
          const index = enemies.indexOf(enemy);
          if (index >= 0) {
            enemyColliders[index].visible = false;
          }
          
          // Hide health bar for boss
          if (enemy.userData.healthBarContainer) {
            enemy.userData.healthBarContainer.style.display = 'none';
          }
        }
      }
    });
  }
  
  // Update player attack cooldown
  if (player.userData.attackCooldown > 0) {
    player.userData.attackCooldown -= deltaTime;
  }
}
`
    };
  }
};

registry.register('enemies', enemiesComponent);

export default enemiesComponent;