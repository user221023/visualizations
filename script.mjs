    import * as THREE from './three.module.js';
    import { OrbitControls } from './OrbitControls.js';

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.sortObjects = true; // Ensure correct rendering order for transparent objects
    document.body.appendChild(renderer.domElement);

    scene.background = new THREE.Color(0x000000); // Set background to black for better contrast

    const geometry = new THREE.SphereGeometry(5, 32, 32);

const vertexShader = `
varying vec3 vPosition;
void main() {
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform vec3 color;
uniform float opacity;
varying vec3 vPosition;

float sigmoid(float x) {
    return 1.0 / (1.0 + exp(-slider2 * (x - slider1)));
}

void main() {
    float distanceFromCenter = length(vPosition) / 5.0;
    float fadeFactor = sigmoid(distanceFromCenter);
    gl_FragColor = vec4(color, opacity * fadeFactor);
}

`;

    const uniforms = {
      color: { value: new THREE.Color(0x48dcf6) },
      opacity: { value: 0.5 }
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
      const scaleFactor = 1 - (slider3 * (Math.abs(y) / 5) ** 2); // Adjust flattening
      positions.setY(i, y * scaleFactor);
    }

    geometry.computeVertexNormals();

    // Set up OrbitControls
    // const controls = new OrbitControls(camera, renderer.domElement);
    // controls.update();

// Create an object to hold the values
const settings = {
    slider1: 0.9,
    slider2: 25.0,
    slider3: 0.333
};

// Initialize dat.GUI
const gui = new dat.GUI();

// Add the sliders
gui.add(settings, 'slider1', 0, 1).onChange(value => {
    // Update the uniform or any other variable when the slider changes
    uniforms.someUniform.value = value;
});
gui.add(settings, 'slider2', 0, 50).onChange(value => {
    // Update the uniform or any other variable when the slider changes
    uniforms.someUniform.value = value;
});
gui.add(settings, 'slider3', 0, 1).onChange(value => {
    // Update the uniform or any other variable when the slider changes
    uniforms.someUniform.value = value;
});

    const animate = function () {
      requestAnimationFrame(animate);
      controls.update(); // Only required if controls.enableDamping = true, or if controls.autoRotate = true
      renderer.render(scene, camera);
    };

    animate();
