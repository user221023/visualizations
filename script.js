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
            var darkColor = 0x5099d1
            var mediumColor = 0x48dcf6
            var lightColor = 0x50ffb
            var lightingColor = 0xf3d2ef

            // Position the camera to see the lit side
            camera.position.set(1, 1, 1);  // Adjust x, y, z values as needed
            camera.lookAt(new THREE.Vector3(0, 0, 0));  // Looking at the origin, adjust as needed

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

              // Create the spherical band
            var bandRadius = 1;  // Assuming the points lie on a sphere of radius 1
            var bandGeometry = new THREE.SphereGeometry(bandRadius, 32, 32, 0, Math.PI * 2, Math.PI / 3, Math.PI / 3);
            var bandMaterial = new THREE.MeshPhysicalMaterial({ color: mediumColor, transparent: true, opacity: 0.8, side: THREE.DoubleSide, emissive: lightColor, emissiveIntensity: 0.2 });
            var bandMesh = new THREE.Mesh(bandGeometry, bandMaterial);
            bandMesh.rotation.x = Math.PI / 2;  // Rotate 90 degrees around the X-axis
            scene.add(bandMesh);

            // Create points
  for (var i = 0; i < points.length; i++) {
    var diskGeometry = new THREE.CircleGeometry(0.05, 32); // Radius of 0.05 and 32 segments
    var diskMaterial = new THREE.MeshBasicMaterial({ color: mediumColor, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
    var disk = new THREE.Mesh(diskGeometry, diskMaterial);
    disk.position.set(points[i].X, points[i].Y, points[i].Z);
    disk.lookAt(new THREE.Vector3(0, 0, 0)); // Make the disk face towards the origin
    scene.add(disk);
}

  function createGlowMaterial(color, size) {
    var glowMaterial = new THREE.SpriteMaterial({
        map: new THREE.CanvasTexture(generateSprite(color)),
        blending: THREE.AdditiveBlending,
        color: lightColor,
        transparent: true,
        opacity: 0.5,
        sizeAttenuation: false
    });
    return glowMaterial;
}

function generateSprite(color) {
    var canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    var context = canvas.getContext('2d');
    var gradient = context.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2
    );
    var colorStyle = 'rgba(' + Math.round(color.r * 255) + ',' + Math.round(color.g * 255) + ',' + Math.round(color.b * 255) + ',1)';
    gradient.addColorStop(0, colorStyle);
    gradient.addColorStop(0.2, colorStyle);
    gradient.addColorStop(0.4, colorStyle.replace('1)', '0.6)'));
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
    return canvas;
}

  
for (var i = 0; i < points.length; i++) {
    // ... (previous code to create disks)
    
    var glowMaterial = createGlowMaterial(new THREE.Color(mediumColor), 0.1);
    var glow = new THREE.Sprite(glowMaterial);
    glow.scale.set(0.2, 0.2, 1); // Adjust the size as needed
    glow.position.set(points[i].X, points[i].Y, points[i].Z);
    scene.add(glow);
}


            // Position the camera closer
            camera.position.z = 0.7;

            // Render the scene
            function animate() {
                requestAnimationFrame(animate);
                controls.update();
                renderer.render(scene, camera);
            }
            animate();
}

fetchData();
