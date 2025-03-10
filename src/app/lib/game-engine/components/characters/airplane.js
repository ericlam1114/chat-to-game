// src/app/lib/game-engine/components/characters/airplane.js
import { registry } from '../../component-registry';

const airplaneComponent = {
  name: 'airplane',
  priority: 4,
  dependencies: ['base', 'lighting'],
  modifiesAnimation: true,
  generate: (config = {}) => {
    const color = config.color || '0xC0C0C0'; // Silver/aluminum color by default
    const maxSpeed = config.maxSpeed || 0.3;
    const acceleration = config.acceleration || 0.01;
    const type = config.type || 'fighter'; // fighter, passenger, propeller
    
    let airplaneCode = `
// Create a realistic airplane
const airplane = new THREE.Group();

// Setup base positioning - airplane should point forward along Z axis
airplane.rotation.y = Math.PI;

// Main fuselage
const fuselageGeometry = new THREE.CylinderGeometry(0.6, 0.5, 6, 16);
fuselageGeometry.rotateX(Math.PI / 2);
const fuselageMaterial = new THREE.MeshStandardMaterial({ 
  color: ${color},
  roughness: 0.3,
  metalness: 0.7 
});
const fuselage = new THREE.Mesh(fuselageGeometry, fuselageMaterial);
fuselage.castShadow = true;
airplane.add(fuselage);

// Nose cone (more aerodynamic)
const noseGeometry = new THREE.ConeGeometry(0.5, 1.5, 16);
noseGeometry.rotateX(-Math.PI / 2);
const noseMaterial = new THREE.MeshStandardMaterial({ 
  color: ${color},
  roughness: 0.3,
  metalness: 0.7
});
const nose = new THREE.Mesh(noseGeometry, noseMaterial);
nose.position.set(0, 0, -3.5);
nose.castShadow = true;
airplane.add(nose);

// Cockpit/canopy
const canopyGeometry = new THREE.SphereGeometry(0.6, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
canopyGeometry.rotateX(-Math.PI / 2);
canopyGeometry.scale(1, 0.5, 1.2);
const canopyMaterial = new THREE.MeshStandardMaterial({ 
  color: 0x88CCFF,
  transparent: true,
  opacity: 0.7,
  roughness: 0.1,
  metalness: 0.9
});
const canopy = new THREE.Mesh(canopyGeometry, canopyMaterial);
canopy.position.set(0, 0.5, -2);
canopy.castShadow = true;
airplane.add(canopy);

// Main wings
const wingShape = new THREE.Shape();
wingShape.moveTo(0, 0);
wingShape.lineTo(3, 0);
wingShape.lineTo(2.5, 1.5);
wingShape.lineTo(0, 0.5);
wingShape.lineTo(0, 0);

const wingGeometry = new THREE.ExtrudeGeometry(wingShape, {
  steps: 1,
  depth: 0.2,
  bevelEnabled: false
});
const wingMaterial = new THREE.MeshStandardMaterial({ 
  color: ${color},
  roughness: 0.4,
  metalness: 0.7
});

// Left wing
const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
leftWing.position.set(-0.1, 0, -1);
leftWing.rotation.y = Math.PI / 2;
leftWing.castShadow = true;
airplane.add(leftWing);

// Right wing
const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
rightWing.position.set(0.1, 0, -1);
rightWing.rotation.y = -Math.PI / 2;
rightWing.castShadow = true;
airplane.add(rightWing);

// Vertical stabilizer (tail fin)
const tailFinShape = new THREE.Shape();
tailFinShape.moveTo(0, 0);
tailFinShape.lineTo(0, 1.2);
tailFinShape.lineTo(-1, 1.2);
tailFinShape.lineTo(0, 0);

const tailFinGeometry = new THREE.ExtrudeGeometry(tailFinShape, {
  steps: 1,
  depth: 0.1,
  bevelEnabled: false
});

const tailFin = new THREE.Mesh(tailFinGeometry, wingMaterial);
tailFin.position.set(0, 0.5, 3);
tailFin.castShadow = true;
airplane.add(tailFin);

// Horizontal stabilizers
const stabilizerShape = new THREE.Shape();
stabilizerShape.moveTo(0, 0);
stabilizerShape.lineTo(1.5, 0);
stabilizerShape.lineTo(1.2, 0.4);
stabilizerShape.lineTo(0, 0.2);
stabilizerShape.lineTo(0, 0);

const stabilizerGeometry = new THREE.ExtrudeGeometry(stabilizerShape, {
  steps: 1,
  depth: 0.06,
  bevelEnabled: false
});

// Left stabilizer
const leftStabilizer = new THREE.Mesh(stabilizerGeometry, wingMaterial);
leftStabilizer.position.set(-0.05, 0, 2.7);
leftStabilizer.rotation.y = Math.PI / 2;
leftStabilizer.castShadow = true;
airplane.add(leftStabilizer);

// Right stabilizer
const rightStabilizer = new THREE.Mesh(stabilizerGeometry, wingMaterial);
rightStabilizer.position.set(0.05, 0, 2.7);
rightStabilizer.rotation.y = -Math.PI / 2;
rightStabilizer.castShadow = true;
airplane.add(rightStabilizer);
    `;
    
    // Add aircraft type-specific details
    if (type === 'fighter') {
      airplaneCode += `
// Jet fighter engines
const jetEngineGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1.5, 16);
jetEngineGeometry.rotateX(Math.PI / 2);
const jetEngineMaterial = new THREE.MeshStandardMaterial({ 
  color: 0x333333,
  roughness: 0.5,
  metalness: 0.8
});

// Left engine
const leftJetEngine = new THREE.Mesh(jetEngineGeometry, jetEngineMaterial);
leftJetEngine.position.set(-0.6, -0.2, 2);
leftJetEngine.castShadow = true;
airplane.add(leftJetEngine);

// Right engine
const rightJetEngine = new THREE.Mesh(jetEngineGeometry, jetEngineMaterial);
rightJetEngine.position.set(0.6, -0.2, 2);
rightJetEngine.castShadow = true;
airplane.add(rightJetEngine);

// Engine exhaust glow
const jetExhaustGeometry = new THREE.CircleGeometry(0.2, 16);
const jetExhaustMaterial = new THREE.MeshBasicMaterial({ 
  color: 0xFF6600,
  side: THREE.DoubleSide
});

// Left exhaust
const leftJetExhaust = new THREE.Mesh(jetExhaustGeometry, jetExhaustMaterial);
leftJetExhaust.position.set(-0.6, -0.2, 2.8);
leftJetExhaust.rotation.y = Math.PI;
airplane.add(leftJetExhaust);

// Right exhaust
const rightJetExhaust = new THREE.Mesh(jetExhaustGeometry, jetExhaustMaterial);
rightJetExhaust.position.set(0.6, -0.2, 2.8);
rightJetExhaust.rotation.y = Math.PI;
airplane.add(rightJetExhaust);

// Add afterburner particles
const jetParticleCount = 100;
const jetParticleGeometry = new THREE.BufferGeometry();
const jetParticlePositions = new Float32Array(jetParticleCount * 3);
const jetParticleMaterial = new THREE.PointsMaterial({
  color: 0xFF3300,
  size: 0.08,
  transparent: true,
  opacity: 0.6
});

for (let i = 0; i < jetParticleCount / 2; i++) {
  // Left engine particles
  jetParticlePositions[i * 3] = -0.6;
  jetParticlePositions[i * 3 + 1] = -0.2 + (Math.random() - 0.5) * 0.1;
  jetParticlePositions[i * 3 + 2] = 2.8 + Math.random() * 2;
  
  // Right engine particles
  jetParticlePositions[(i + jetParticleCount/2) * 3] = 0.6;
  jetParticlePositions[(i + jetParticleCount/2) * 3 + 1] = -0.2 + (Math.random() - 0.5) * 0.1;
  jetParticlePositions[(i + jetParticleCount/2) * 3 + 2] = 2.8 + Math.random() * 2;
}

jetParticleGeometry.setAttribute('position', new THREE.BufferAttribute(jetParticlePositions, 3));
const jetExhaustParticles = new THREE.Points(jetParticleGeometry, jetParticleMaterial);
airplane.add(jetExhaustParticles);
airplane.userData.exhaustParticles = jetExhaustParticles;
airplane.userData.particlePositions = jetParticlePositions;

// Add fighter details - missile hardpoints
const missileHardpointGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.3);
const missileHardpointMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });

// Wing hardpoints
for (let i = 0; i < 2; i++) {
  const leftHardpoint = new THREE.Mesh(missileHardpointGeometry, missileHardpointMaterial);
  leftHardpoint.position.set(-1.5 - i * 0.5, -0.1, -0.5);
  airplane.add(leftHardpoint);
  
  const rightHardpoint = new THREE.Mesh(missileHardpointGeometry, missileHardpointMaterial);
  rightHardpoint.position.set(1.5 + i * 0.5, -0.1, -0.5);
  airplane.add(rightHardpoint);
}
`;
    } else if (type === 'passenger') {
      airplaneCode += `
// Passenger airliner details
// Extended fuselage for passenger plane
const extendedFuselageGeometry = new THREE.CylinderGeometry(0.6, 0.6, 2, 16);
extendedFuselageGeometry.rotateX(Math.PI / 2);
const extendedFuselage = new THREE.Mesh(extendedFuselageGeometry, fuselageMaterial);
extendedFuselage.position.set(0, 0, -1);
extendedFuselage.castShadow = true;
airplane.add(extendedFuselage);

// Windows (passenger windows along fuselage)
const passengerWindowMaterial = new THREE.MeshStandardMaterial({
  color: 0x88CCFF,
  transparent: true,
  opacity: 0.8
});

// Add windows along both sides of the fuselage
for (let i = -3; i <= 2; i += 0.7) {
  // Left windows
  const leftWindowGeometry = new THREE.BoxGeometry(0.05, 0.15, 0.2);
  const leftWindow = new THREE.Mesh(leftWindowGeometry, passengerWindowMaterial);
  leftWindow.position.set(-0.59, 0.1, i);
  airplane.add(leftWindow);
  
  // Right windows
  const rightWindowGeometry = new THREE.BoxGeometry(0.05, 0.15, 0.2);
  const rightWindow = new THREE.Mesh(rightWindowGeometry, passengerWindowMaterial);
  rightWindow.position.set(0.59, 0.1, i);
  airplane.add(rightWindow);
}

// Passenger aircraft engines
const passengerEngineGeometry = new THREE.CylinderGeometry(0.4, 0.4, 1.2, 16);
passengerEngineGeometry.rotateX(Math.PI / 2);
const passengerEngineMaterial = new THREE.MeshStandardMaterial({ 
  color: 0x333333,
  roughness: 0.5,
  metalness: 0.7
});

// Left engine
const passengerLeftEngine = new THREE.Mesh(passengerEngineGeometry, passengerEngineMaterial);
passengerLeftEngine.position.set(-2, -0.5, -1);
passengerLeftEngine.castShadow = true;
airplane.add(passengerLeftEngine);

// Right engine
const passengerRightEngine = new THREE.Mesh(passengerEngineGeometry, passengerEngineMaterial);
passengerRightEngine.position.set(2, -0.5, -1);
passengerRightEngine.castShadow = true;
airplane.add(passengerRightEngine);

// Engine mounts
const engineMountGeometry = new THREE.BoxGeometry(0.8, 0.3, 0.8);
const engineMountMaterial = new THREE.MeshStandardMaterial({ color: ${color} });

// Left mount
const leftEngineMount = new THREE.Mesh(engineMountGeometry, engineMountMaterial);
leftEngineMount.position.set(-1.6, -0.3, -1);
airplane.add(leftEngineMount);

// Right mount
const rightEngineMount = new THREE.Mesh(engineMountGeometry, engineMountMaterial);
rightEngineMount.position.set(1.6, -0.3, -1);
airplane.add(rightEngineMount);

// Add engine intakes
const engineIntakeGeometry = new THREE.CylinderGeometry(0.42, 0.38, 0.2, 16);
engineIntakeGeometry.rotateX(Math.PI / 2);
const engineIntakeMaterial = new THREE.MeshStandardMaterial({
  color: 0x222222,
  roughness: 0.2,
  metalness: 0.9
});

// Left intake
const leftEngineIntake = new THREE.Mesh(engineIntakeGeometry, engineIntakeMaterial);
leftEngineIntake.position.set(-2, -0.5, -1.7);
airplane.add(leftEngineIntake);

// Right intake
const rightEngineIntake = new THREE.Mesh(engineIntakeGeometry, engineIntakeMaterial);
rightEngineIntake.position.set(2, -0.5, -1.7);
airplane.add(rightEngineIntake);
`;
    } else {
      // Default to propeller
      airplaneCode += `
// Propeller aircraft details
// Engine cowling
const propCowlingGeometry = new THREE.CylinderGeometry(0.6, 0.7, 1, 16);
propCowlingGeometry.rotateX(Math.PI / 2);
const propCowlingMaterial = new THREE.MeshStandardMaterial({ 
  color: 0x333333,
  roughness: 0.5,
  metalness: 0.8
});
const propCowling = new THREE.Mesh(propCowlingGeometry, propCowlingMaterial);
propCowling.position.set(0, 0, -3.8);
propCowling.castShadow = true;
airplane.add(propCowling);

// Propeller hub
const propHubGeometry = new THREE.SphereGeometry(0.2, 16, 16);
const propHubMaterial = new THREE.MeshStandardMaterial({ 
  color: 0x555555,
  roughness: 0.3,
  metalness: 0.9 
});
const propHub = new THREE.Mesh(propHubGeometry, propHubMaterial);
propHub.position.set(0, 0, -4.3);
propHub.castShadow = true;
airplane.add(propHub);

// Propeller group
const propellerGroup = new THREE.Group();
propellerGroup.position.copy(propHub.position);

// Propeller blades
const propBladeGeometry = new THREE.BoxGeometry(0.1, 2, 0.2);
propBladeGeometry.translate(0, 1, 0);

const propBladeMaterial = new THREE.MeshStandardMaterial({ 
  color: 0x222222,
  roughness: 0.4,
  metalness: 0.6
});

const propBlade1 = new THREE.Mesh(propBladeGeometry, propBladeMaterial);
propBlade1.castShadow = true;
propellerGroup.add(propBlade1);

const propBlade2 = new THREE.Mesh(propBladeGeometry, propBladeMaterial);
propBlade2.rotation.z = Math.PI / 2;
propBlade2.castShadow = true;
propellerGroup.add(propBlade2);

const propBlade3 = new THREE.Mesh(propBladeGeometry, propBladeMaterial);
propBlade3.rotation.z = Math.PI;
propBlade3.castShadow = true;
propellerGroup.add(propBlade3);

const propBlade4 = new THREE.Mesh(propBladeGeometry, propBladeMaterial);
propBlade4.rotation.z = 3 * Math.PI / 2;
propBlade4.castShadow = true;
propellerGroup.add(propBlade4);

airplane.add(propellerGroup);
airplane.userData.propeller = propellerGroup;

// Add additional struts for propeller plane
const strut1Geometry = new THREE.BoxGeometry(3, 0.1, 0.1);
const strutMaterial = new THREE.MeshStandardMaterial({ 
  color: 0x222222,
  roughness: 0.4,
  metalness: 0.6
});

// Connecting struts between wings
const upperStrut1 = new THREE.Mesh(strut1Geometry, strutMaterial);
upperStrut1.position.set(0, 0.6, -1);
upperStrut1.castShadow = true;
airplane.add(upperStrut1);

const upperStrut2 = new THREE.Mesh(strut1Geometry, strutMaterial);
upperStrut2.position.set(0, 0.6, 0);
upperStrut2.castShadow = true;
airplane.add(upperStrut2);

// Add vertical struts
const strut2Geometry = new THREE.BoxGeometry(0.1, 0.6, 0.1);
const verticalStrut1 = new THREE.Mesh(strut2Geometry, strutMaterial);
verticalStrut1.position.set(-1.2, 0.3, -1);
airplane.add(verticalStrut1);

const verticalStrut2 = new THREE.Mesh(strut2Geometry, strutMaterial);
verticalStrut2.position.set(1.2, 0.3, -1);
airplane.add(verticalStrut2);

const verticalStrut3 = new THREE.Mesh(strut2Geometry, strutMaterial);
verticalStrut3.position.set(-1.2, 0.3, 0);
airplane.add(verticalStrut3);

const verticalStrut4 = new THREE.Mesh(strut2Geometry, strutMaterial);
verticalStrut4.position.set(1.2, 0.3, 0);
airplane.add(verticalStrut4);
`;
    }
    
    // Add landing gear for all types
    airplaneCode += `
// Add landing gear
const landingGearLegGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.7, 8);
const landingGearWheelGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16);
const landingGearMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });

// Front gear
const frontGearAssembly = new THREE.Group(); // Use a group for retracting
airplane.add(frontGearAssembly);

const frontGearLeg = new THREE.Mesh(landingGearLegGeometry, landingGearMaterial);
frontGearLeg.position.set(0, -0.35, -2.5);
frontGearAssembly.add(frontGearLeg);

const frontGearWheel = new THREE.Mesh(landingGearWheelGeometry, landingGearMaterial);
frontGearWheel.position.set(0, -0.7, -2.5);
frontGearWheel.rotation.x = Math.PI / 2;
frontGearAssembly.add(frontGearWheel);

// Left gear
const leftGearAssembly = new THREE.Group();
airplane.add(leftGearAssembly);

const leftGearLeg = new THREE.Mesh(landingGearLegGeometry, landingGearMaterial);
leftGearLeg.position.set(-1.2, -0.35, 0.5);
leftGearAssembly.add(leftGearLeg);

const leftGearWheel = new THREE.Mesh(landingGearWheelGeometry, landingGearMaterial);
leftGearWheel.position.set(-1.2, -0.7, 0.5);
leftGearWheel.rotation.x = Math.PI / 2;
leftGearAssembly.add(leftGearWheel);

// Right gear
const rightGearAssembly = new THREE.Group();
airplane.add(rightGearAssembly);

const rightGearLeg = new THREE.Mesh(landingGearLegGeometry, landingGearMaterial);
rightGearLeg.position.set(1.2, -0.35, 0.5);
rightGearAssembly.add(rightGearLeg);

const rightGearWheel = new THREE.Mesh(landingGearWheelGeometry, landingGearMaterial);
rightGearWheel.position.set(1.2, -0.7, 0.5);
rightGearWheel.rotation.x = Math.PI / 2;
rightGearAssembly.add(rightGearWheel);

// Store landing gear references
airplane.userData.landingGear = [
  frontGearAssembly,
  leftGearAssembly,
  rightGearAssembly
];

// Set initial position and add to scene
airplane.position.set(0, 10, 0);
scene.add(airplane);

// Initialize airplane properties
airplane.userData.speed = 0;
airplane.userData.altitude = 10;
airplane.userData.targetAltitude = 10;
airplane.userData.roll = 0;
airplane.userData.pitch = 0;
airplane.userData.gearDown = true;
airplane.userData.lastGKeyState = false;
`;

    // Control code for animation
    let controlCode = `
// Airplane flight controls
const airplaneDeltaTime = clock.getDelta();
const airplaneTime = clock.getElapsedTime();

// Speed control
if (keys.w || keys.ArrowUp) {
  airplane.userData.speed = Math.min(${maxSpeed}, airplane.userData.speed + ${acceleration});
} else if (keys.s || keys.ArrowDown) {
  airplane.userData.speed = Math.max(0, airplane.userData.speed - ${acceleration});
}

// Roll control (banking)
if (keys.a || keys.ArrowLeft) {
  airplane.userData.roll = Math.min(0.5, airplane.userData.roll + 0.02);
} else if (keys.d || keys.ArrowRight) {
  airplane.userData.roll = Math.max(-0.5, airplane.userData.roll - 0.02);
} else {
  // Auto-level roll
  if (Math.abs(airplane.userData.roll) < 0.02) {
    airplane.userData.roll = 0;
  } else if (airplane.userData.roll > 0) {
    airplane.userData.roll -= 0.01;
  } else {
    airplane.userData.roll += 0.01;
  }
}

// Pitch control (up/down)
if (keys[' ']) { // Space to pitch up
  airplane.userData.pitch = Math.min(0.3, airplane.userData.pitch + 0.01);
  airplane.userData.targetAltitude += 0.2;
} else if (keys.Control || keys.c) { // Control to pitch down
  airplane.userData.pitch = Math.max(-0.3, airplane.userData.pitch - 0.01);
  airplane.userData.targetAltitude -= 0.2;
} else {
  // Auto-level pitch
  if (Math.abs(airplane.userData.pitch) < 0.02) {
    airplane.userData.pitch = 0;
  } else if (airplane.userData.pitch > 0) {
    airplane.userData.pitch -= 0.005;
  } else {
    airplane.userData.pitch += 0.005;
  }
}

// Apply rotation for realistic flight
airplane.rotation.z = airplane.userData.roll;
airplane.rotation.x = airplane.userData.pitch;

// Apply banking effect on turning
const airplaneTurnRate = -airplane.userData.roll * 0.7 * airplane.userData.speed;
airplane.rotation.y = Math.PI + airplaneTurnRate; // Keep base rotation at PI (facing forward)

// Move airplane forward based on its orientation
const airplaneDirection = new THREE.Vector3(0, 0, -1);
airplaneDirection.applyQuaternion(airplane.quaternion);
airplaneDirection.multiplyScalar(airplane.userData.speed);
airplane.position.add(airplaneDirection);

// Gradually adjust height to target altitude
if (airplane.position.y < airplane.userData.targetAltitude) {
  airplane.position.y += Math.min(0.1, (airplane.userData.targetAltitude - airplane.position.y) * 0.05);
} else if (airplane.position.y > airplane.userData.targetAltitude) {
  airplane.position.y -= Math.min(0.1, (airplane.position.y - airplane.userData.targetAltitude) * 0.05);
}

// Limit the minimum altitude to prevent crashing
if (airplane.position.y < 1) {
  airplane.position.y = 1;
  airplane.userData.targetAltitude = 1;
}

// Landing gear control
if (keys.g && !airplane.userData.lastGKeyState) {
  airplane.userData.gearDown = !airplane.userData.gearDown;
  
  // Animate gear position
  airplane.userData.landingGear.forEach(gearAssembly => {
    gearAssembly.visible = airplane.userData.gearDown;
  });
}
airplane.userData.lastGKeyState = keys.g || false;

// Update camera to follow airplane
const airplaneCameraOffset = new THREE.Vector3(0, 2, 10);
airplaneCameraOffset.applyQuaternion(airplane.quaternion);
camera.position.copy(airplane.position).add(airplaneCameraOffset);
camera.lookAt(airplane.position);
`;

    // Add type-specific animations
    if (type === 'fighter') {
      controlCode += `
// Update exhaust particles
const jetParticlePositions = airplane.userData.particlePositions;
for (let i = 0; i < jetParticlePositions.length / 3; i++) {
  // Move particles backward
  jetParticlePositions[i * 3 + 2] += 0.2 * airplane.userData.speed;
  
  // Reset particles that go too far
  if (jetParticlePositions[i * 3 + 2] > 5) {
    if (i < jetParticlePositions.length / 6) {
      // Left engine
      jetParticlePositions[i * 3] = -0.6;
      jetParticlePositions[i * 3 + 1] = -0.2 + (Math.random() - 0.5) * 0.1;
      jetParticlePositions[i * 3 + 2] = 2.8;
    } else {
      // Right engine
      jetParticlePositions[i * 3] = 0.6;
      jetParticlePositions[i * 3 + 1] = -0.2 + (Math.random() - 0.5) * 0.1;
      jetParticlePositions[i * 3 + 2] = 2.8;
    }
  }
}
airplane.userData.exhaustParticles.geometry.attributes.position.needsUpdate = true;

// Afterburner effect when at high speed
if (airplane.userData.speed > ${maxSpeed * 0.8}) {
  airplane.userData.exhaustParticles.material.size = 0.12;
  airplane.userData.exhaustParticles.material.color.setHex(0xFF6600);
} else {
  airplane.userData.exhaustParticles.material.size = 0.08;
  airplane.userData.exhaustParticles.material.color.setHex(0xFF3300);
}
`;
    } else if (type === 'propeller') {
      controlCode += `
// Rotate propeller based on speed
if (airplane.userData.propeller) {
  airplane.userData.propeller.rotation.z += airplane.userData.speed * 5;
}
`;
    }

    return {
      code: airplaneCode,
      animationCode: controlCode
    };
  }
};

// Register the new component
registry.register('airplane', airplaneComponent);

export default airplaneComponent;