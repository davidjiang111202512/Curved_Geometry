import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

// Scene, camera, renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeeeeee);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

// Load sphere.obj
const loader = new OBJLoader();
let sphereMesh = null;

loader.load(
  '/sphere.obj',
  (obj) => {
    obj.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshPhongMaterial({
          color: 0x00aaff,
          wireframe: true,
          shininess: 80
        });
        sphereMesh = child; // save reference
      }
    });
    scene.add(obj);

    // === Choose a point on the sphere ===
    const point = new THREE.Vector3(0.7, 0.7, 0.0).normalize(); // example (normalized to lie on sphere)
    drawTangentAtPoint(point);
  },
  undefined,
  (error) => {
    console.error('Error loading OBJ:', error);
  }
);

// Function to draw tangent plane + vector + point
function drawTangentAtPoint(point) {
  const normal = point.clone().normalize();

  // --- Draw the point ---
  const pointGeom = new THREE.SphereGeometry(0.005, 16, 16);
  const pointMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const pointMesh = new THREE.Mesh(pointGeom, pointMat);
  pointMesh.position.copy(point);
  scene.add(pointMesh);

  // --- Tangent plane ---
  const planeSize = 0.1;
  const tangentPlaneGeometry = new THREE.PlaneGeometry(planeSize, planeSize);
  const tangentPlaneMaterial = new THREE.MeshBasicMaterial({
    color: 0xffcc00,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.5
  });
  const tangentPlane = new THREE.Mesh(tangentPlaneGeometry, tangentPlaneMaterial);

  // Align plane with tangent space
  const quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
  tangentPlane.setRotationFromQuaternion(quaternion);
  tangentPlane.position.copy(point);
  scene.add(tangentPlane);

  // --- Tangent vector lying in plane ---
  const tangentVec = new THREE.Vector3(1, 0, 0);
  tangentVec.projectOnPlane(normal).normalize().multiplyScalar(0.05);

  const tangentArrow = new THREE.ArrowHelper(
    tangentVec.clone().normalize(),
    point,
    tangentVec.length(),
    0x000000
  );
  scene.add(tangentArrow);
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Handle resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

