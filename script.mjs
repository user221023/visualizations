import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.sortObjects = true; // Ensure correct rendering order for transparent objects
document.body.appendChild(renderer.domElement);

scene.background = new THREE.Color(0x000000); // Set background to black for better contrast

const geometry = new THREE.SphereGeometry(5, 128, 128);

const vertexShader = `
varying vec3 vPosition;
varying vec3 vNormal;  // Add this line to declare the varying for the normal
void main() {
  vPosition = position;
  vNormal = normal; // Add this line to pass the normal to the fragment shader
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
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
    float distanceFromCenter = length(vPosition) / 5.0;
    float fadeFactor = sigmoid(distanceFromCenter);
    fadeFactor = 0.05 + 0.95 * fadeFactor; // Ensures fadeFactor doesn't go below 0.05
    
    vec3 viewDirection = normalize(vPosition); // Direction from fragment to camera
    float dotProduct = dot(viewDirection, vNormal);
    
    vec3 chosenColor = mix(interiorColor, exteriorColor, step(0.0, dotProduct));
    gl_FragColor = vec4(chosenColor, opacity * fadeFactor);
}
`;

const settings = {
    slider1: 0.1,
    slider2: 0.8,
    slider3: 0.5
};

// Initialize dat.GUI
const gui = new dat.GUI();

gui.add(settings, 'slider1', 0.0, 0.3).onChange(value => {
    uniforms.slider1.value = value;
});
gui.add(settings, 'slider2', 0.5, 1).onChange(value => {
    uniforms.slider2.value = value;
});
gui.add(settings, 'slider3', 0, 1).onChange(value => {
    uniforms.slider3.value = value;
});

const uniforms = {
    exteriorColor: { value: new THREE.Color(0x48dcf6) }, // Replace with your exterior color
    interiorColor: { value: new THREE.Color(0x9a566f) }, // Replace with your interior color
    opacity: { value: 0.8 },
    slider1: { value: settings.slider1 },
    slider2: { value: settings.slider2 },
    slider3: { value: settings.slider3 }
};

const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
});

const oblateSpheroid = new THREE.Mesh(geometry, material);
scene.add(oblateSpheroid);

    // Set up lighting
    const light = new THREE.PointLight(0xffffff, 5, 100); // Increased intensity
    light.position.set(0, 0, 10);
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
      const scaleFactor = 1 - (0.2 * (Math.abs(y) / 5) ** 2); // Adjust flattening
      positions.setY(i, y * scaleFactor);
    }

    geometry.computeVertexNormals();

    // Set up OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

const animate = function () {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
};

animate();
