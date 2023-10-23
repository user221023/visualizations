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
    varying vec3 vNormal;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `;

    const fragmentShader = `
    uniform vec3 color;
    uniform float opacity;
    varying vec3 vNormal;
    void main() {
      float intensity = pow(0.5 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
      gl_FragColor = vec4(color, opacity) * (intensity + 0.5);
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
      const scaleFactor = 1 - (0.4 * (Math.abs(y) / 5) ** 2); // Adjust flattening
      positions.setY(i, y * scaleFactor);
    }

    geometry.computeVertexNormals();

    // Set up OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    const animate = function () {
      requestAnimationFrame(animate);
      controls.update(); // Only required if controls.enableDamping = true, or if controls.autoRotate = true
      renderer.render(scene, camera);
    };

    animate();
