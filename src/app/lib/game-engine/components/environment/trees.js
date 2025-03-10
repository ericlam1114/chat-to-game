// src/app/lib/game-engine/components/environment/trees.js
import { registry } from '../../component-registry';

const treesComponent = {
  name: 'trees',
  priority: 5,
  dependencies: ['base', 'ground'],
  generate: (config = {}) => {
    const count = config.count || 10;
    const treeType = config.type || 'pine'; // 'pine', 'oak', 'palm'
    const distribution = config.distribution || 'random'; // 'random', 'cluster', 'circle'
    const minDistance = config.minDistance || 5;
    const maxDistance = config.maxDistance || 40;
    
    // Generate different tree types
    let treeFunction;
    
    switch (treeType) {
      case 'oak':
        treeFunction = `
function createOakTree() {
  const tree = new THREE.Group();
  
  // Trunk
  const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 3, 8);
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.y = 1.5;
  trunk.castShadow = true;
  tree.add(trunk);
  
  // Foliage (multiple spheres for oak tree)
  const foliageColor = Math.random() > 0.5 ? 0x228B22 : 0x006400;
  
  for (let i = 0; i < 3; i++) {
    const size = 1.5 + Math.random() * 1;
    const foliageGeometry = new THREE.SphereGeometry(size, 8, 8);
    const foliageMaterial = new THREE.MeshStandardMaterial({ color: foliageColor });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    
    foliage.position.set(
      (Math.random() - 0.5) * 2,
      3 + Math.random() * 1.5,
      (Math.random() - 0.5) * 2
    );
    
    foliage.castShadow = true;
    tree.add(foliage);
  }
  
  return tree;
}`;
        break;
        
      case 'palm':
        treeFunction = `
function createPalmTree() {
  const tree = new THREE.Group();
  
  // Trunk (bent for palm tree)
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.3, 2, 0.3),
    new THREE.Vector3(0, 4, 0)
  ]);
  
  const tubeGeometry = new THREE.TubeGeometry(curve, 8, 0.3, 8, false);
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0xA0522D });
  const trunk = new THREE.Mesh(tubeGeometry, trunkMaterial);
  trunk.castShadow = true;
  tree.add(trunk);
  
  // Palm leaves
  for (let i = 0; i < 7; i++) {
    const angle = (i / 7) * Math.PI * 2;
    
    // Leaf geometry (elongated box)
    const leafGeometry = new THREE.BoxGeometry(0.2, 2.5, 0.05);
    const leafMaterial = new THREE.MeshStandardMaterial({ color: 0x00AA00 });
    const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
    
    // Position and rotate leaf
    leaf.position.set(0, 4, 0);
    leaf.rotation.z = -Math.PI / 4; // Tilt downward
    leaf.rotation.y = angle;
    
    leaf.castShadow = true;
    tree.add(leaf);
  }
  
  return tree;
}`;
        break;
        
      case 'pine':
      default:
        treeFunction = `
function createPineTree() {
  const tree = new THREE.Group();
  
  // Trunk
  const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.4, 2, 8);
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
  const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
  trunk.position.y = 1;
  trunk.castShadow = true;
  tree.add(trunk);
  
  // Pine cones (multiple cones stacked)
  const pineColor = Math.random() > 0.2 ? 0x228B22 : 0x006400;
  
  for (let i = 0; i < 3; i++) {
    const size = 1.5 - i * 0.3;
    const height = 1.2;
    const foliageGeometry = new THREE.ConeGeometry(size, height, 8);
    const foliageMaterial = new THREE.MeshStandardMaterial({ color: pineColor });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    
    foliage.position.y = 2 + i * 0.9;
    foliage.castShadow = true;
    tree.add(foliage);
  }
  
  return tree;
}`;
    }
    
    // Generate tree distribution logic based on the selected distribution type
    let distributionCode;
    
    switch (distribution) {
      case 'cluster':
        distributionCode = `
// Create tree clusters
const clusterCount = Math.ceil(${count} / 5);
for (let c = 0; c < clusterCount; c++) {
  // Create cluster center point
  const clusterX = Math.random() * ${maxDistance * 2} - ${maxDistance};
  const clusterZ = Math.random() * ${maxDistance * 2} - ${maxDistance};
  
  // Create trees around cluster center
  const treesInCluster = Math.min(5, ${count} - c * 5);
  for (let i = 0; i < treesInCluster; i++) {
    const tree = create${treeType.charAt(0).toUpperCase() + treeType.slice(1)}Tree();
    
    // Position within cluster
    const angle = Math.random() * Math.PI * 2;
    const distance = ${minDistance/2} + Math.random() * ${minDistance/2};
    
    tree.position.set(
      clusterX + Math.cos(angle) * distance,
      0,
      clusterZ + Math.sin(angle) * distance
    );
    
    // Add some variety with rotation and scale
    tree.rotation.y = Math.random() * Math.PI * 2;
    const scale = 0.7 + Math.random() * 0.6;
    tree.scale.set(scale, scale, scale);
    
    scene.add(tree);
  }
}`;
        break;
        
      case 'circle':
        distributionCode = `
// Create trees in a circle
for (let i = 0; i < ${count}; i++) {
  const tree = create${treeType.charAt(0).toUpperCase() + treeType.slice(1)}Tree();
  
  // Position in a circle
  const angle = (i / ${count}) * Math.PI * 2;
  const distance = ${minDistance} + Math.random() * ${maxDistance - minDistance};
  
  tree.position.set(
    Math.cos(angle) * distance,
    0,
    Math.sin(angle) * distance
  );
  
  // Add some variety with rotation and scale
  tree.rotation.y = Math.random() * Math.PI * 2;
  const scale = 0.7 + Math.random() * 0.6;
  tree.scale.set(scale, scale, scale);
  
  scene.add(tree);
}`;
        break;
        
      case 'random':
      default:
        distributionCode = `
// Create randomly positioned trees
for (let i = 0; i < ${count}; i++) {
  const tree = create${treeType.charAt(0).toUpperCase() + treeType.slice(1)}Tree();
  
  // Random position
  const angle = Math.random() * Math.PI * 2;
  const distance = ${minDistance} + Math.random() * ${maxDistance - minDistance};
  
  tree.position.set(
    Math.cos(angle) * distance,
    0,
    Math.sin(angle) * distance
  );
  
  // Add some variety with rotation and scale
  tree.rotation.y = Math.random() * Math.PI * 2;
  const scale = 0.7 + Math.random() * 0.6;
  tree.scale.set(scale, scale, scale);
  
  scene.add(tree);
}`;
    }
    
    return `
// Add trees to scene
${treeFunction}

${distributionCode}
`;
  }
};

registry.register('trees', treesComponent);

export default treesComponent;