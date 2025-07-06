import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.154/build/three.module.js';

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 3;

let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const loader = new THREE.FileLoader();
const uniforms = {
  time: { value: 0.0 },
  audioLevel: { value: 0.0 },
  resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
  mouse: { value: new THREE.Vector2(0.5, 0.5) }
};

let material;
Promise.all([
  loader.loadAsync('./shaders/vertex.glsl'),
  loader.loadAsync('./shaders/fragment.glsl')
]).then(([vertexShader, fragmentShader]) => {
  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    side: THREE.DoubleSide
  });

  const geometry = new THREE.IcosahedronGeometry(1, 6);
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  animate();
});

let listener = new (window.AudioContext || window.webkitAudioContext)();
let analyser, dataArray;

navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
  let source = listener.createMediaStreamSource(stream);
  analyser = listener.createAnalyser();
  analyser.fftSize = 128;
  source.connect(analyser);
  dataArray = new Uint8Array(analyser.frequencyBinCount);
});

window.addEventListener('mousemove', e => {
  uniforms.mouse.value.set(e.clientX / window.innerWidth, 1.0 - e.clientY / window.innerHeight);
});

function animate(t) {
  requestAnimationFrame(animate);
  uniforms.time.value = t * 0.001;

  if (analyser) {
    analyser.getByteFrequencyData(dataArray);
    let avg = dataArray.reduce((sum, b) => sum + b, 0) / dataArray.length;
    uniforms.audioLevel.value = avg / 128.0;
  }

  renderer.render(scene, camera);
}