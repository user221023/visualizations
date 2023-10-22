import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';

async function fetchData() {
  let points;

  try {
    const response = await fetch('https://gist.githubusercontent.com/user221023/644135557782c9f4bcbf26365644ce95/raw/fdc9fc054d27762653d366449d065718825d731f/data.json');
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    points = await response.json();
  } catch (error) {
    console.error('Error fetching data: ', error);
    // Consider showing a user-friendly message on the UI
    return;
  }

  // Initialize the scene, camera, and renderer
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Define colors
  const darkColor = 0x5099d1;
  const mediumColor = 0x48dcf6;
  const lightColor = 0x50fffb;
  const lightingColor = 0xf3d2ef;

  // Position the camera to see the lit side
  camera.position.set(1, 1, 1);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  // Initialize OrbitControls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.update();

  // Add lights
  const ambientLight = new THREE.AmbientLight(lightingColor);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(lightingColor, 1);
  directionalLight.position.set(1, 1, 1).normalize();
  scene.add(directionalLight);

  // Create the spherical band
  const bandRadius = 1;
  const bandGeometry = new THREE.SphereGeometry(bandRadius, 32, 32, 0, Math.PI * 2, Math.PI / 3, Math.PI / 3);
  const bandMaterial = new THREE.MeshPhysicalMaterial({ color: mediumColor, transparent: true, opacity: 0.8, side: THREE.DoubleSide, emissive: lightColor, emissiveIntensity: 0.2 });
  const bandMesh = new THREE.Mesh(bandGeometry, bandMaterial);
  bandMesh.rotation.x = Math.PI / 2;
  scene.add(bandMesh);

  // Create and add disks and glow
  points.forEach(point => {
    createDisk(point);
    createGlow(point);
  });

  // Position the camera closer
  camera.position.z = 0.7;

  // Render the scene
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  function createDisk(point) {
    const diskGeometry = new THREE.CircleGeometry(0.05, 32);
    const diskMaterial = new THREE.MeshBasicMaterial({ color: mediumColor, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
    const disk = new THREE.Mesh(diskGeometry, diskMaterial);
    disk.position.set(point.X, point.Y, point.Z);
    disk.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(disk);
  }

function generateSprite(color) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    0,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width / 2
  );
  gradient.addColorStop(0, `rgba(${color.r * 255},${color.g * 255},${color.b * 255},1)`);
  gradient.addColorStop(0.2, `rgba(${color.r * 255},${color.g * 255},${color.b * 255},1)`);
  gradient.addColorStop(0.4, `rgba(${color.r * 255},${color.g * 255},${color.b * 255},0.6)`);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  return canvas;
}

function createGlow(point) {
  const color = new THREE.Color(lightColor);
  const glowMaterial = new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(generateSprite(color)),
    blending: THREE.AdditiveBlending,
    color: 0xffffff,
    transparent: true,
    opacity: 0.5,
    sizeAttenuation: false,
    depthWrite: false
  });
  const glow = new THREE.Sprite(glowMaterial);
  glow.scale.set(0.2, 0.2, 1);
  glow.position.set(point.X, point.Y, point.Z);
  glow.renderOrder = 1;
  scene.add(glow);
}


fetchData();
