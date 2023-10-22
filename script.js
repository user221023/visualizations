import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';
import { UnrealBloomPass } from './UnrealBloomPass.js';
import { EffectComposer } from './EffectComposer.js';
import { RenderPass } from './RenderPass.js';

const params = {
  bloomThreshold: 0.9,
  bloomStrength: 1.5,
  bloomRadius: 0.4
};

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
    return;
  }

  // Initialize the scene, camera, and renderer
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x192327);
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const darkColor = new THREE.Color(0x5099d1);
  const mediumColor = new THREE.Color(0x48dcf6);
  const lightColor = new THREE.Color(0x50fffb);
  const lightingColor = new THREE.Color(0xebc1e6);

  // Initialize OrbitControls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.update();

  // Add Ambient Light
  const ambientLight = new THREE.AmbientLight(lightingColor);
  scene.add(ambientLight);

  // Add Directional Light
  const directionalLight = new THREE.DirectionalLight(lightingColor, 1.0);
  directionalLight.position.set(1, 1, 1).normalize();
  scene.add(directionalLight);

  const pointMaterial = new THREE.ShaderMaterial({
    uniforms: {
      color1: { value: darkColor },
      color2: { value: lightColor },
      size: { value: 20.0 },
      scale: { value: window.innerHeight / 2 }
    },
    vertexShader: `
      uniform vec3 color1;
      uniform vec3 color2;
      uniform float size;
      uniform float scale;
      varying vec3 vColor;
      void main() {
        vColor = mix(color1, color2, position.z);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (scale / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        float r = distance(gl_PointCoord, vec2(0.5, 0.5));
        float delta = fwidth(r);
        float alpha = 1.0 - smoothstep(0.5 - delta, 0.5 + delta, r);
        if (r > 0.5) {
          discard;
        }
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true
  });

  // Create points and add them to the scene
  const pointsGeometry = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(p.X, p.Y, p.Z)));
  const pointsMesh = new THREE.Points(pointsGeometry, pointMaterial);
  scene.add(pointsMesh);

  // Create the spherical band
  const bandRadius = 1;
  const bandGeometry = new THREE.SphereGeometry(bandRadius, 32, 32, 0, Math.PI * 2, Math.PI / 3, Math.PI / 3);
  const bandMaterial = new THREE.MeshPhysicalMaterial({
    color: darkColor,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide,
    emissive: darkColor,
    emissiveIntensity: 0.0
  });
  const bandMesh = new THREE.Mesh(bandGeometry, bandMaterial);
  bandMesh.rotation.x = Math.PI / 2;
  scene.add(bandMesh);

  // Position the camera closer
  camera.position.z = 1.2;

  // Setup Post-Processing: Setup UnrealBloomPass here
  const renderScene = new RenderPass(scene, camera);
  const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
  bloomPass.threshold = params.bloomThreshold;
  bloomPass.strength = params.bloomStrength;
  bloomPass.radius = params.bloomRadius;

  const composer = new EffectComposer(renderer);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);

  // Render the scene
  function animate() {
    requestAnimationFrame(animate);
    bloomPass.threshold = params.bloomThreshold;
    bloomPass.strength = params.bloomStrength;
    bloomPass.radius = params.bloomRadius;
    controls.update();
    composer.render();
  }
  animate();
}

fetchData();
