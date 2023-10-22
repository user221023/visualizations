import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';

async function fetchData() {
  try {
    const response = await fetch('https://gist.githubusercontent.com/user221023/644135557782c9f4bcbf26365644ce95/raw/fdc9fc054d27762653d366449d065718825d731f/data.json');
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    const points = await response.json();
    init(points);
  } catch (error) {
    console.error('Error fetching data: ', error);
  }
}

function init(points) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(1, 1, 1);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.update();

  const ambientLight = new THREE.AmbientLight(0xf3d2ef);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xf3d2ef, 1);
  directionalLight.position.set(1, 1, 1).normalize();
  scene.add(directionalLight);

  const flatPointsArray = [];
  points.forEach(p => flatPointsArray.push(p.X, p.Y, p.Z));

  const bandMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x48dcf6,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide,
    emissive: 0x50ffb,
    emissiveIntensity: 0.2
  });

  const bandGeometry = new THREE.SphereGeometry(1, 32, 32, 0, Math.PI * 2, Math.PI / 3, Math.PI / 3);
  const bandMesh = new THREE.Mesh(bandGeometry, bandMaterial);
  bandMesh.rotation.x = Math.PI / 2;
  scene.add(bandMesh);

  const pointsMaterial = new THREE.PointsMaterial({
    color: 0x5099d1,
    size: 5,
    transparent: true,
    opacity: 0.8,
    depthWrite: false
  });

  const pointsGeometry = new THREE.BufferGeometry();
  pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(flatPointsArray, 3));
  const pointsMesh = new THREE.Points(pointsGeometry, pointsMaterial);
  scene.add(pointsMesh);

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
}

fetchData();
