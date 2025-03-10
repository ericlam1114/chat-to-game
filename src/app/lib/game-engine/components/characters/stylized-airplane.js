// src/app/lib/game-engine/components/characters/stylized-airplane.js
import { registry } from "../../component-registry";
import { characterManager } from "../../character-manager";

/**
 * Stylized Airplane Component
 *
 * This component creates a stylized airplane using CSS3D transforms
 * instead of the Three.js geometric model. It creates a DOM-based
 * airplane that uses the CSS styling from the provided reference.
 */
const stylizedAirplaneComponent = {
  name: "stylizedAirplane",
  priority: 4,
  dependencies: ["base", "lighting"],
  modifiesAnimation: true,

  generate: (config = {}) => {
    const color = config.color || "red"; // Default accent color
    const maxSpeed = config.maxSpeed || 0.3;
    const acceleration = config.acceleration || 0.01;
    const accentHue = config.accentHue || 10; // Default accent hue (red)

    // Setup code for the stylized airplane
    const setupCode = `
// Create a CSS3D stylized airplane
// We'll need to create a container for our CSS3D objects
if (!window.CSS3DRenderer) {
  console.error('CSS3DRenderer is required for stylized airplane');
  return;
}

// Create a container for our CSS3D elements
const container = document.createElement('div');
container.id = 'css3d-container';
container.style.position = 'absolute';
container.style.top = '0';
container.style.left = '0';
container.style.width = '100%';
container.style.height = '100%';
container.style.pointerEvents = 'none';
container.style.overflow = 'hidden';
document.body.appendChild(container);

// Create a CSS3D renderer
const css3dRenderer = new CSS3DRenderer();
css3dRenderer.setSize(window.innerWidth, window.innerHeight);
css3dRenderer.domElement.style.position = 'absolute';
css3dRenderer.domElement.style.top = '0';
css3dRenderer.domElement.style.left = '0';
css3dRenderer.domElement.style.pointerEvents = 'none';
container.appendChild(css3dRenderer.domElement);

// Create a CSS3D scene
const css3dScene = new THREE.Scene();

// Add CSS3D airplane styles to the document
const styleElement = document.createElement('style');
styleElement.textContent = \`
  :root {
    --dark: 0;
    --base-size: 20;
    --plane-height: calc(var(--base-size) * 1vmin);
    --plane-width: calc(var(--plane-height) * 1.6);
    --accent-hue: ${accentHue};
    --white-one: hsl(0, 0%, calc((90 - (var(--dark) * 30)) * 1%));
    --white-two: hsl(0, 0%, calc((85 - (var(--dark) * 30)) * 1%));
    --white-three: hsl(0, 0%, calc((80 - (var(--dark) * 30)) * 1%));
    --white-four: hsl(0, 0%, calc((75 - (var(--dark) * 30)) * 1%));
    --white-five: hsl(0, 0%, calc((70 - (var(--dark) * 30)) * 1%));
    --accent-one: hsl(var(--accent-hue), 80%, calc((60 - (var(--dark) * 20)) * 1%));
    --accent-two: hsl(var(--accent-hue), 80%, calc((55 - (var(--dark) * 20)) * 1%));
    --accent-three: hsl(var(--accent-hue), 80%, calc((50 - (var(--dark) * 20)) * 1%));
    --accent-four: hsl(var(--accent-hue), 80%, calc((45 - (var(--dark) * 20)) * 1%));
    --accent-five: hsl(var(--accent-hue), 80%, calc((40 - (var(--dark) * 20)) * 1%));
    --screen: hsla(210, 80%, calc((70 - (var(--dark) * 20)) * 1%), 0.25);
    --metal-one: hsl(0, 0%, calc((60 - (var(--dark) * 20)) * 1%));
    --metal-two: hsl(0, 0%, calc((50 - (var(--dark) * 20)) * 1%));
    --metal-three: hsl(0, 0%, calc((40 - (var(--dark) * 20)) * 1%));
    --wheel-one: hsl(0, 0%, 10%);
    --wheel-two: hsl(0, 0%, 5%);
    --wheel-three: hsl(0, 0%, 0%);
    --wheel-hub: hsl(0, 0%, calc((98 - (var(--dark) * 20)) * 1%));
    --thickness: 0.4;
  }
  
  .cuboid {
    width: 100%;
    height: 100%;
    position: relative;
    transform-style: preserve-3d;
  }
  
  .cuboid__side {
    position: absolute;
    transform-style: preserve-3d;
  }
  
  .cuboid__side:nth-of-type(1) {
    height: calc(var(--thickness) * 1vmin);
    width: 100%;
    position: absolute;
    top: 0;
    transform: translate(0, -50%) rotateX(90deg);
  }
  
  .cuboid__side:nth-of-type(2) {
    height: 100%;
    width: calc(var(--thickness) * 1vmin);
    position: absolute;
    top: 50%;
    right: 0;
    transform: translate(50%, -50%) rotateY(90deg);
  }
  
  .cuboid__side:nth-of-type(3) {
    width: 100%;
    height: calc(var(--thickness) * 1vmin);
    position: absolute;
    bottom: 0;
    transform: translate(0%, 50%) rotateX(90deg);
  }
  
  .cuboid__side:nth-of-type(4) {
    height: 100%;
    width: calc(var(--thickness) * 1vmin);
    position: absolute;
    left: 0;
    top: 50%;
    transform: translate(-50%, -50%) rotateY(90deg);
  }
  
  .cuboid__side:nth-of-type(5) {
    height: 100%;
    width: 100%;
    transform: translate3d(0, 0, calc(var(--thickness) * 0.5vmin));
    position: absolute;
    top: 0;
    left: 0;
  }
  
  .cuboid__side:nth-of-type(6) {
    height: 100%;
    width: 100%;
    transform: translate3d(0, 0, calc(var(--thickness) * -0.5vmin)) rotateY(180deg);
    position: absolute;
    top: 0;
    left: 0;
  }
  
  * {
    box-sizing: border-box;
    transform-style: preserve-3d;
    transition: background 0.25s;
  }
  
  .scene {
    transform: translate(-50%, -50%);
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%, -50%, 100vmin) rotateX(-24deg) rotateY(44deg);
  }
  
  .plane {
    height: var(--plane-height);
    width: var(--plane-width);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  
  .plane__floater {
    position: absolute;
    width: var(--plane-width);
    height: var(--plane-width);
    transform: translate(-50%, -50%);
    top: 50%;
    left: 50%;
  }
  
  .plane__looper {
    position: absolute;
    width: var(--plane-width);
    height: var(--plane-width);
    transform: translate(-50%, -50%);
    top: 50%;
    left: 50%;
    transform-origin: 50% 0;
  }
  
  .plane * {
    position: absolute;
  }
  
  .plane__body {
    height: 40%;
    width: 36%;
    bottom: 20%;
    left: 10%;
  }
  
  .plane__wheels {
    bottom: 0;
    width: calc(var(--plane-height) * 0.2);
    left: 32%;
    transform: translate(-50%, 0);
    height: 20%;
  }
  
  .plane__axle {
    height: 50%;
    width: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  
  .plane__wheel {
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
  }
  
  .plane__wings {
    height: 70%;
    width: 40%;
    bottom: 19%;
    left: 12%;
  }
  
  .plane__tail {
    height: 40%;
    width: 54%;
    bottom: 20%;
    left: 46%;
  }
  
  .plane__nose {
    height: 30%;
    width: 10%;
    bottom: 25%;
  }
  
  .plane__stabilizer--horizontal {
    height: 9%;
    width: 16%;
    right: 1%;
    bottom: 50%;
  }
  
  .plane__screen {
    bottom: 60%;
    left: 30%;
    width: 6%;
    height: 14%;
  }
  
  .plane__propellor {
    height: calc(var(--base-size) * 0.75vmin);
    width: calc(var(--base-size) * 0.75vmin);
    left: -1%;
    bottom: 40%;
    transform: translate(-50%, 50%) rotateY(-90deg);
  }
  
  .plane__propellor:after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%, -50%, 2px);
    height: 16%;
    width: 16%;
    border-radius: 50%;
    background: var(--white-one);
  }
  
  .plane__stabilizer--vertical {
    height: 20%;
    width: 20%;
    right: 0;
    bottom: 60%;
  }
  
  .plane__beacon {
    right: 1%;
    bottom: 80%;
    height: 2%;
    width: 2%;
  }
  
  .plane__wheel--left {
    transform: translate3d(0, 0, calc(var(--base-size) * 0.3vmin));
  }
  
  .plane__wheel--right {
    transform: translate3d(0, 0, calc(var(--base-size) * -0.3vmin));
  }
  
  .propellor {
    height: 100%;
    width: 100%;
  }
  
  .propellor:after,
  .propellor:before {
    content: '';
    height: 100%;
    width: 10%;
    position: absolute;
    top: 50%;
    left: 50%;
    background: linear-gradient(transparent 0 5%, var(--accent-two) 5% 15%, transparent 15% 85%, var(--accent-two) 85% 95%, transparent 95%), hsl(0, 0%, 0%);
    transform: translate(-50%, -50%) rotate(calc(var(--r, 45) * 1deg));
  }
  
  .propellor:after {
    --r: -45;
  }
  
  .wings__ghost {
    height: 80%;
    width: 80%;
    left: 50%;
    bottom: 10%;
    transform: translate(-50%, 0);
  }
  
  .wings__top {
    top: 0;
    height: 10%;
    width: 100%;
    left: 0;
  }
  
  .wings__bottom {
    bottom: 0;
    height: 10%;
    width: 100%;
    left: 0;
  }
  
  .wings__strobe {
    bottom: 10%;
    height: 4%;
    width: 4%;
    left: 50%;
  }
  
  .wings__strobe--left {
    transform: translate3d(-50%, 0, calc(var(--base-size) * 1vmin));
  }
  
  .wings__strobe--right {
    transform: translate3d(-50%, 0, calc(var(--base-size) * -1vmin));
  }
  
  .cuboid--body div {
    background: var(--white-two);
  }
  
  .cuboid--body div:nth-of-type(1) {
    background: var(--white-one);
  }
  
  .cuboid--body div:nth-of-type(2) {
    background: var(--white-two);
  }
  
  .cuboid--body div:nth-of-type(3) {
    background: var(--white-three);
  }
  
  .cuboid--body div:nth-of-type(4) {
    background: var(--white-four);
  }
  
  .cuboid--screen {
    --thickness: calc(var(--base-size) * 0.26);
  }
  
  .cuboid--screen div {
    background: var(--screen);
  }
  
  .cuboid--tail {
    --thickness: calc(var(--base-size) * 0.3);
  }
  
  .cuboid--tail div {
    background: var(--white-two);
  }
  
  .cuboid--tail div:nth-of-type(1) {
    background: var(--white-one);
  }
  
  .cuboid--nose {
    --thickness: calc(var(--base-size) * 0.3);
  }
  
  .cuboid--nose div {
    background: var(--metal-three);
  }
  
  .cuboid--nose div:nth-of-type(1) {
    background: var(--metal-one);
  }
  
  .cuboid--nose div:nth-of-type(2) {
    background: var(--metal-two);
  }
  
  .cuboid--nose div:nth-of-type(3) {
    background: var(--metal-one);
  }
  
  .cuboid--wings-ghost,
  .cuboid--wings-top,
  .cuboid--wings-bottom {
    --thickness: calc(var(--base-size) * 2.2);
  }
  
  .cuboid--wings-ghost div,
  .cuboid--wings-top div,
  .cuboid--wings-bottom div {
    background: var(--accent-one);
  }
  
  .cuboid--wings-ghost div:nth-of-type(1),
  .cuboid--wings-top div:nth-of-type(1),
  .cuboid--wings-bottom div:nth-of-type(1) {
    background: var(--accent-two);
  }
  
  .cuboid--wings-ghost div:nth-of-type(2),
  .cuboid--wings-ghost div:nth-of-type(5),
  .cuboid--wings-top div:nth-of-type(2),
  .cuboid--wings-top div:nth-of-type(5),
  .cuboid--wings-bottom div:nth-of-type(2),
  .cuboid--wings-bottom div:nth-of-type(5) {
    background: var(--accent-three);
  }
  
  .cuboid--wings-ghost div:nth-of-type(4),
  .cuboid--wings-top div:nth-of-type(4),
  .cuboid--wings-bottom div:nth-of-type(4) {
    background: var(--accent-four);
  }
  
  .cuboid--wings-ghost div:nth-of-type(3),
  .cuboid--wings-top div:nth-of-type(3),
  .cuboid--wings-bottom div:nth-of-type(3) {
    background: var(--accent-five);
  }
  
  .cuboid--axle {
    --thickness: calc(var(--base-size) * 0.5);
  }
  
  .cuboid--axle div {
    background: var(--metal-two);
  }
  
  .cuboid--axle div:nth-of-type(3) {
    background: var(--metal-three);
  }
  
  .cuboid--axle div:nth-of-type(2),
  .cuboid--axle div:nth-of-type(1),
  .cuboid--axle div:nth-of-type(6) {
    background: var(--metal-one);
  }
  
  .cuboid--horizontal-stabilizer {
    --thickness: calc(var(--base-size) * 0.65);
  }
  
  .cuboid--horizontal-stabilizer div {
    background: var(--accent-one);
  }
  
  .cuboid--horizontal-stabilizer div:nth-of-type(1) {
    background: var(--accent-two);
  }
  
  .cuboid--vertical-stabilizer {
    --thickness: calc(var(--base-size) * 0.2);
  }
  
  .cuboid--vertical-stabilizer div {
    background: var(--accent-one);
  }
  
  .cuboid--wheel-left,
  .cuboid--wheel-right {
    --thickness: calc(var(--base-size) * 0.1);
  }
  
  .cuboid--wheel-left div,
  .cuboid--wheel-right div {
    background: var(--wheel-one);
  }
  
  .cuboid--wheel-left div:nth-of-type(1),
  .cuboid--wheel-left div:nth-of-type(2),
  .cuboid--wheel-left div:nth-of-type(4),
  .cuboid--wheel-right div:nth-of-type(1),
  .cuboid--wheel-right div:nth-of-type(2),
  .cuboid--wheel-right div:nth-of-type(4) {
    background: var(--wheel-two);
  }
  
  .cuboid--wheel-left div:nth-of-type(3),
  .cuboid--wheel-right div:nth-of-type(3) {
    background: var(--wheel-three);
  }
  
  .cuboid--beacon {
    --thickness: calc(var(--base-size) * 0.02);
    --alpha: 0;
    animation: flash 1s infinite;
  }
  
  .cuboid--beacon div {
    background: hsla(0, 90%, 50%, var(--alpha));
  }
  
  .cuboid--strobe {
    --thickness: calc(var(--base-size) * 0.02);
    --alpha: 0;
    animation: flash 0.5s infinite;
  }
  
  .cuboid--strobe div {
    background: hsla(0, 90%, 98%, var(--alpha));
  }
  
  @keyframes flash {
    50% {
      --alpha: 1;
    }
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  .propellor {
    animation: spin 0.35s infinite linear;
  }
\`;
document.head.appendChild(styleElement);

// Create the HTML structure for our plane
const planeElement = document.createElement('div');
planeElement.className = 'scene';
planeElement.innerHTML = \`
  <div class="plane__floater">
    <div class="plane__looper">
      <div class="plane">
        <div class="plane__wheels">
          <div class="plane__axle">
            <div class="cuboid cuboid--axle">
              <div class="cuboid__side"></div>
              <div class="cuboid__side"></div>
              <div class="cuboid__side"></div>
              <div class="cuboid__side"></div>
              <div class="cuboid__side"></div>
              <div class="cuboid__side"></div>
            </div>
          </div>
          <div class="plane__wheel plane__wheel--left">
            <div class="cuboid cuboid--wheel-left">
              <div class="cuboid__side"></div>
              <div class="cuboid__side"></div>
              <div class="cuboid__side"></div>
              <div class="cuboid__side"></div>
              <div class="cuboid__side"></div>
              <div class="cuboid__side"></div>
            </div>
          </div>
          <div class="plane__wheel plane__wheel--right">
            <div class="cuboid cuboid--wheel-right">
              <div class="cuboid__side"></div>
              <div class="cuboid__side"></div>
              <div class="cuboid__side"></div>
              <div class="cuboid__side"></div>
              <div class="cuboid__side"></div>
              <div class="cuboid__side"></div>
            </div>
          </div>
        </div>
        <div class="plane__body">
          <div class="cuboid cuboid--body">
            <div class="cuboid__side"></div>
            <div class="cuboid__side"></div>
            <div class="cuboid__side"></div>
            <div class="cuboid__side"></div>
            <div class="cuboid__side"></div>
            <div class="cuboid__side"></div>
          </div>
        </div>
        <div class="plane__nose">
          <div class="cuboid cuboid--nose">
            <div class="cuboid__side"></div>
            <div class="cuboid__side"></div>
            <div class="cuboid__side"></div>
            <div class="cuboid__side"></div>
            <div class="cuboid__side"></div>
            <div class="cuboid__side"></div>
          </div>
        </div>
        <div class="plane__propellor">
          <div class="propellor"></div>
        </div>
        <div class="plane__screen">
          <div class="cuboid cuboid--screen">
            <div class="cuboid__side"></div>
            <div class="cuboid__side"></div>
            <div class="cuboid__side"></div>
            <div class="cuboid__side"></div>
            <div class="cuboid__side"></div>
            <div class="cuboid__side"></div>
          </div>
        </div>
        <div class="plane__wings wings">
          <div class="wings__top">
            <div class="cuboid cuboid--wings-top">
              <div class="cuboid__side"></div>
              <div class="cuboid__side"></div>
              <div class="cuboid__side"></div>
              <div class="cuboid__side"></div>
              <div class="cuboid__side"></div>
              <div class="cuboid__side"></div>
            </div>
          </div>
          <div class="wings__ghost">
            <div class="cuboid cuboid--wings-ghost">
              <div class="cuboid__side"></div>
              <div class="cuboid__side"></div>
              <div class="cuboid__side"></div>
              <div class="cuboid__side"></div>
              <div class="cuboid__side"></div>
              <div class="cuboid__side"></div>
            </div>
          </div>
          <div class="wings__bottom">
            <div class="cuboid cuboid--wings-bottom">
              <div class="cuboid__side"></div>
              <div class="cuboid__side"></div>
              <div class="cuboid__side"></div>
              <div class="cuboid__side"></div>
              <div class="cuboid__side"></div>
              <div class="cuboid__side"></div>
            </div>
          </div>
          <div class="wings__strobe wings__strobe--left">
            <div class="cuboid cuboid--strobe">
              <div class="cuboid__side"></div>
              <div class="cuboid__side"></div>
              <div class="cuboid__side"></div>
              <div class="cuboid__side"></div>
              <div class="cuboid__side"></div>
              <div class="cuboid__side"></div>
            </div>
          </div>
          <div class="wings__strobe wings__strobe--right">
            <div class="cuboid cuboid--strobe">
              <div class="cuboid__side"></div>
              <div class="cuboid__side"></div>
              <div class="cuboid__side"></div>
              <div class="cuboid__side"></div>
              <div class="cuboid__side"></div>
              <div class="cuboid__side"></div>
            </div>
          </div>
        </div>
        <div class="plane__tail">
          <div class="cuboid cuboid--tail">
            <div class="cuboid__side"></div>
            <div class="cuboid__side"></div>
            <div class="cuboid__side"></div>
            <div class="cuboid__side"></div>
            <div class="cuboid__side"></div>
            <div class="cuboid__side"></div>
          </div>
        </div>
        <div class="plane__stabilizer plane__stabilizer--horizontal">
          <div class="cuboid cuboid--horizontal-stabilizer">
            <div class="cuboid__side"></div>
            <div class="cuboid__side"></div>
            <div class="cuboid__side"></div>
            <div class="cuboid__side"></div>
            <div class="cuboid__side"></div>
            <div class="cuboid__side"></div>
          </div>
        </div>
        <div class="plane__stabilizer plane__stabilizer--vertical">
          <div class="cuboid cuboid--vertical-stabilizer">
            <div class="cuboid__side"></div>
            <div class="cuboid__side"></div>
            <div class="cuboid__side"></div>
            <div class="cuboid__side"></div>
            <div class="cuboid__side"></div>
            <div class="cuboid__side"></div>
          </div>
        </div>
        <div class="plane__beacon">
          <div class="cuboid cuboid--beacon">
            <div class="cuboid__side"></div>
            <div class="cuboid__side"></div>
            <div class="cuboid__side"></div>
            <div class="cuboid__side"></div>
            <div class="cuboid__side"></div>
            <div class="cuboid__side"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
\`;

// Create a CSS3D object for the plane
const planeObject = new CSS3DObject(planeElement);
planeObject.scale.set(0.5, 0.5, 0.5); // Scale it down
planeObject.position.set(0, 10, 0); // Position it at the same place as the 3D plane

// Add to CSS3D scene
css3dScene.add(planeObject);

// Create a Three.js object for physics and interaction
const airplane = new THREE.Group();
airplane.position.copy(planeObject.position);

// Add a simple collider for physics
const airplaneCollider = new THREE.Mesh(
  new THREE.BoxGeometry(3, 1, 6),
  new THREE.MeshBasicMaterial({ visible: false })
);
airplane.add(airplaneCollider);

// Initialize airplane properties (same as the 3D version)
airplane.userData.speed = 0;
airplane.userData.altitude = 10;
airplane.userData.targetAltitude = 10;
airplane.userData.roll = 0;
airplane.userData.pitch = 0;
airplane.userData.gearDown = true;
airplane.userData.lastGKeyState = false;
airplane.userData.css3dObject = planeObject; // Reference to the CSS3D object

// Add to Three.js scene
scene.add(airplane);

// Create a helper function to update CSS3D renderer on window resize
window.addEventListener('resize', () => {
  css3dRenderer.setSize(window.innerWidth, window.innerHeight);
});

// Update the CSS variable for accent color
document.documentElement.style.setProperty('--accent-hue', '${accentHue}');
`;

    // Animation code for the stylized airplane
    const animationCode = `
// Stylized Airplane animation
const airplane = scene.getObjectByName('airplane') || scene.children.find(obj => obj.userData && obj.userData.css3dObject);
if (!airplane) return;

const planeObject = airplane.userData.css3dObject;
const deltaTime = clock.getDelta();
const time = clock.getElapsedTime();

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
  // Apply rotations for the Three.js object
airplane.rotation.z = airplane.userData.roll;
airplane.rotation.x = airplane.userData.pitch;

// Apply banking effect on turning
const turnRate = -airplane.userData.roll * 0.7 * airplane.userData.speed;
airplane.rotation.y = Math.PI + turnRate;

// Also apply the same rotations to the CSS3D object
planeObject.rotation.z = airplane.userData.roll;
planeObject.rotation.x = airplane.userData.pitch;
planeObject.rotation.y = Math.PI + turnRate;

// Move airplane forward based on its orientation
const direction = new THREE.Vector3(0, 0, -1);
direction.applyQuaternion(airplane.quaternion);
direction.multiplyScalar(airplane.userData.speed);
airplane.position.add(direction);

// Sync CSS3D object position with Three.js object
planeObject.position.copy(airplane.position);

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
  
  // Toggle wheels visibility
  const wheelsElement = planeElement.querySelector('.plane__wheels');
  if (wheelsElement) {
    wheelsElement.style.visibility = airplane.userData.gearDown ? 'visible' : 'hidden';
  }
}
airplane.userData.lastGKeyState = keys.g || false;

// Update camera to follow airplane
const cameraOffset = new THREE.Vector3(0, 2, 10);
cameraOffset.applyQuaternion(airplane.quaternion);
camera.position.copy(airplane.position).add(cameraOffset);
camera.lookAt(airplane.position);

// Render the CSS3D scene
if (window.css3dRenderer) {
  css3dRenderer.render(css3dScene, camera);
}
`;

    // Complete the component return and export
    return {
      code: setupCode,
      animationCode: animationCode,
    };
  },
};

// Register the component
registry.register("stylizedAirplane", stylizedAirplaneComponent);

export default stylizedAirplaneComponent;
