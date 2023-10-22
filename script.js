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
    var mainColor = 0x48DCF6

    // Position the camera to see the lit side
    camera.position.set(2, 2, 2);  // Adjust x, y, z values as needed
    camera.lookAt(new THREE.Vector3(0, 0, 0));  // Looking at the origin, adjust as needed

    // Initialize OrbitControls
    var controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    // Add Ambient Light
    var ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    // Add Directional Light
    var directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.1);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    var sphereMaterial = new THREE.MeshPhysicalMaterial({
        color: mainColor,
        transparent: true,
        opacity: 0.5,
        emissive: mainColor,
        emissiveIntensity: 1.0  // Adjust as needed
    });

  
    // Create spheres and add them to the scene
    for (var i = 0; i < points.length; i++) {
        var geometry = new THREE.SphereGeometry(0.01);  // Radius of 0.01
        var sphere = new THREE.Mesh(geometry, sphereMaterial);
        sphere.position.set(points[i].X, points[i].Y, points[i].Z);
        scene.add(sphere);
    }

    // Create the spherical band
    var bandRadius = 1;  // Assuming the points lie on a sphere of radius 1
    var bandGeometry = new THREE.SphereGeometry(bandRadius, 32, 32, 0, Math.PI * 2, Math.PI / 3, Math.PI / 3);
    var bandMaterial = new THREE.MeshPhysicalMaterial({
        color: mainColor,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide,
        emissive: mainColor,
        emissiveIntensity: 1.0  // Adjust as needed
    });
    var bandMesh = new THREE.Mesh(bandGeometry, bandMaterial);
    bandMesh.rotation.x = Math.PI / 2;  // Rotate 90 degrees around the X-axis
    scene.add(bandMesh);

    // Position the camera closer
    camera.position.z = 2;

    // Render the scene
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}
fetchData();
