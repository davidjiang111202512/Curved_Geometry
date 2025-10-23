import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// === Main scene setup ===
// === Layer resize logic ===
const container = document.getElementById('layerContainer') as HTMLDivElement;
const handle = document.getElementById('resizeHandle') as HTMLDivElement;

let isResizing = false;
let startX = 0, startY = 0;
let startWidth = 0, startHeight = 0;

handle.addEventListener('mousedown', (e) => {
  isResizing = true;
  startX = e.clientX;
  startY = e.clientY;
  startWidth = container.offsetWidth;
  startHeight = container.offsetHeight;
  document.body.style.cursor = 'se-resize';
});

window.addEventListener('mousemove', (e) => {
  if (!isResizing) return;
  const newWidth = Math.max(150, startWidth + (e.clientX - startX));
  const newHeight = Math.max(150, startHeight + (e.clientY - startY));
  container.style.width = `${newWidth}px`;
  container.style.height = `${newHeight}px`;
  layerRenderer.setSize(newWidth, newHeight);
});

window.addEventListener('mouseup', () => {
  isResizing = false;
  document.body.style.cursor = 'default';
});

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth * 0.8 / window.innerHeight,
  0.1,
  1000
);
camera.position.set(6, 6, 6);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth * 0.8, window.innerHeight);
document.body.appendChild(renderer.domElement);


const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// === Parameters ===
const Nx = 15, Ny = 15, Nz = 15;
const size = 4;
const dx = size / (Nx - 1);
const dy = size / (Ny - 1);
const dz = size / (Nz - 1);
const start = -size / 2;

// === Generate points ===
const points: THREE.Vector3[] = [];
for (let i = 0; i < Nx; i++) {
  for (let j = 0; j < Ny; j++) {
    for (let k = 0; k < Nz; k++) {
      const x = start + i * dx;
      const y = start + j * dy;
      const z = start + k * dz;
      points.push(new THREE.Vector3(x, y, z));
    }
  }
}

// === Points visualization ===
const geometry = new THREE.BufferGeometry().setFromPoints(points);
const pointMaterial = new THREE.PointsMaterial({
  color: 0x00ffff,
  size: 0.05,
  transparent: true,
  opacity: 0.9
});
const pointCloud = new THREE.Points(geometry, pointMaterial);
scene.add(pointCloud);

// === Layer view ===
const layerCanvas = document.getElementById('layerView') as HTMLCanvasElement;
const layerRenderer = new THREE.WebGLRenderer({ canvas: layerCanvas, antialias: true });
layerRenderer.setSize(500, 500);
layerRenderer.setPixelRatio(window.devicePixelRatio);

const layerScene = new THREE.Scene();
layerScene.background = new THREE.Color(0x000000);

// Orthographic camera (adjust size for zoom control)
let zoomFactor = 1.0;
const orthoSize = size / 2;
const layerCamera = new THREE.OrthographicCamera(
  -orthoSize * zoomFactor,
  orthoSize * zoomFactor,
  orthoSize * zoomFactor,
  -orthoSize * zoomFactor,
  0.1,
  100
);
layerCamera.position.set(0, 0, 10);
layerCamera.lookAt(0, 0, 0);

let currentLayer = 0;

// Function to update visible points
function extractLayer(k: number) {
  const zTarget = start + k * dz;
  const tolerance = dz * 0.5;
  return points.filter(p => Math.abs(p.z - zTarget) < tolerance);
}

// Dynamic update
function updateLayerView() {
  const layerPoints = extractLayer(currentLayer);

  layerScene.clear();

  const geom = new THREE.BufferGeometry().setFromPoints(layerPoints);
  const mat = new THREE.PointsMaterial({ color: 0xffff00, size: 2 });
  const layerCloud = new THREE.Points(geom, mat);
  layerScene.add(layerCloud);

  layerRenderer.render(layerScene, layerCamera);
}

// Mouse wheel zoom for layer
layerCanvas.addEventListener('wheel', (event) => {
  event.preventDefault();
  zoomFactor *= event.deltaY > 0 ? 1.1 : 0.9; // scroll up/down
  zoomFactor = Math.max(0.3, Math.min(zoomFactor, 3.0));

  layerCamera.left = -orthoSize * zoomFactor;
  layerCamera.right = orthoSize * zoomFactor;
  layerCamera.top = orthoSize * zoomFactor;
  layerCamera.bottom = -orthoSize * zoomFactor;
  layerCamera.updateProjectionMatrix();
});

// === Animate both views ===
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
  updateLayerView();
}
animate();
