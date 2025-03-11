// src/app/lib/game-engine/components/characters/wizard.js
import { registry } from "../../component-registry";

const wizardComponent = {
  name: "wizard",
  priority: 4,
  dependencies: ["base", "lighting"],
  modifiesAnimation: true,
  generate: (config = {}) => {
    const wizRobeColor = config.robeColor || "0x5733FF"; // Purple by default
    const wizHatColor = config.hatColor || "0x333366";   // Dark blue by default
    const wizStaffColor = config.staffColor || "0x8B4513"; // Brown by default
    const wizHeight = config.height || 1.8;
    const wizCastSpeed = config.castSpeed || 1.5;
    const wizSpellColor = config.spellColor || "0x00FFFF"; // Cyan by default
    const wizMaxSpeed = config.maxSpeed || 0.1;
    const wizAcceleration = config.acceleration || 0.005;

    // Wizard creation code
    const wizardCode = `
// Create wizard character
const wizardChar = new THREE.Group();

// Wizard body (robe)
const wizRobeGeometry = new THREE.ConeGeometry(0.7, ${wizHeight}, 8);
const wizRobeMaterial = new THREE.MeshStandardMaterial({ 
  color: ${wizRobeColor},
  roughness: 0.7,
  metalness: 0.2
});
const wizRobe = new THREE.Mesh(wizRobeGeometry, wizRobeMaterial);
wizRobe.position.y = ${wizHeight/2};
wizRobe.castShadow = true;
wizardChar.add(wizRobe);

// Head
const wizHeadGeometry = new THREE.SphereGeometry(0.3, 16, 16);
const wizHeadMaterial = new THREE.MeshStandardMaterial({ 
  color: 0xF5DEB3, // Skin tone
  roughness: 0.8,
  metalness: 0.1
});
const wizHead = new THREE.Mesh(wizHeadGeometry, wizHeadMaterial);
wizHead.position.y = ${wizHeight} + 0.1;
wizHead.castShadow = true;
wizardChar.add(wizHead);

// Wizard hat
const wizHatBaseGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.1, 16);
const wizHatTopGeometry = new THREE.ConeGeometry(0.3, 0.7, 16);
const wizHatMaterial = new THREE.MeshStandardMaterial({ 
  color: ${wizHatColor},
  roughness: 0.8,
  metalness: 0.4
});

const wizHatBase = new THREE.Mesh(wizHatBaseGeometry, wizHatMaterial);
wizHatBase.position.y = ${wizHeight} + 0.35;
wizHatBase.castShadow = true;
wizardChar.add(wizHatBase);

const wizHatTop = new THREE.Mesh(wizHatTopGeometry, wizHatMaterial);
wizHatTop.position.y = ${wizHeight} + 0.75;
wizHatTop.castShadow = true;
wizardChar.add(wizHatTop);

// Add a star to the hat tip
const wizStarGeometry = new THREE.OctahedronGeometry(0.08, 0);
const wizStarMaterial = new THREE.MeshStandardMaterial({ 
  color: 0xFFD700, // Gold
  emissive: 0xFFD700,
  emissiveIntensity: 0.5,
  roughness: 0.2,
  metalness: 0.9
});
const wizStar = new THREE.Mesh(wizStarGeometry, wizStarMaterial);
wizStar.position.y = ${wizHeight} + 1.15;
wizStar.castShadow = true;
wizardChar.add(wizStar);

// Facial features (simplified)
const wizEyeGeometry = new THREE.SphereGeometry(0.05, 8, 8);
const wizEyeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
const wizLeftEye = new THREE.Mesh(wizEyeGeometry, wizEyeMaterial);
wizLeftEye.position.set(-0.1, ${wizHeight} + 0.1, 0.25);
wizardChar.add(wizLeftEye);

const wizRightEye = new THREE.Mesh(wizEyeGeometry, wizEyeMaterial);
wizRightEye.position.set(0.1, ${wizHeight} + 0.1, 0.25);
wizardChar.add(wizRightEye);

// Add beard for the wizard
const wizBeardGeometry = new THREE.ConeGeometry(0.2, 0.5, 8);
const wizBeardMaterial = new THREE.MeshStandardMaterial({ 
  color: 0xCCCCCC, // Grey
  roughness: 1.0,
  metalness: 0.0
});
const wizBeard = new THREE.Mesh(wizBeardGeometry, wizBeardMaterial);
wizBeard.position.set(0, ${wizHeight} - 0.1, 0.2);
wizBeard.rotation.x = Math.PI / 6;
wizardChar.add(wizBeard);

// Staff
const wizStaffGeometry = new THREE.CylinderGeometry(0.05, 0.07, 2, 8);
const wizStaffMaterial = new THREE.MeshStandardMaterial({ 
  color: ${wizStaffColor},
  roughness: 0.9,
  metalness: 0.1
});
const wizStaff = new THREE.Mesh(wizStaffGeometry, wizStaffMaterial);
wizStaff.position.set(0.6, ${wizHeight/2} - 0.3, 0);
wizStaff.rotation.z = Math.PI / 12;
wizStaff.castShadow = true;
wizardChar.add(wizStaff);

// Staff orb (magic crystal)
const wizOrbGeometry = new THREE.SphereGeometry(0.15, 16, 16);
const wizOrbMaterial = new THREE.MeshStandardMaterial({ 
  color: ${wizSpellColor},
  transparent: true,
  opacity: 0.8,
  emissive: ${wizSpellColor},
  emissiveIntensity: 0.5,
  roughness: 0.0,
  metalness: 1.0
});
const wizOrb = new THREE.Mesh(wizOrbGeometry, wizOrbMaterial);
wizOrb.position.set(0.65, ${wizHeight/2} + 0.7, 0);
wizOrb.castShadow = false;
wizardChar.add(wizOrb);

// Add a point light to the orb
const wizOrbLight = new THREE.PointLight(${wizSpellColor}, 1, 5);
wizOrbLight.position.copy(wizOrb.position);
wizardChar.add(wizOrbLight);

// Create spell effect (initially invisible)
const wizSpellEffect = new THREE.Group();
const wizSpellCore = new THREE.Mesh(
  new THREE.SphereGeometry(0.1, 16, 16),
  new THREE.MeshBasicMaterial({ 
    color: ${wizSpellColor},
    transparent: true,
    opacity: 0.7
  })
);
wizSpellEffect.add(wizSpellCore);

// Add particles around the spell core
for (let wizParticleIndex = 0; wizParticleIndex < 8; wizParticleIndex++) {
  const wizParticle = new THREE.Mesh(
    new THREE.SphereGeometry(0.03, 8, 8),
    new THREE.MeshBasicMaterial({ 
      color: ${wizSpellColor},
      transparent: true,
      opacity: 0.7
    })
  );
  
  const wizParticleAngle = (wizParticleIndex / 8) * Math.PI * 2;
  wizParticle.position.set(
    Math.cos(wizParticleAngle) * 0.2,
    Math.sin(wizParticleAngle) * 0.2,
    0
  );
  
  wizSpellEffect.add(wizParticle);
}

// Add spell light
const wizSpellLight = new THREE.PointLight(${wizSpellColor}, 1, 10);
wizSpellLight.position.set(0, 0, 0);
wizSpellEffect.add(wizSpellLight);

// Hide spell initially
wizSpellEffect.visible = false;
wizSpellEffect.position.copy(wizOrb.position);
wizardChar.add(wizSpellEffect);

// Add trail effect for movement
const wizTrailParticles = new THREE.Group();
for (let wizTrailIndex = 0; wizTrailIndex < 10; wizTrailIndex++) {
  const wizTrailParticle = new THREE.Mesh(
    new THREE.SphereGeometry(0.05, 8, 8),
    new THREE.MeshBasicMaterial({
      color: ${wizRobeColor},
      transparent: true,
      opacity: 0.3
    })
  );
  wizTrailParticle.visible = false;
  wizTrailParticle.userData = {
    wizLifetime: 0,
    wizMaxLifetime: 1 + Math.random() * 0.5
  };
  wizTrailParticles.add(wizTrailParticle);
}
wizardChar.add(wizTrailParticles);

// Store references for animation
wizardChar.userData.wizStaff = wizStaff;
wizardChar.userData.wizOrb = wizOrb;
wizardChar.userData.wizOrbLight = wizOrbLight;
wizardChar.userData.wizSpellEffect = wizSpellEffect;
wizardChar.userData.wizStar = wizStar;
wizardChar.userData.wizTrailParticles = wizTrailParticles.children;
wizardChar.userData.wizIsCasting = false;
wizardChar.userData.wizCastTime = 0;
wizardChar.userData.wizCastSpeed = ${wizCastSpeed};
wizardChar.userData.wizSpellTarget = new THREE.Vector3();
wizardChar.userData.wizLastUpdateTime = clock.getElapsedTime();

// Movement properties (like the car)
wizardChar.userData.wizSpeed = 0;
wizardChar.userData.wizMaxSpeed = ${wizMaxSpeed};
wizardChar.userData.wizAcceleration = ${wizAcceleration};
wizardChar.userData.wizDeceleration = ${wizAcceleration / 2};
wizardChar.userData.wizTurnAngle = 0;
wizardChar.userData.wizTurnSpeed = 0.03;
wizardChar.userData.wizFloatOffset = 0;

// Set initial position
wizardChar.position.set(0, 0, 0);
scene.add(wizardChar);

// Create a targeting ray for spell casting
const wizTargetingArrow = new THREE.ArrowHelper(
  new THREE.Vector3(0, 0, -1),
  new THREE.Vector3(0, 0, 0),
  5,
  ${wizSpellColor},
  0.5,
  0.3
);
wizTargetingArrow.visible = false;
scene.add(wizTargetingArrow);
wizardChar.userData.wizTargetingArrow = wizTargetingArrow;
`;

    // Wizard control code for animation updates
    const controlCode = `
// Calculate time delta for frame-rate independent animation
const wizCurrentTime = clock.getElapsedTime();
const wizDelta = wizCurrentTime - wizardChar.userData.wizLastUpdateTime;
wizardChar.userData.wizLastUpdateTime = wizCurrentTime;

// Animate wizard with car-like movement
const wizRotationSpeed = 0.05;

// Create a hover effect
wizardChar.userData.wizFloatOffset += wizDelta * 2;
wizardChar.position.y = Math.sin(wizardChar.userData.wizFloatOffset) * 0.1;

// Movement with momentum, like car
if (keys.w || keys.ArrowUp) {
  wizardChar.userData.wizSpeed = Math.min(
    wizardChar.userData.wizMaxSpeed,
    wizardChar.userData.wizSpeed + wizardChar.userData.wizAcceleration * wizDelta * 60
  );
  wizardChar.rotation.y = Math.PI;
} else if (keys.s || keys.ArrowDown) {
  wizardChar.userData.wizSpeed = Math.max(
    -wizardChar.userData.wizMaxSpeed * 0.7,
    wizardChar.userData.wizSpeed - wizardChar.userData.wizAcceleration * wizDelta * 60
  );
  wizardChar.rotation.y = 0;
} else {
  // Gradually slow down (deceleration)
  if (Math.abs(wizardChar.userData.wizSpeed) < 0.001) {
    wizardChar.userData.wizSpeed = 0;
  } else if (wizardChar.userData.wizSpeed > 0) {
    wizardChar.userData.wizSpeed -= wizardChar.userData.wizDeceleration * wizDelta * 60;
  } else {
    wizardChar.userData.wizSpeed += wizardChar.userData.wizDeceleration * wizDelta * 60;
  }
}

// Turning
if (keys.a || keys.ArrowLeft) {
  if (Math.abs(wizardChar.userData.wizSpeed) > 0.01) {
    wizardChar.userData.wizTurnAngle = Math.min(Math.PI/6, wizardChar.userData.wizTurnAngle + wizardChar.userData.wizTurnSpeed);
    wizardChar.rotation.y = Math.PI / 2;
  }
} else if (keys.d || keys.ArrowRight) {
  if (Math.abs(wizardChar.userData.wizSpeed) > 0.01) {
    wizardChar.userData.wizTurnAngle = Math.max(-Math.PI/6, wizardChar.userData.wizTurnAngle - wizardChar.userData.wizTurnSpeed);
    wizardChar.rotation.y = -Math.PI / 2;
  }
} else {
  // Return gradually to center
  if (wizardChar.userData.wizTurnAngle > 0.01) {
    wizardChar.userData.wizTurnAngle -= wizardChar.userData.wizTurnSpeed;
  } else if (wizardChar.userData.wizTurnAngle < -0.01) {
    wizardChar.userData.wizTurnAngle += wizardChar.userData.wizTurnSpeed;
  } else {
    wizardChar.userData.wizTurnAngle = 0;
  }
}

// Apply rotation and movement based on speed and turn angle
if (wizardChar.userData.wizSpeed != 0) {
  wizardChar.rotation.y += wizardChar.userData.wizTurnAngle * wizardChar.userData.wizSpeed * 0.1;
  
  // Move in the direction the wizard is facing
  const wizDirection = new THREE.Vector3(0, 0, -1);
  wizDirection.applyQuaternion(wizardChar.quaternion);
  wizDirection.multiplyScalar(wizardChar.userData.wizSpeed);
  wizardChar.position.add(wizDirection);
  
  // Create trail particles when moving fast enough
  if (Math.abs(wizardChar.userData.wizSpeed) > wizardChar.userData.wizMaxSpeed * 0.3) {
    const wizTrailParticle = wizardChar.userData.wizTrailParticles.find(p => !p.visible);
    if (wizTrailParticle) {
      wizTrailParticle.visible = true;
      wizTrailParticle.position.copy(wizardChar.position);
      wizTrailParticle.position.y += ${wizHeight/4};
      wizTrailParticle.userData.wizLifetime = 0;
      wizTrailParticle.material.opacity = 0.5;
    }
  }
}

// Update trail particles
wizardChar.userData.wizTrailParticles.forEach(wizTrailParticle => {
  if (wizTrailParticle.visible) {
    wizTrailParticle.userData.wizLifetime += wizDelta;
    
    if (wizTrailParticle.userData.wizLifetime >= wizTrailParticle.userData.wizMaxLifetime) {
      wizTrailParticle.visible = false;
    } else {
      const lifePercent = wizTrailParticle.userData.wizLifetime / wizTrailParticle.userData.wizMaxLifetime;
      wizTrailParticle.material.opacity = 0.5 * (1 - lifePercent);
      wizTrailParticle.scale.set(1 + lifePercent, 1 + lifePercent, 1 + lifePercent);
    }
  }
});

// The robe should sway based on movement and turning
const wizRobeSwayAmount = wizardChar.userData.wizSpeed * 0.5;
wizRobe.rotation.z = Math.sin(clock.getElapsedTime() * 5) * 0.05 * Math.abs(wizardChar.userData.wizSpeed / wizardChar.userData.wizMaxSpeed);
wizRobe.rotation.x = wizardChar.userData.wizTurnAngle * 0.2;

// Cast spell with space bar
if (keys[' '] && !wizardChar.userData.wizIsCasting) {
  wizardChar.userData.wizIsCasting = true;
  wizardChar.userData.wizCastTime = 0;
  
  // Set spell target in front of wizard
  const wizDirection = new THREE.Vector3(0, 0, -1);
  wizDirection.applyQuaternion(wizardChar.quaternion);
  wizDirection.multiplyScalar(5);
  wizardChar.userData.wizSpellTarget.copy(wizardChar.position).add(wizDirection);
  
  // Make spell visible
  wizardChar.userData.wizSpellEffect.visible = true;
  wizardChar.userData.wizSpellEffect.position.copy(wizardChar.userData.wizOrb.position);
  
  // Increase orb glow
  wizardChar.userData.wizOrbLight.intensity = 2;
  
  // Show targeting arrow
  wizardChar.userData.wizTargetingArrow.visible = true;
  wizardChar.userData.wizTargetingArrow.position.copy(wizardChar.position);
  const wizTargetDir = new THREE.Vector3().subVectors(wizardChar.userData.wizSpellTarget, wizardChar.position).normalize();
  wizardChar.userData.wizTargetingArrow.setDirection(wizTargetDir);
}

// Animate casting spell
if (wizardChar.userData.wizIsCasting) {
  wizardChar.userData.wizCastTime += wizDelta * wizardChar.userData.wizCastSpeed;
  
  // Raise staff during spell cast
  const wizStaffRaiseAmount = Math.sin(Math.min(Math.PI/2, wizardChar.userData.wizCastTime)) * 0.3;
  wizardChar.userData.wizStaff.rotation.z = Math.PI / 12 + wizStaffRaiseAmount;
  
  // Animate orb pulsing
  const wizPulseScale = 1 + Math.sin(wizardChar.userData.wizCastTime * 5) * 0.2;
  wizardChar.userData.wizOrb.scale.set(wizPulseScale, wizPulseScale, wizPulseScale);
  wizardChar.userData.wizOrbLight.intensity = 1 + Math.sin(wizardChar.userData.wizCastTime * 5) * 0.5;
  
  // Move spell effect toward target
  if (wizardChar.userData.wizCastTime > 1) {
    const wizProgress = Math.min(1, (wizardChar.userData.wizCastTime - 1) / 2);
    
    const wizStartPos = new THREE.Vector3().copy(wizardChar.userData.wizOrb.position);
    wizStartPos.add(wizardChar.position);
    
    const wizTarget = wizardChar.userData.wizSpellTarget;
    
    // Calculate current position (arc trajectory)
    const wizCurrentPos = new THREE.Vector3()
      .lerpVectors(wizStartPos, wizTarget, wizProgress)
      .add(new THREE.Vector3(0, Math.sin(wizProgress * Math.PI) * 2, 0));
    
    // Update spell position relative to wizard
    wizardChar.userData.wizSpellEffect.position.copy(wizCurrentPos.sub(wizardChar.position));
    
    // Scale effect based on distance
    const wizScaleEffect = 1 + wizProgress * 2;
    wizardChar.userData.wizSpellEffect.scale.set(wizScaleEffect, wizScaleEffect, wizScaleEffect);
    
    // Complete the spell
    if (wizProgress >= 1) {
      // Create impact effect
      const wizImpactLight = new THREE.PointLight(${wizSpellColor}, 3, 8);
      wizImpactLight.position.copy(wizardChar.userData.wizSpellTarget);
      scene.add(wizImpactLight);
      
      // Fade out impact light
      wizImpactLight.userData = { 
        wizCreationTime: clock.getElapsedTime(),
        wizDuration: 1.0
      };
      
      // Add to update list
      if (!window.wizImpactLights) window.wizImpactLights = [];
      window.wizImpactLights.push(wizImpactLight);
      
      // Reset wizard state
      wizardChar.userData.wizIsCasting = false;
      wizardChar.userData.wizSpellEffect.visible = false;
      wizardChar.userData.wizOrb.scale.set(1, 1, 1);
      wizardChar.userData.wizOrbLight.intensity = 1;
      wizardChar.userData.wizTargetingArrow.visible = false;
    }
  }
}

// Update impact lights (fade out and remove)
if (window.wizImpactLights) {
  const wizCurrentTime = clock.getElapsedTime();
  window.wizImpactLights.forEach((wizLight, wizIndex) => {
    const wizAge = wizCurrentTime - wizLight.userData.wizCreationTime;
    if (wizAge >= wizLight.userData.wizDuration) {
      scene.remove(wizLight);
      window.wizImpactLights[wizIndex] = null;
    } else {
      const wizLifePercent = 1 - (wizAge / wizLight.userData.wizDuration);
      wizLight.intensity = 3 * wizLifePercent;
    }
  });
  
  // Clean up removed lights
  window.wizImpactLights = window.wizImpactLights.filter(wizLight => wizLight !== null);
}

// Animate wizard's star on hat
wizardChar.userData.wizStar.rotation.y += wizDelta * 2;

// Update camera to follow wizard
const wizCameraOffset = new THREE.Vector3(0, ${wizHeight + 2}, 6);
wizCameraOffset.applyQuaternion(wizardChar.quaternion);
camera.position.lerp(
  new THREE.Vector3(
    wizardChar.position.x + wizCameraOffset.x,
    wizardChar.position.y + wizCameraOffset.y,
    wizardChar.position.z + wizCameraOffset.z
  ),
  wizDelta * 5
);
camera.lookAt(wizardChar.position);
`;

    // Initialization code that runs once when the wizard is created
    const initCode = `
// Initialize wizard interactions
document.addEventListener('keydown', (wizEvent) => {
  if (wizEvent.key === ' ' && !wizardChar.userData.wizSpacePressed) {
    wizardChar.userData.wizSpacePressed = true;
  }
});

document.addEventListener('keyup', (wizEvent) => {
  if (wizEvent.key === ' ') {
    wizardChar.userData.wizSpacePressed = false;
  }
});

// Set up initial camera position behind wizard
const wizInitialCameraOffset = new THREE.Vector3(0, ${wizHeight + 2}, 6);
camera.position.set(
  wizardChar.position.x + wizInitialCameraOffset.x,
  wizardChar.position.y + wizInitialCameraOffset.y,
  wizardChar.position.z + wizInitialCameraOffset.z
);
camera.lookAt(wizardChar.position);
`;

    return {
      code: `
${wizardCode}
${initCode}`,
      animationCode: controlCode,
    };
  },
};

registry.register("wizard", wizardComponent);

export default wizardComponent;