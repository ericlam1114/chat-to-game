// src/app/lib/game-engine/components/characters/vehicle.js
import { registry } from "../../component-registry";

const vehicleComponent = {
  name: "vehicle",
  priority: 4,
  dependencies: ["base", "lighting"],
  modifiesAnimation: true,
  generate: (config = {}) => {
    const type = config.type || "car"; // 'car'
    const color = config.color || "0xff0000";
    const maxSpeed = config.maxSpeed || 0.2;
    const acceleration = config.acceleration || 0.01;

    // Vehicle creation code based on type
    let vehicleCode;
    let controlCode;

    switch (type) {
      case "car":
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
  vehicle.userData.speed = Math.max(-${
    maxSpeed / 2
  }, vehicle.userData.speed - ${acceleration});
} else {
  // Gradually slow down
  if (Math.abs(vehicle.userData.speed) < 0.005) {
    vehicle.userData.speed = 0;
  } else if (vehicle.userData.speed > 0) {
    vehicle.userData.speed -= ${acceleration / 2};
  } else {
    vehicle.userData.speed += ${acceleration / 2};
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
      animationCode: controlCode,
    };
  },
};

registry.register("vehicle", vehicleComponent);

export default vehicleComponent;
