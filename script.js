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
        return;
    }

    // Initialize the scene, camera, and renderer
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Define Colors
    var darkColor = 0x5099d1;
    var mediumColor = 0x48dcf6;
    var lightColor = 0x50ffb;
    var lightingColor = 0xf3d2ef;

    // Position the camera to see the lit side
    camera.position.set(1, 1, 1);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Initialize OrbitControls
    var controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    // Add Ambient Light
    var ambientLight = new THREE.AmbientLight(lightingColor);
    scene.add(ambientLight);

    // Add Directional Light
    var directionalLight = new THREE.DirectionalLight(lightingColor, 1);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    // Convert Points to a flat array
    var flatPointsArray = [];
    points.forEach(p => {
        flatPointsArray.push(p.X, p.Y, p.Z);
    });

      // Define band material h
  var bandMaterial = new THREE.MeshPhysicalMaterial({
    color: mediumColor,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide,
    emissive: lightColor,
    emissiveIntensity: 0.2
  });
    
    // Create the spherical band
    var bandRadius = 1;
    var bandGeometry = new THREE.SphereGeometry(bandRadius, 32, 32, 0, Math.PI * 2, Math.PI / 3, Math.PI / 3);

const pointsMaterial = new THREE.ShaderMaterial({
  uniforms: {
    color: { value: new THREE.Color(darkColor) },
  },
vertexShader: `
  attribute float size;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = 10.0;
    gl_Position = projectionMatrix * mvPosition;
  }
`,

fragmentShader: `
  uniform vec3 color;
  void main() {
    vec2 coords = 2.0 * gl_PointCoord - 1.0; // Transform to [-1, 1] range
    float dist = dot(coords, coords);
    if (dist > 1.0) discard; // Discard fragments outside the unit circle
    gl_FragColor = vec4(color, 1.0); // Set alpha to 1.0 for a solid disc
  }
`,

depthTest: false,

blending: THREE.NormalBlending,

    
  blending: THREE.AdditiveBlending,
  depthTest: false,
  transparent: true
});


    var bandMesh = new THREE.Mesh(bandGeometry, bandMaterial);
    bandMesh.rotation.x = Math.PI / 2;
    scene.add(bandMesh);

// Convert Points to a flat array
var flatPointsArray = [];
var sizes = [];
points.forEach(p => {
    flatPointsArray.push(p.X, p.Y, p.Z);
    sizes.push(5.0); // Adjust size as needed
});

var pointsGeometry = new THREE.BufferGeometry();
pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(flatPointsArray, 3));
pointsGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

var pointsMesh = new THREE.Points(pointsGeometry, pointsMaterial);
scene.add(pointsMesh);

    // Render the scene
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}

fetchData();
