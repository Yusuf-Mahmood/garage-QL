import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/controls/OrbitControls.js';
import gsap from 'https://cdn.jsdelivr.net/npm/gsap@3.12.2/index.js';

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 4, 10);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
let garageDoor, garageLamp, garageCar; 
let isDoorOpen = false; 
const loader = new GLTFLoader();
loader.load(
    'models/mymodel8.glb',
    function (gltf) {
        const model = gltf.scene;
        scene.add(model);
        model.position.set(0, 0, 0);
        model.scale.set(2, 2, 2);
        garageDoor = model.getObjectByName('rollershutter_window_01_graffiti016'); 
        garageCar = model.getObjectByName('covered_car'); 
        garageLamp = model.getObjectByName('Light'); 

        model.traverse(element => {
            console.log(element.name);

            if (element.name.includes("Cube")) { 
                if (Array.isArray(element.material)) {
                    element.material.forEach(mat => {
                        mat.metalness = 0.98; 
                        mat.roughness = 0.1;
                        mat.needsUpdate = true;
                    });
                } else {
                    element.material.metalness = 0.98;
                    element.material.roughness = 0.1;
                    element.material.needsUpdate = true;
                }
            }
        });


        if (garageDoor) {
            garageDoor.userData.initialY = garageDoor.position.y; 
        } else {
            console.warn('Garage door not found. Check the model structure.');
        }
        if (garageCar) {
            addCarLight(garageCar); 
        } else {
            console.warn('Car not found in model.');
        }
        if (garageLamp) {
            addLampLight(garageLamp);
        } else {
            console.warn('Lamp not found in model.');
        }

    },
    undefined,
    function (error) {
        console.error('Error loading model:', error);
    }
);  

function addCarLight(car) {
    const carLight = new THREE.AmbientLight(0xffffff, 2.5, 5); 
    carLight.castShadow = true;
    
    car.add(carLight); 
}
function addLampLight(lamp) {
    const lampLight = new THREE.PointLight(0xffffff, 100, 2);
    lampLight.position.set(0, -1, 0);  
    lampLight.castShadow = true;
    
    lamp.add(lampLight); 
}

function toggleGarageDoor() {
    if (garageDoor) {
        if (isDoorOpen) {
            gsap.to(garageDoor.position, { y: garageDoor.userData.initialY, duration: 1 });
            stopFlickerLoop();
            generateGraphs();
        } else {
            gsap.to(garageDoor.position, { y: 0.6, duration: 1 });
            let timer = setTimeout(() => {  
                startFlickerLoop();
                clearTimeout(timer);
            }, 1000);

        }
        isDoorOpen = !isDoorOpen;
    }
}

let flickerInterval; 

function flickerLights() {
    const lights = [];

    if (garageLamp && garageLamp.children.length > 0) {
        lights.push(garageLamp.children[0]); // Add lamp light
    }
    if (garageCar && garageCar.children.length > 0) {
        lights.push(garageCar.children[0]); // Add car light
    }

    if (lights.length === 0) return;

    const flickerTimeline = gsap.timeline();

    for (let i = 0; i < 3; i++) {
        flickerTimeline.to(lights, { intensity: 0.1, duration: 0.05, yoyo: true, repeat: 1 });
    }
}

function startFlickerLoop() {
    if (flickerInterval) clearInterval(flickerInterval); // Stop any existing loop

    flickerInterval = setInterval(() => {
        if (!isDoorOpen) {
            clearInterval(flickerInterval);
            return;
        }
        flickerLights();
    }, Math.random() * 5000 + 2000); // Random flicker between 2-7 seconds
}

function stopFlickerLoop() {
    clearInterval(flickerInterval);
}


window.addEventListener('click', (event) => {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

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

camera.position.set(0, 0, 3.27);

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
