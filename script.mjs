import * as THREE from 'https://unpkg.com/three@0.139.2/build/three.module.js';
import { OrbitalControls } from 'https://unpkg.com/three@0.139.2/examples/js/controls/OrbitalControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.SphereGeometry(5, 32, 32);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
const oblateSpheroid = new THREE.Mesh(geometry, material);
scene.add(oblateSpheroid);

camera.position.z = 15;

// Manipulate vertices
const positions = geometry.attributes.position;
positions.needsUpdate = true;
for (let i = 0; i < positions.count; i++) {
  const y = positions.getY(i);
  const scaleFactor = 1 - (0.4 * Math.abs(y) / 5);
  positions.setY(i, y * scaleFactor);
}

geometry.computeVertexNormals();

// Create OrbitalControls
const controls = new OrbitalControls(camera, renderer.domElement);
controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

const animate = function () {
  requestAnimationFrame(animate);
  controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
  renderer.render(scene, camera);
};

animate();
