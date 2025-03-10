// jest.setup.js
// Mock the THREE.js library
jest.mock('three', () => ({
    Scene: jest.fn(),
    PerspectiveCamera: jest.fn(),
    WebGLRenderer: jest.fn().mockImplementation(() => ({
      setSize: jest.fn(),
      setPixelRatio: jest.fn(),
      render: jest.fn(),
      shadowMap: {},
      domElement: document.createElement('canvas')
    })),
    AmbientLight: jest.fn(),
    DirectionalLight: jest.fn().mockImplementation(() => ({
      position: { set: jest.fn() },
      shadow: {
        mapSize: { width: 0, height: 0 },
        camera: { near: 0, far: 0, left: 0, right: 0, top: 0, bottom: 0 }
      }
    })),
    PlaneGeometry: jest.fn(),
    BoxGeometry: jest.fn(),
    MeshStandardMaterial: jest.fn(),
    Mesh: jest.fn().mockImplementation(() => ({
      position: { set: jest.fn(), copy: jest.fn() },
      rotation: { set: jest.fn(), x: 0, y: 0, z: 0 },
      add: jest.fn(),
      lookAt: jest.fn(),
      castShadow: false,
      receiveShadow: false
    })),
    Clock: jest.fn().mockImplementation(() => ({
      getDelta: jest.fn().mockReturnValue(0.1),
      getElapsedTime: jest.fn().mockReturnValue(0)
    })),
    Vector3: jest.fn().mockImplementation(() => ({
      set: jest.fn(),
      add: jest.fn(),
      sub: jest.fn(),
      subVectors: jest.fn(),
      clone: jest.fn().mockReturnThis(),
      normalize: jest.fn().mockReturnThis(),
      multiplyScalar: jest.fn().mockReturnThis(),
      length: jest.fn().mockReturnValue(1)
    })),
    Group: jest.fn().mockImplementation(() => ({
      add: jest.fn(),
      position: { set: jest.fn() },
      rotation: { set: jest.fn() }
    }))
  }));
  
  // Mock global objects that would be available in ThreeJsRenderer
  global.initRenderer = jest.fn().mockReturnValue({});
  global.container = { clientWidth: 800, clientHeight: 600 };