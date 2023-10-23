import * as THREE from 'https://unpkg.com/three@0.139.2/build/three.module.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.SphereGeometry(5, 32, 32); // radius, widthSegments, heightSegments

geometry.vertices.forEach(vertex => {
  const y = vertex.y;
  vertex.multiplyScalar(1 + (0.2 * Math.abs(y) / 5)); // Adjust the 0.2 value to make the top and bottom flatter
});

const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
const oblateSpheroid = new THREE.Mesh(geometry, material);
scene.add(oblateSpheroid);


camera.position.z = 10;

const animate = function () {
  requestAnimationFrame(animate);
  
  oblateSpheroid.rotation.x += 0.01;
  oblateSpheroid.rotation.y += 0.01;

  renderer.render(scene, camera);
};

animate();
