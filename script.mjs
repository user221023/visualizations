import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

scene.background = new THREE.Color(0x000000); // Set background to black for better contrast

const geometry = new THREE.SphereGeometry(5, 128, 128);

const vertexShader = `
precision highp float;
varying vec3 vPosition;
varying vec3 vNormal;
void main() {
  vPosition = position;
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;
uniform float slider1;
uniform float slider2;
uniform vec3 exteriorColor;
uniform vec3 interiorColor;
uniform float opacity;
varying vec3 vPosition;
varying vec3 vNormal;

float sigmoid(float x) {
    return 1.0 / (1.0 + exp(-1.0 * slider2 * (x - slider1)));
}

void main() {
    float distanceFromCenter = length(vPosition);
    float normalizedDistance = distanceFromCenter / 5.0; // assuming the sphere radius is 5
    float shellThickness = 0.1; // you can adjust this value
    float fadeFactor = sigmoid(normalizedDistance);
    fadeFactor = 0.05 + 0.95 * fadeFactor; // Ensures fadeFactor doesn't go below 0.05

    vec3 chosenColor = mix(interiorColor, exteriorColor, smoothstep(1.0 - shellThickness, 1.0, normalizedDistance));
    gl_FragColor = vec4(chosenColor, opacity * fadeFactor);
}
`;

const settings = {
    slider1: 0.1,
    slider2: 0.8
};

// Initialize dat.GUI
const gui = new dat.GUI();

gui.add(settings, 'slider1', 0.0, 0.3).onChange(value => {
    uniforms.slider1.value = value;
});
gui.add(settings, 'slider2', 0.5, 1).onChange(value => {
    uniforms.slider2.value = value;
});

const uniforms = {
    exteriorColor: { value: new THREE.Color(0x48dcf6) }, // Replace with your exterior color
    interiorColor: { value: new THREE.Color(0x9a566f) }, // Replace with your interior color
    opacity: { value: 0.8 },
    slider1: { value: settings.slider1 },
    slider2: { value: settings.slider2 }
};

const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false // Keeping this as false since object is transparent
});

const oblateSpheroid = new THREE.Mesh(geometry, material);
scene.add(oblateSpheroid);

// Set up lighting
const light = new THREE.PointLight(0xffffff, 5, 100);
light.position.set(0, 0, 10);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

camera.position.z = 15;

// Manipulate vertices to create oblate spheroid shape
const positions = geometry.attributes.position;
positions.needsUpdate = true;
for (let i = 0; i < positions.count; i++) {
  const y = positions.getY(i);
  const scaleFactor = 1 - (0.2 * (Math.abs(y) / 5) ** 2);
  positions.setY(i, y * scaleFactor);
}

geometry.computeVertexNormals();

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

const animate = function () {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
};

animate();
