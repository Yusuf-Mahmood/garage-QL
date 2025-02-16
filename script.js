// import * as THREE from 'three';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// // 1️⃣ Create Scene, Camera, and Renderer
// const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// const renderer = new THREE.WebGLRenderer({ antialias: true });
// renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);

// // 2️⃣ Load the .glb Model
// const loader = new GLTFLoader();
// loader.load(
//     './models/mymodel.glb', // 🔹 Make sure this path is correct!
//     function (gltf) {
//         const model = gltf.scene;
//         scene.add(model);
//         model.position.set(0, 0, 0); // Adjust position
//         model.scale.set(1, 1, 1); // Adjust scale if needed
//         console.log('Model Loaded:', gltf);
//     },
//     undefined,
//     function (error) {
//         console.error('Error loading model:', error);
//     }
// );

// // 3️⃣ Add Lighting
// const light = new THREE.AmbientLight(0xffffff, 1); // White light
// scene.add(light);

// // 4️⃣ Camera Position & Animation Loop
// camera.position.z = 5;
// function animate() {
//     requestAnimationFrame(animate);
//     renderer.render(scene, camera);
// }
// animate();

