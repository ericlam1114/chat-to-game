// jest.setup.js
// Create a manual mock for the canvas
const mockCanvas = {
  getContext: jest.fn(() => ({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(() => ({
      data: new Uint8Array(4),
    })),
    putImageData: jest.fn(),
    createImageData: jest.fn(),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    stroke: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    arc: jest.fn(),
    fill: jest.fn(),
    fillText: jest.fn(),
    strokeText: jest.fn(),
    measureText: jest.fn(() => ({ width: 0 })),
  })),
  toDataURL: jest.fn(),
  width: 800,
  height: 600,
  style: {},
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  setAttribute: jest.fn(),
};

// Create all the THREE.js mocks before using them
const mockThree = {
  Scene: jest.fn(() => ({
    add: jest.fn(),
    remove: jest.fn(),
    background: null,
    children: [],
  })),
  PerspectiveCamera: jest.fn(() => ({
    position: { set: jest.fn() },
    lookAt: jest.fn(),
    aspect: 1,
    updateProjectionMatrix: jest.fn(),
  })),
  WebGLRenderer: jest.fn(() => ({
    setSize: jest.fn(),
    setPixelRatio: jest.fn(),
    render: jest.fn(),
    shadowMap: {},
    domElement: mockCanvas,
  })),
  AmbientLight: jest.fn(() => ({
    intensity: 1,
  })),
  DirectionalLight: jest.fn(() => ({
    position: { set: jest.fn() },
    shadow: {
      mapSize: { width: 0, height: 0 },
      camera: { near: 0, far: 0, left: 0, right: 0, top: 0, bottom: 0 },
    },
    intensity: 1,
    castShadow: false,
  })),
  PlaneGeometry: jest.fn(),
  BoxGeometry: jest.fn(),
  MeshStandardMaterial: jest.fn(() => ({
    color: null,
    roughness: 1,
    metalness: 0,
  })),
  Mesh: jest.fn(() => ({
    position: { set: jest.fn(), copy: jest.fn() },
    rotation: { set: jest.fn(), x: 0, y: 0, z: 0 },
    add: jest.fn(),
    lookAt: jest.fn(),
    castShadow: false,
    receiveShadow: false,
  })),
  Clock: jest.fn(() => ({
    getDelta: jest.fn(() => 0.1),
    getElapsedTime: jest.fn(() => 0),
  })),
  Vector3: jest.fn(() => ({
    set: jest.fn(),
    add: jest.fn(),
    sub: jest.fn(),
    subVectors: jest.fn(),
    clone: jest.fn(function() { return this; }),
    normalize: jest.fn(function() { return this; }),
    multiplyScalar: jest.fn(function() { return this; }),
    length: jest.fn(() => 1),
    x: 0,
    y: 0,
    z: 0,
  })),
  Group: jest.fn(() => ({
    add: jest.fn(),
    position: { set: jest.fn() },
    rotation: { set: jest.fn() },
    children: [],
  })),
  // Add any other THREE objects you need
};

// Use the mock factory pattern correctly for Jest
jest.mock('three', () => mockThree, { virtual: true });

// Mock global objects
global.initRenderer = jest.fn(() => ({}));
global.container = { clientWidth: 800, clientHeight: 600 };