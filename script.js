import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.js';

async function fetchData() {
  let points;
  try {
    // Fetch data from JSON file hosted in Gist
    const response = await fetch('https://gist.githubusercontent.com/user221023/644135557782c9f4bcbf26365644ce95/raw/fdc9fc054d27762653d366449d065718825d731f/data.json');
    
    // Check if the request was successful
    if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
    }

    // Parse the JSON data
    points = await response.json();
  } catch (error) {
    console.error('Error fetching data: ', error);
    return;
  }

    // Initialize the scene, camera, and renderer
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x192327);
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    var darkColor = 0x5099d1
    var mediumColor = 0x48dcf6
    var lightColor = 0x50fffb
    var lightingColor = 0xebc1e6

    // Position the camera to see the lit side
    camera.position.set(2, 2, 2);  // Adjust x, y, z values as needed
    camera.lookAt(new THREE.Vector3(0, 0, 0));  // Looking at the origin, adjust as needed

    // Initialize OrbitControls
    var controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    // Add Ambient Light
    var ambientLight = new THREE.AmbientLight(lightingColor);
    scene.add(ambientLight);

    // Add Directional Light
    var directionalLight = new THREE.DirectionalLight(lightingColor, 1.0);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

var pointMaterial = new THREE.ShaderMaterial({
    uniforms: {
        color1: { value: new THREE.Color(darkColor) },
        color2: { value: new THREE.Color(lightColor) },
        size: { value: 20.0 },  // Adjust size as needed
        scale: { value: window.innerHeight / 2 }  // Required for proper sizing
    },
    vertexShader: `
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
        uniform vec3 color1;
        uniform vec3 color2;
        varying vec3 vColor;
        void main() {
            float r = distance(gl_PointCoord, vec2(0.5, 0.5));
            float delta = fwidth(r);
            float alpha = 1.0 - smoothstep(0.5 - delta, 0.5 + delta, r);
            if (r > 0.5) {  // If the point is out of the circular region
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
    var pointsGeometry = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(p.X, p.Y, p.Z)));
    var pointsMesh = new THREE.Points(pointsGeometry, pointMaterial);
    scene.add(pointsMesh);

    // Create the spherical band
    var bandRadius = 1;  // Assuming the points lie on a sphere of radius 1
    var bandGeometry = new THREE.SphereGeometry(bandRadius, 32, 32, 0, Math.PI * 2, Math.PI / 3, Math.PI / 3);
    var bandMaterial = new THREE.MeshPhysicalMaterial({
        color: darkColor,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
        emissive: darkColor,
        emissiveIntensity: 0.0  // Adjust as needed
    });
    var bandMesh = new THREE.Mesh(bandGeometry, bandMaterial);
    bandMesh.rotation.x = Math.PI / 2;  // Rotate 90 degrees around the X-axis
    scene.add(bandMesh);

    // Position the camera closer
    camera.position.z = 1.2;

    // Render the scene
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}
fetchData();
