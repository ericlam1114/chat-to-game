'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// A sandbox environment to safely execute the generated Three.js code
function createSandbox(containerElement, onError) {
  // Create a clean THREE instance that can be used by the generated code
  const sandbox = {
    THREE: THREE,
    OrbitControls: OrbitControls,
    container: containerElement,
    
    // Core renderer, scene, and camera that will be used
    renderer: null,
    scene: null,
    camera: null,
    
    // Game state
    running: false,
    animationFrameId: null,
    
    // Cleanup method
    dispose: function() {
      this.running = false;
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
      
      // Dispose of Three.js resources
      if (this.renderer) {
        this.renderer.dispose();
      }
      
      // Clear the container
      while (containerElement.firstChild) {
        containerElement.removeChild(containerElement.firstChild);
      }
    },
    
    // Method to initialize the renderer
    initRenderer: function() {
      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setSize(containerElement.clientWidth, containerElement.clientHeight);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      containerElement.appendChild(this.renderer.domElement);
      
      // Handle window resize
      window.addEventListener('resize', () => {
        if (this.camera) {
          this.camera.aspect = containerElement.clientWidth / containerElement.clientHeight;
          this.camera.updateProjectionMatrix();
        }
        if (this.renderer) {
          this.renderer.setSize(containerElement.clientWidth, containerElement.clientHeight);
        }
      });
    }
  };
  
  return sandbox;
}

// Function to safely execute the game code in the sandbox
function executeGameCode(sandbox, gameCode, onError) {
  try {
    // Create a function from the game code string
    const gameFunction = new Function(
      'THREE', 
      'OrbitControls',
      'container', 
      'initRenderer',
      'dispose',
      'onError',
      `
        try {
          ${gameCode}
        } catch (err) {
          onError(err);
        }
      `
    );
    
    // Call the function with the sandbox context
    gameFunction(
      sandbox.THREE,
      sandbox.OrbitControls,
      sandbox.container,
      sandbox.initRenderer.bind(sandbox),
      sandbox.dispose.bind(sandbox),
      onError
    );
    
    return true;
  } catch (err) {
    onError(err);
    return false;
  }
}

export default function ThreeJsRenderer({ gameCode, gameType, onError }) {
  const containerRef = useRef(null);
  const sandboxRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !gameCode) return;
    
    // Create a new sandbox environment
    const sandbox = createSandbox(containerRef.current, onError);
    sandboxRef.current = sandbox;
    
    // Execute the game code
    const success = executeGameCode(sandbox, gameCode, onError);
    
    // Cleanup when the component unmounts
    return () => {
      if (sandboxRef.current) {
        sandboxRef.current.dispose();
      }
    };
  }, [gameCode, onError]);
  
  // If the game type changes, we need to re-initialize the sandbox
  useEffect(() => {
    if (gameType && sandboxRef.current) {
      sandboxRef.current.dispose();
      const sandbox = createSandbox(containerRef.current, onError);
      sandboxRef.current = sandbox;
      executeGameCode(sandbox, gameCode, onError);
    }
  }, [gameType, gameCode, onError]);

  return <div ref={containerRef} className="w-full h-full"></div>;
}