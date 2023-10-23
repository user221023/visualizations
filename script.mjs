import * as THREE from 'https://unpkg.com/three@0.139.2/build/three.module.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.SphereGeometry(5, 32, 32); // radius, widthSegments, heightSegments
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
const oblateSpheroid = new THREE.Mesh(geometry, material);
scene.add(oblateSpheroid);
camera.position.z = 15;

// Manipulate vertices
const positions = geometry.attributes.position;
for (let i = 0; i < positions.count; i++) {
  const y = positions.getY(i);
  const scaleFactor = 1 + (0.2 * Math.abs(y) / 5);
  positions.setXYZ(
    i,
    positions.getX(i) * scaleFactor,
    positions.getY(i) * scaleFactor,
    positions.getZ(i) * scaleFactor
  );
}

// Update the geometry after changing the vertices
geometry.attributes.position.needsUpdate = true;
geometry.computeVertexNormals();

const animate = function () {
  requestAnimationFrame(animate);
  oblateSpheroid.rotation.x += 0.01;
  oblateSpheroid.rotation.y += 0.01;
  renderer.render(scene, camera);
};

animate();
