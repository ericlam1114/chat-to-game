// src/app/lib/game-engine/components/characters/vehicle.js
import { registry } from '../../component-registry';

const vehicleComponent = {
  name: 'vehicle',
  priority: 4,
  dependencies: ['base', 'lighting'],
  modifiesAnimation: true,
  generate: (config = {}) => {
    const type = config.type || 'car'; // 'car', 'spaceship', 'airplane', 'boat'
    const color = config.color || '0xff0000';
    const maxSpeed = config.maxSpeed || 0.2;
    const acceleration = config.acceleration || 0.01;
    
    // Vehicle creation code based on type
    let vehicleCode;
    let controlCode;
    
    switch (type) {
      case 'spaceship':
        vehicleCode = `
// Create spaceship
const vehicle = new THREE.Group();

// Spaceship body
const bodyGeometry = new THREE.ConeGeometry(1, 3, 8);
bodyGeometry.rotateX(-Math.PI / 2);
const bodyMaterial = new THREE.MeshStandardMaterial({ color: ${color} });
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
body.castShadow = true;
vehicle.add(body);

// Spaceship wings
const wingGeometry = new THREE.BoxGeometry(3, 0.2, 1);
const wingMaterial = new THREE.MeshStandardMaterial({ color: ${color} });
const wings = new THREE.Mesh(wingGeometry, wingMaterial);
wings.position.y = 0.2;
wings.castShadow = true;
vehicle.add(wings);

// Spaceship cockpit
const cockpitGeometry = new THREE.SphereGeometry(0.5, 8, 8);
const cockpitMaterial = new THREE.MeshStandardMaterial({ 
  color: 0x88CCFF,
  transparent: true,
  opacity: 0.7
});
const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
cockpit.position.z = -0.5;
cockpit.position.y = 0.3;
vehicle.add(cockpit);

// Engine glow
const engineGeometry = new THREE.CircleGeometry(0.5, 8);
engineGeometry.rotateX(Math.PI);
const engineMaterial = new THREE.MeshBasicMaterial({ 
  color: 0xFF5500, 
  side: THREE.DoubleSide
});
const engine = new THREE.Mesh(engineGeometry, engineMaterial);
engine.position.z = 1.5;
vehicle.add(engine);

// Set initial position
vehicle.position.set(0, 1.5, 0);
scene.add(vehicle);

// Add exhaust particles
const particleCount = 50;
const particleGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
const particleMaterial = new THREE.PointsMaterial({
  color: 0xFF5500,
  size: 0.1,
  transparent: true,
  opacity: 0.8
});

for (let i = 0; i < particleCount; i++) {
  particlePositions[i * 3] = 0;
  particlePositions[i * 3 + 1] = 0;
  particlePositions[i * 3 + 2] = 1.5 + Math.random() * 3;
}

particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
const particles = new THREE.Points(particleGeometry, particleMaterial);
vehicle.add(particles);
`;
        controlCode = `
// Move spaceship based on input
const currentSpeed = vehicle.userData.speed || 0;
const moveDirection = new THREE.Vector3(0, 0, 0);

// Acceleration and deceleration
if (keys.w || keys.ArrowUp) {
  vehicle.userData.speed = Math.min(${maxSpeed}, vehicle.userData.speed + ${acceleration});
} else if (keys.s || keys.ArrowDown) {
  vehicle.userData.speed = Math.max(-${maxSpeed/2}, vehicle.userData.speed - ${acceleration});
} else {
  // Gradually slow down
  if (Math.abs(vehicle.userData.speed) < 0.005) {
    vehicle.userData.speed = 0;
  } else if (vehicle.userData.speed > 0) {
    vehicle.userData.speed -= ${acceleration/2};
  } else {
    vehicle.userData.speed += ${acceleration/2};
  }
}

// Rotation
if (keys.a || keys.ArrowLeft) {
  vehicle.rotation.y += 0.03;
}
if (keys.d || keys.ArrowRight) {
  vehicle.rotation.y -= 0.03;
}

// Apply movement in vehicle's forward direction
const direction = new THREE.Vector3(0, 0, -1);
direction.applyQuaternion(vehicle.quaternion);
direction.multiplyScalar(vehicle.userData.speed);
vehicle.position.add(direction);

// Update exhaust particles
const particlePositions = particles.geometry.attributes.position.array;
for (let i = 0; i < particleCount; i++) {
  particlePositions[i * 3 + 2] += 0.1;
  
  // Reset particle when it gets too far
  if (particlePositions[i * 3 + 2] > 4.5) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 0.2;
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 0.2;
    particlePositions[i * 3 + 2] = 1.5;
  }
}
particles.geometry.attributes.position.needsUpdate = true;

// Update camera position to follow vehicle
camera.position.x = vehicle.position.x - direction.x * 8;
camera.position.y = vehicle.position.y + 3;
camera.position.z = vehicle.position.z - direction.z * 8;
camera.lookAt(vehicle.position);
`;
        break;
        
      case 'airplane':
        vehicleCode = `
// Create airplane
const vehicle = new THREE.Group();

// Fuselage
const fuselageGeometry = new THREE.CylinderGeometry(0.5, 0.5, 4, 8);
fuselageGeometry.rotateZ(Math.PI / 2);
const fuselageMaterial = new THREE.MeshStandardMaterial({ color: ${color} });
const fuselage = new THREE.Mesh(fuselageGeometry, fuselageMaterial);
fuselage.castShadow = true;
vehicle.add(fuselage);

// Wings
const wingGeometry = new THREE.BoxGeometry(0.2, 5, 1);
const wingMaterial = new THREE.MeshStandardMaterial({ color: ${color} });
const wings = new THREE.Mesh(wingGeometry, wingMaterial);
wings.castShadow = true;
vehicle.add(wings);

// Tail
const tailFinGeometry = new THREE.BoxGeometry(1.5, 1.5, 0.2);
const tailFinMaterial = new THREE.MeshStandardMaterial({ color: ${color} });
const tailFin = new THREE.Mesh(tailFinGeometry, tailFinMaterial);
tailFin.position.z = -2;
tailFin.position.y = 0.5;
tailFin.castShadow = true;
vehicle.add(tailFin);

// Horizontal stabilizers
const stabilizerGeometry = new THREE.BoxGeometry(0.2, 2, 0.5);
const stabilizerMaterial = new THREE.MeshStandardMaterial({ color: ${color} });
const stabilizer = new THREE.Mesh(stabilizerGeometry, stabilizerMaterial);
stabilizer.position.z = -1.8;
stabilizer.castShadow = true;
vehicle.add(stabilizer);

// Propeller
const propellerGroup = new THREE.Group();
propellerGroup.position.set(2, 0, 0);

const propellerHubGeometry = new THREE.SphereGeometry(0.2, 8, 8);
const propellerHubMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
const propellerHub = new THREE.Mesh(propellerHubGeometry, propellerHubMaterial);
propellerGroup.add(propellerHub);

const propellerBladeGeometry = new THREE.BoxGeometry(0.1, 2, 0.2);
const propellerBladeMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
const propellerBlade1 = new THREE.Mesh(propellerBladeGeometry, propellerBladeMaterial);
const propellerBlade2 = new THREE.Mesh(propellerBladeGeometry, propellerBladeMaterial);
propellerBlade2.rotation.z = Math.PI / 2;
propellerGroup.add(propellerBlade1);
propellerGroup.add(propellerBlade2);

vehicle.add(propellerGroup);
vehicle.userData.propeller = propellerGroup;

// Set initial position and rotation
vehicle.position.set(0, 10, 0);
vehicle.rotation.y = Math.PI / 2;
scene.add(vehicle);

// Initialize speed and other properties
vehicle.userData.speed = 0;
vehicle.userData.altitude = 10;
vehicle.userData.angle = 0;
`;
        controlCode = `
// Move airplane based on input
const currentSpeed = vehicle.userData.speed || 0;

// Speed control
if (keys.w || keys.ArrowUp) {
  vehicle.userData.speed = Math.min(${maxSpeed}, vehicle.userData.speed + ${acceleration});
} else if (keys.s || keys.ArrowDown) {
  vehicle.userData.speed = Math.max(0, vehicle.userData.speed - ${acceleration});
}

// Turning control (banking)
if (keys.a || keys.ArrowLeft) {
  vehicle.rotation.y += 0.02;
  vehicle.rotation.z = Math.min(0.3, vehicle.rotation.z + 0.01);
} else if (keys.d || keys.ArrowRight) {
  vehicle.rotation.y -= 0.02;
  vehicle.rotation.z = Math.max(-0.3, vehicle.rotation.z - 0.01);
} else {
  // Return to level flight
  if (vehicle.rotation.z > 0.01) {
    vehicle.rotation.z -= 0.01;
  } else if (vehicle.rotation.z < -0.01) {
    vehicle.rotation.z += 0.01;
  } else {
    vehicle.rotation.z = 0;
  }
}

// Altitude control
if (keys[' ']) { // Space key to climb
  vehicle.userData.altitude = Math.min(25, vehicle.userData.altitude + 0.1);
} else if (keys.Control || keys.c) { // Control key to descend
  vehicle.userData.altitude = Math.max(3, vehicle.userData.altitude - 0.1);
}

// Apply movement in airplane's forward direction
const direction = new THREE.Vector3(1, 0, 0);
direction.applyQuaternion(vehicle.quaternion);
direction.multiplyScalar(vehicle.userData.speed);
vehicle.position.add(direction);

// Gradually adjust height to target altitude
if (vehicle.position.y < vehicle.userData.altitude) {
  vehicle.position.y += Math.min(0.1, (vehicle.userData.altitude - vehicle.position.y) * 0.1);
} else if (vehicle.position.y > vehicle.userData.altitude) {
  vehicle.position.y -= Math.min(0.1, (vehicle.position.y - vehicle.userData.altitude) * 0.1);
}

// Rotate propeller
vehicle.userData.propeller.rotation.x += vehicle.userData.speed * 2;

// Update camera position to follow airplane
const cameraOffset = new THREE.Vector3(-5, 2, 0);
cameraOffset.applyQuaternion(vehicle.quaternion);
camera.position.copy(vehicle.position).add(cameraOffset);
camera.lookAt(vehicle.position);
`;
        break;
        
      case 'boat':
        vehicleCode = `
// Create boat
const vehicle = new THREE.Group();

// Hull
const hullGeometry = new THREE.BoxGeometry(4, 1, 1.5);
const hullMaterial = new THREE.MeshStandardMaterial({ color: ${color} });
const hull = new THREE.Mesh(hullGeometry, hullMaterial);
hull.position.y = 0.5;
hull.castShadow = true;
vehicle.add(hull);

// Front point of the boat
const bowGeometry = new THREE.ConeGeometry(0.75, 1.5, 4);
bowGeometry.rotateZ(-Math.PI / 2);
bowGeometry.rotateY(Math.PI / 4);
const bowMaterial = new THREE.MeshStandardMaterial({ color: ${color} });
const bow = new THREE.Mesh(bowGeometry, bowMaterial);
bow.position.set(2.5, 0.5, 0);
bow.castShadow = true;
vehicle.add(bow);

// Cabin
const cabinGeometry = new THREE.BoxGeometry(1.5, 1.2, 1.2);
const cabinMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
cabin.position.set(-0.5, 1.1, 0);
cabin.castShadow = true;
vehicle.add(cabin);

// Flag
const flagPoleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8);
const flagPoleMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
const flagPole = new THREE.Mesh(flagPoleGeometry, flagPoleMaterial);
flagPole.position.set(-1.5, 1.8, 0);
vehicle.add(flagPole);

const flagGeometry = new THREE.PlaneGeometry(0.6, 0.4);
const flagMaterial = new THREE.MeshStandardMaterial({ 
  color: 0x3333FF,
  side: THREE.DoubleSide
});
const flag = new THREE.Mesh(flagGeometry, flagMaterial);
flag.position.set(-1.5, 2.2, 0);
flag.rotation.y = Math.PI / 2;
vehicle.add(flag);

// Set initial position (on water surface)
vehicle.position.set(0, 0, 0);
scene.add(vehicle);

// Initialize vehicle properties
vehicle.userData.speed = 0;
vehicle.userData.turnAngle = 0;`;
        controlCode = `
// Boat movement and physics with water bobbing effect
const currentSpeed = vehicle.userData.speed || 0;

// Acceleration and deceleration
if (keys.w || keys.ArrowUp) {
  vehicle.userData.speed = Math.min(${maxSpeed}, vehicle.userData.speed + ${acceleration});
} else if (keys.s || keys.ArrowDown) {
  vehicle.userData.speed = Math.max(-${maxSpeed/2}, vehicle.userData.speed - ${acceleration});
} else {
  // Gradually slow down (water friction)
  if (Math.abs(vehicle.userData.speed) < 0.005) {
    vehicle.userData.speed = 0;
  } else if (vehicle.userData.speed > 0) {
    vehicle.userData.speed -= ${acceleration/2};
  } else {
    vehicle.userData.speed += ${acceleration/2};
  }
}

// Turning (affected by speed)
const turnFactor = Math.abs(vehicle.userData.speed) / ${maxSpeed} * 0.03;
if (keys.a || keys.ArrowLeft) {
  vehicle.rotation.y += turnFactor;
}
if (keys.d || keys.ArrowRight) {
  vehicle.rotation.y -= turnFactor;
}

// Move boat based on direction and speed
const direction = new THREE.Vector3(0, 0, -1);
direction.applyQuaternion(vehicle.quaternion);
direction.multiplyScalar(vehicle.userData.speed);
vehicle.position.add(direction);

// Simulate water bobbing effect
const time = clock.getElapsedTime();
const bobHeight = Math.sin(time * 1.5) * 0.1;
vehicle.position.y = bobHeight;
vehicle.rotation.x = Math.sin(time * 2) * 0.03;
vehicle.rotation.z = Math.cos(time * 1.7) * 0.02;

// Simulate wake effect behind boat
// (could be enhanced with actual particle system)

// Update camera position to follow boat
const cameraOffset = new THREE.Vector3(0, 5, 10);
cameraOffset.applyQuaternion(vehicle.quaternion);
camera.position.copy(vehicle.position).add(cameraOffset);
camera.lookAt(vehicle.position);

// Animate flag waving
flag.position.z = Math.sin(time * 3) * 0.1;`;
        break;
        
      case 'car':
      default:
        vehicleCode = `
// Create car
const vehicle = new THREE.Group();

// Car body
const bodyGeometry = new THREE.BoxGeometry(2, 0.5, 4);
const bodyMaterial = new THREE.MeshStandardMaterial({ color: ${color} });
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
body.position.y = 0.5;
body.castShadow = true;
vehicle.add(body);

// Car top/cabin
const cabinGeometry = new THREE.BoxGeometry(1.5, 0.5, 2);
const cabinMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
cabin.position.set(0, 1, 0);
cabin.castShadow = true;
vehicle.add(cabin);

// Windows
const windshieldGeometry = new THREE.PlaneGeometry(1.4, 0.5);
const windshieldMaterial = new THREE.MeshStandardMaterial({ 
  color: 0x88CCFF,
  transparent: true,
  opacity: 0.7,
  side: THREE.DoubleSide
});

const frontWindshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial);
frontWindshield.position.set(0, 1, 1);
frontWindshield.rotation.x = Math.PI / 10;
vehicle.add(frontWindshield);

const rearWindshield = new THREE.Mesh(windshieldGeometry, windshieldMaterial);
rearWindshield.position.set(0, 1, -1);
rearWindshield.rotation.x = -Math.PI / 10;
vehicle.add(rearWindshield);

// Wheels
const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
wheelGeometry.rotateZ(Math.PI / 2);
const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });

// Create and position the four wheels
const wheelPositions = [
  [-0.9, 0.4, 1.2],  // Front-left
  [0.9, 0.4, 1.2],   // Front-right
  [-0.9, 0.4, -1.2], // Rear-left
  [0.9, 0.4, -1.2]   // Rear-right
];

const wheels = [];
wheelPositions.forEach((position, index) => {
  const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
  wheel.position.set(...position);
  wheel.castShadow = true;
  vehicle.add(wheel);
  wheels.push(wheel);
});

// Headlights
const headlightGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.1, 8);
headlightGeometry.rotateX(Math.PI / 2);
const headlightMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });

const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
leftHeadlight.position.set(-0.6, 0.5, 2);
vehicle.add(leftHeadlight);

const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
rightHeadlight.position.set(0.6, 0.5, 2);
vehicle.add(rightHeadlight);

// Add headlight glow and lights
const leftLight = new THREE.PointLight(0xFFFFAA, 0.5, 10);
leftLight.position.set(-0.6, 0.5, 2.1);
vehicle.add(leftLight);

const rightLight = new THREE.PointLight(0xFFFFAA, 0.5, 10);
rightLight.position.set(0.6, 0.5, 2.1);
vehicle.add(rightLight);

// Store wheel references for animation
vehicle.userData.wheels = wheels;
vehicle.userData.frontWheels = [wheels[0], wheels[1]];
vehicle.userData.lights = [leftLight, rightLight];

// Set initial position
vehicle.position.set(0, 0, 0);
scene.add(vehicle);

// Initialize vehicle properties
vehicle.userData.speed = 0;
vehicle.userData.turnAngle = 0;
vehicle.userData.lightsOn = false;`;
        controlCode = `
// Move car based on input
const currentSpeed = vehicle.userData.speed || 0;

// Acceleration and deceleration
if (keys.w || keys.ArrowUp) {
  vehicle.userData.speed = Math.min(${maxSpeed}, vehicle.userData.speed + ${acceleration});
} else if (keys.s || keys.ArrowDown) {
  vehicle.userData.speed = Math.max(-${maxSpeed/2}, vehicle.userData.speed - ${acceleration});
} else {
  // Gradually slow down
  if (Math.abs(vehicle.userData.speed) < 0.005) {
    vehicle.userData.speed = 0;
  } else if (vehicle.userData.speed > 0) {
    vehicle.userData.speed -= ${acceleration/2};
  } else {
    vehicle.userData.speed += ${acceleration/2};
  }
}

// Turning (affects turn angle)
const turnSpeed = 0.03;
if (keys.a || keys.ArrowLeft) {
  if (vehicle.userData.speed != 0) {
    vehicle.userData.turnAngle = Math.min(Math.PI/6, vehicle.userData.turnAngle + turnSpeed);
  }
} else if (keys.d || keys.ArrowRight) {
  if (vehicle.userData.speed != 0) {
    vehicle.userData.turnAngle = Math.max(-Math.PI/6, vehicle.userData.turnAngle - turnSpeed);
  }
} else {
  // Return wheels to center position gradually
  if (vehicle.userData.turnAngle > 0.01) {
    vehicle.userData.turnAngle -= turnSpeed;
  } else if (vehicle.userData.turnAngle < -0.01) {
    vehicle.userData.turnAngle += turnSpeed;
  } else {
    vehicle.userData.turnAngle = 0;
  }
}

// Set front wheel turn angle
vehicle.userData.frontWheels.forEach(wheel => {
  wheel.rotation.y = vehicle.userData.turnAngle;
});

// Apply rotation based on speed and turn angle
if (vehicle.userData.speed != 0) {
  vehicle.rotation.y += vehicle.userData.turnAngle * vehicle.userData.speed * 0.1;
}

// Move car based on direction and speed
const direction = new THREE.Vector3(0, 0, -1);
direction.applyQuaternion(vehicle.quaternion);
direction.multiplyScalar(vehicle.userData.speed);
vehicle.position.add(direction);

// Rotate wheels based on speed
const wheelRotation = vehicle.userData.speed * 0.3;
vehicle.userData.wheels.forEach(wheel => {
  wheel.rotation.x += wheelRotation;
});

// Toggle headlights with L key
if (keys.l && !vehicle.userData.lastLKeyState) {
  vehicle.userData.lightsOn = !vehicle.userData.lightsOn;
  vehicle.userData.lights.forEach(light => {
    light.intensity = vehicle.userData.lightsOn ? 1 : 0;
  });
}
vehicle.userData.lastLKeyState = keys.l;

// Update camera to follow car
const cameraOffset = new THREE.Vector3(0, 3, 8);
cameraOffset.applyQuaternion(vehicle.quaternion);
camera.position.copy(vehicle.position).add(cameraOffset);
camera.lookAt(vehicle.position);
`;
        break;
    }
    
    // Initialize vehicle data on creation
    const initCode = `
// Initialize the vehicle
vehicle.userData.speed = 0;

// Vehicle controller setup
document.addEventListener('keydown', (e) => {
  if (e.key === 'l' && !vehicle.userData.lastLKeyState) {
    vehicle.userData.lastLKeyState = true;
  }
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'l') {
    vehicle.userData.lastLKeyState = false;
  }
});
`;

    return {
      code: `
${vehicleCode}
${initCode}`,
      animationCode: controlCode
    };
  }
};

registry.register('vehicle', vehicleComponent);

export default vehicleComponent;