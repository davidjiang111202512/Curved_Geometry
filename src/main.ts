import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// === Scene setup ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xeeeeee);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 6);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

// === Sphere geometry ===
const geometry = new THREE.SphereGeometry(2, 32, 32);

// Outer smooth white sphere
const materialOutside = new THREE.MeshPhongMaterial({
  color: 0xffffff,
  side: THREE.FrontSide,
  shininess: 80
});
const sphereOutside = new THREE.Mesh(geometry, materialOutside);
scene.add(sphereOutside);

// Inner wireframe (only back faces)
const materialInside = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  wireframe: true,
  side: THREE.BackSide
});
const sphereInside = new THREE.Mesh(geometry, materialInside);
scene.add(sphereInside);

// === Lights ===
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

// === Choose a point on the sphere ===
const point = new THREE.Vector3(0, 2, 0); // north pole
const normal = point.clone().normalize();

// Draw point marker
const pointGeom = new THREE.SphereGeometry(0.02, 16, 16);
const pointMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const pointMesh = new THREE.Mesh(pointGeom, pointMat);
pointMesh.position.copy(point);
scene.add(pointMesh);

// === Tangent plane ===
const planeSize = 0.3;
const tangentPlaneGeometry = new THREE.PlaneGeometry(planeSize, planeSize);
const tangentPlaneMaterial = new THREE.MeshBasicMaterial({
  color: 0xffcc00,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.4
});
const tangentPlane = new THREE.Mesh(tangentPlaneGeometry, tangentPlaneMaterial);
const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
tangentPlane.setRotationFromQuaternion(q);
tangentPlane.position.copy(point);
scene.add(tangentPlane);

// === Tangent vector ===
const tangentVec = new THREE.Vector3(1, 0, 0);
tangentVec.projectOnPlane(normal).normalize().multiplyScalar(0.3);

const tangentArrow = new THREE.ArrowHelper(
  tangentVec.clone().normalize(),
  point,
  tangentVec.length(),
  0xff0000
);
scene.add(tangentArrow);

// === Render loop ===
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

// === Handle resize ===
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
