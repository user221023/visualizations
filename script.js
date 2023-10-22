import * as THREE from 'three';
import { OrbitControls } from 'three/examples/js/controls/OrbitControls';

async function fetchData() {
  try {
    const response = await fetch('https://gist.githubusercontent.com/user221023/644135557782c9f4bcbf26365644ce95/raw/fdc9fc054d27762653d366449d065718825d731f/data.json');
    if (!response.ok) {
      throw new Error('Network response was not ok ' + response.statusText);
    }
    const points = await response.json();
    init(points);
  } catch (error) {
    console.error('Error fetching data: ', error);
  }
}


function init(points) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(1, 1, 1);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.update();

  const ambientLight = new THREE.AmbientLight(0xf3d2ef);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xf3d2ef, 1);
  directionalLight.position.set(1, 1, 1).normalize();
  scene.add(directionalLight);

// Material for edge points
const edgeMaterial = new THREE.ShaderMaterial({
  vertexShader: `
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    void main() {
      vec2 coords = 2.0 * gl_FragCoord.xy / vec2(gl_FragCoord.z) - 1.0;
      float dist = length(coords);
      if (dist > 1.0 || coords.y < 0.0) discard;
      gl_FragColor = vec4(0.3176, 0.8627, 0.9608, 1.0);
    }
  `,
  side: THREE.DoubleSide,
});

  // Geometry for edge points
  const edgeGeometry = new THREE.CircleGeometry(0.05, 32);

  const circleMaterial = new THREE.MeshBasicMaterial({ color: 0x5099d1, side: THREE.DoubleSide });
  const circleGeometry = new THREE.CircleGeometry(0.05, 32);

  points.forEach((p, index) => {
    const circleMesh = new THREE.Mesh(circleGeometry, circleMaterial);
    circleMesh.position.set(p.X, p.Y, p.Z);

    const normal = circleMesh.position.clone().normalize();
    circleMesh.lookAt(normal.add(circleMesh.position));
    
    // Determine if the point is at the edge of the band
    if (Math.abs(p.Y) > 0.9) {  // Assuming the band is centered at Y=0
      // If it's an edge point, use the edge material and geometry
      circleMesh.material = edgeMaterial;
      circleMesh.geometry = edgeGeometry;
    }
    
    scene.add(circleMesh);
  });

  const bandGeometry = new THREE.SphereGeometry(1, 32, 32, 0, Math.PI * 2, Math.PI / 3, Math.PI / 3);
  const bandMesh = new THREE.Mesh(bandGeometry, bandMaterial);
  bandMesh.rotation.x = Math.PI / 2;
  scene.add(bandMesh);

  const circleMaterial = new THREE.MeshBasicMaterial({ color: 0x5099d1, side: THREE.DoubleSide });
  const circleGeometry = new THREE.CircleGeometry(0.05, 32);

  points.forEach((p, index) => {
    const circleMesh = new THREE.Mesh(circleGeometry, circleMaterial);
    circleMesh.position.set(p.X, p.Y, p.Z);

    const normal = circleMesh.position.clone().normalize();
    circleMesh.lookAt(normal.add(circleMesh.position));
    
    // Determine if the point is at the edge of the band
    if (index < points.length * 2 / 3) {
      // If it's an edge point, use the edge material and geometry
      circleMesh.material = edgeMaterial;
      circleMesh.geometry = edgeGeometry;
    }
    
    scene.add(circleMesh);
  });

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
}

fetchData();
