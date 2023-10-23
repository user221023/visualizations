import * as THREE from 'https://unpkg.com/three@0.139.2/build/three.module.js';
import { OrbitControls } from './OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.sortObjects = true; // Ensure correct rendering order for transparent objects
document.body.appendChild(renderer.domElement);

const geometry = new THREE.SphereGeometry(5, 32, 32);
const material = new THREE.MeshStandardMaterial({
  color: 0x00ff00,
  transparent: true,
  opacity: 0.5,
  wireframe: false,
  side: THREE.DoubleSide // Render both sides of the mesh
});

const oblateSpheroid = new THREE.Mesh(geometry, material);
scene.add(oblateSpheroid);

// Set up lighting
const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(10, 10, 10);
scene.add(light);

// Set up ambient light
const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
scene.add(ambientLight);

camera.position.z = 15;

// Manipulate vertices to create oblate spheroid shape
const positions = geometry.attributes.position;
positions.needsUpdate = true;
for (let i = 0; i < positions.count; i++) {
  const y = positions.getY(i);
  const scaleFactor = 1 - (0.4 * (Math.abs(y) / 5) ** 2); // Adjust flattening
  positions.setY(i, y * scaleFactor);
}

geometry.computeVertexNormals();

// Set up OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

const animate = function () {
  requestAnimationFrame(animate);
  controls.update(); // Only required if controls.enableDamping = true, or if controls.autoRotate = true
  renderer.render(scene, camera);
};

animate();

