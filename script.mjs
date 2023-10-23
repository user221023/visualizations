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
#version 100
#extension GL_OES_standard_derivatives : enable

varying vec3 vOriginalPosition;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
    vOriginalPosition = position;
    vec3 flattenedPosition = position;
    flattenedPosition.y *= 1.0 - 0.2 * pow(abs(flattenedPosition.y) / 5.0, 2.0); // Adjust flattening
    vPosition = flattenedPosition;
    
    vec3 dx = vec3(dFdx(flattenedPosition.x), dFdx(flattenedPosition.y), dFdx(flattenedPosition.z));
    vec3 dy = vec3(dFdy(flattenedPosition.x), dFdy(flattenedPosition.y), dFdy(flattenedPosition.z));
    vNormal = normalize(cross(dx, dy));

    gl_Position = projectionMatrix * modelViewMatrix * vec4(flattenedPosition, 1.0);
}
`;

const fragmentShader = `
uniform float slider1;
uniform float slider2;
uniform vec3 exteriorColor;
uniform vec3 interiorColor;
uniform float opacity;
uniform float shellThickness;
uniform vec3 ambientLight;
uniform vec3 pointLightPosition;
uniform vec3 pointLightColor;
uniform float pointLightIntensity;

varying vec3 vOriginalPosition;
varying vec3 vPosition;
varying vec3 vNormal;

float sigmoid(float x) {
  return 1.0 / (1.0 + exp(-1.0 * slider2 * (x - slider1)));
}

void main() {
  float originalDistance = length(vOriginalPosition) / 5.0;
  float fadeFactor = sigmoid(originalDistance);
  fadeFactor = 0.05 + 0.95 * fadeFactor; // Ensures fadeFactor doesn't go below 0.05
  
  // Determine the color based on the original position
  float originalNormalizedDistance = originalDistance;
  vec3 chosenColor = mix(interiorColor, exteriorColor, smoothstep(1.0 - shellThickness, 1.0, originalNormalizedDistance));
  
  // Lighting calculations
  vec3 normalizedNormal = normalize(vNormal);
  vec3 lightDir = normalize(pointLightPosition - vPosition);
  float diff = max(dot(normalizedNormal, lightDir), 0.0);
  vec3 diffuse = diff * pointLightColor * pointLightIntensity;
  
  vec3 ambient = ambientLight * chosenColor;
  vec3 result = (ambient + diffuse) * chosenColor;
  
  gl_FragColor = vec4(result, opacity * fadeFactor);
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
    exteriorColor: { value: new THREE.Color(0x48dcf6) },
    interiorColor: { value: new THREE.Color(0x9a566f) },
    opacity: { value: 0.8 },
    shellThickness: { value: 0.05 },
    slider1: { value: settings.slider1 },
    slider2: { value: settings.slider2 },
    ambientLight: { value: new THREE.Color(0x404040).multiplyScalar(1) }, // Default value
    pointLightPosition: { value: new THREE.Vector3(0, 0, 10) }, // Default value
    pointLightColor: { value: new THREE.Color(0xffffff) },
    pointLightIntensity: { value: 5 } // Default value
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
const ambientLight = new THREE.AmbientLight(0x404040); // Adjust as necessary
scene.add(ambientLight);
uniforms.ambientLight.value = new THREE.Color(ambientLight.color).multiplyScalar(ambientLight.intensity);

const pointLight = new THREE.PointLight(0xffffff, 5, 100); // Adjust as necessary
pointLight.position.set(0, 0, 10);
scene.add(pointLight);
uniforms.pointLightPosition.value = pointLight.position;
uniforms.pointLightColor.value = new THREE.Color(pointLight.color);
uniforms.pointLightIntensity.value = pointLight.intensity;

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
