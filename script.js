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

    // Create the spherical band
    var bandRadius = 1;
    var bandGeometry = new THREE.SphereGeometry(bandRadius, 32, 32, 0, Math.PI * 2, Math.PI / 3, Math.PI / 3);

    // Band Shader Material
    var bandMaterial = new THREE.ShaderMaterial({
        uniforms: {
            color: { value: new THREE.Color(mediumColor) },
            glowColor: { value: new THREE.Color(lightColor) },
            pointPositions: { value: flatPointsArray },
            pointSize: { value: 0.05 }, // Adjust as needed
            opacity: { value: 0.8 }
        },
        vertexShader: `
            varying vec3 vNormal;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 color;
            uniform vec3 glowColor;
            uniform vec3 pointPositions[${points.length}];
            uniform float pointSize;
            uniform float opacity;
            varying vec3 vNormal;
            void main() {
                vec3 finalColor = color;
                vec3 norm = normalize(vNormal);
                for (int i = 0; i < ${points.length}; i++) {
                    vec3 point = pointPositions[i];
                    float dist = length(point - position);
                    if (dist < pointSize) {
                        float glow = 1.0 - dist / pointSize;
                        finalColor += glowColor * glow;
                    }
                }
                gl_FragColor = vec4(finalColor, opacity);
            }
        `,
        side: THREE.DoubleSide,
        transparent: true
    });

    var bandMesh = new THREE.Mesh(bandGeometry, bandMaterial);
    bandMesh.rotation.x = Math.PI / 2;
    scene.add(bandMesh);

    // Render the scene
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}

fetchData();
