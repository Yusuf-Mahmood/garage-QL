import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/controls/OrbitControls.js';
import gsap from 'https://cdn.jsdelivr.net/npm/gsap@3.12.2/index.js';

// Scene setup
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 4, 10);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
let garageDoor; 
let isDoorOpen = false; 
const loader = new GLTFLoader();
loader.load(
    'models/mymodel3.glb',
    function (gltf) {
        const model = gltf.scene;
        scene.add(model);
        model.position.set(0, 0, 0);
        model.scale.set(2, 2, 2);
        garageDoor = model.getObjectByName('rollershutter_window_01_graffiti016'); 
        if (garageDoor) {
            garageDoor.userData.initialY = garageDoor.position.y; // Store initial position
        } else {
            console.warn('Garage door not found. Check the model structure.');
        }
    },
    undefined,
    function (error) {
        console.error('Error loading model:', error);
    }
);  

function toggleGarageDoor() {
    if (garageDoor) {

        if (isDoorOpen) {
            gsap.to(garageDoor.position, { y: garageDoor.userData.initialY, duration: 1 }); // Adjust position
            generateGraphs();
        } else {
            gsap.to(garageDoor.position, { y: 0.6, duration: 1 }); // Adjust position
        }
        isDoorOpen = !isDoorOpen;
    }
}

// Add event listener for clicking on the model
window.addEventListener('click', (event) => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Get mouse position
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObject(garageDoor, true);
    if (intersects.length > 0) {
        toggleGarageDoor();
    }
});

const directionalLight1 = new THREE.DirectionalLight(0x2C3E50, 1);
directionalLight1.position.set(5, 1, 5);
scene.add(directionalLight1);

const directionalLight2 = new THREE.DirectionalLight(0x2C3E50, 1);
directionalLight2.position.set(-5, 1, 5);
scene.add(directionalLight2);

camera.position.set(0, 0, 4);

// Enable OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI / 2;
controls.minPolarAngle = Math.PI / 2;
controls.maxAzimuthAngle = 0;
controls.minAzimuthAngle = 0;
controls.enableZoom = false;
controls.enablePan = false;

renderer.domElement.addEventListener('wheel', (event) => event.preventDefault());

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

function generateGraphs() {

}
