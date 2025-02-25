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
let garageDoor, garageLamp, garageCar, flickerInterval, garageBoard, garageThinLight; 
export let isDoorOpen = false;
let inGarage = false;
const humanoid = document.getElementById("humanoid");

const placeholder = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x555555, wireframe: true })
);
scene.add(placeholder);

const loader = new GLTFLoader();
loader.load(
    'assets/model/mymodel.glb',
    function (gltf) {
        scene.remove(placeholder);
        const model = gltf.scene;
        scene.add(model);
        model.position.set(-2, 0, 0);
        model.scale.set(2, 2, 2);
        garageDoor = model.getObjectByName('rollershutter_window_01_graffiti016'); 
        garageCar = model.getObjectByName('covered_car'); 
        garageLamp = model.getObjectByName('Light'); 
        garageBoard = model.getObjectByName('Board'); 
        garageThinLight = model.getObjectByName('Cylinder001'); 

        model.traverse(element => {
            // console.log(element.name);
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
        if (garageBoard) {
            addBoardLight(garageBoard);
        } else {
            console.warn('Board not found in model.');
        }
        if (garageThinLight) {
            addThinLight(garageThinLight);
        } else {
            console.warn('Thin light not found in model.');
        }
        if (Math.random() < 0.6) { 
            humanoid.style.display = 'flex';
        }
        },
        undefined,
        function (error) {
        console.error('Error loading model:', error);
    }
);  

function addCarLight(car) {
    const carLight = new THREE.AmbientLight(0xffffff, 1, 1); 
    carLight.castShadow = true;
    car.add(carLight); 
}
function addLampLight(lamp) {
    const lampLight = new THREE.PointLight(0xffffff, 50, 2);
    lampLight.position.set(0, -1, 0);  
    lampLight.castShadow = true;
    lamp.add(lampLight);
}
function addBoardLight(board) {
    const boardLight = new THREE.AmbientLight(0xffffff, 0.3);    
    boardLight.castShadow = true;
    board.add(boardLight); 
}
function addThinLight(thinLight) {
    const boardThinLight = new THREE.AmbientLight(0xffffff, 0.1);
    boardThinLight.castShadow = true;
    thinLight.add(boardThinLight); 
}

function toggleGarageDoor() {
    if (isDoorOpen) {
        gsap.to(garageDoor.position, { y: garageDoor.userData.initialY, duration: 1 });
        stopFlickerLoop();
        
    } else {
        gsap.to(garageDoor.position, { y: 0.6, duration: 1 });
        let timer = setTimeout(() => {  
            startFlickerLoop();
            clearTimeout(timer);
        }, 0);

    }
    isDoorOpen = !isDoorOpen;
}

function flickerLights() {
    const lights = [];

    if (garageLamp && garageLamp.children.length > 0) {
        lights.push(garageLamp.children[0]); 
    }
    if (garageCar && garageCar.children.length > 0) {
        lights.push(garageCar.children[0]);
    }

    if (lights.length === 0) return;

    const flickerTimeline = gsap.timeline();

    for (let i = 0; i < 3; i++) {
        flickerTimeline.to(lights, { intensity: 0.1, duration: 0.05, yoyo: true, repeat: 1 });
    }
}

function startFlickerLoop() {
    if (flickerInterval) clearInterval(flickerInterval);

    flickerInterval = setInterval(() => {
        if (!isDoorOpen) {
            clearInterval(flickerInterval);
            return;
        }
        flickerLights();
    }, Math.random() * 5000 + 2000);
}

function stopFlickerLoop() {
    clearInterval(flickerInterval);
}

export async function moveToBoard() {
    return new Promise((resolve) => {
        inGarage = true;
        controls.maxPolarAngle = Math.PI / 2 + 0.8; 
        controls.minPolarAngle = Math.PI / 2 - 0.8;
        controls.maxAzimuthAngle = Infinity;
        controls.minAzimuthAngle = -Infinity;

        document.getElementsByClassName('container')[0].style.display = "none";
        const targetPosition = new THREE.Vector3();
        garageBoard.getWorldPosition(targetPosition);

        gsap.to(camera.position, {
            x: targetPosition.x += 0.7, 
            y: targetPosition.y += 0.4, 
            z: targetPosition.z,
            duration: 2,
            ease: "power2.inOut",
            onUpdate: () => {
                controls.target.lerp(targetPosition, 0.1); 
                controls.update();
            },
            onComplete: resolve 
        });

        gsap.to(camera.rotation, {
            y: targetPosition.x -= 0.2,
            duration: 1.5,
            ease: "power2.inOut",
        });
        humanoid.style.left = 50;
        humanoid.style.backgroundColor = 'red';
    });
}

function updateSVGVisibility() {
    if (!garageBoard) return;
    
    const vector = new THREE.Vector3();
    garageBoard.getWorldPosition(vector);
    vector.project(camera);
    
    const boardX = (vector.x * 0.5 + 0.5) * window.innerWidth;
    const boardY = (0.5 - (vector.y * 0.5 + 0.5)) * window.innerHeight;

    const svgs = document.querySelectorAll(".svg-graph");
    
    svgs.forEach(svg => {
        const rect = svg.getBoundingClientRect();
        const svgCenterX = rect.left + rect.width / 2;
        const svgCenterY = rect.top + rect.height / 2;
        const distance = Math.sqrt(
            Math.pow(svgCenterX - boardX, 2) +
            Math.pow(svgCenterY - boardY, 2)
        );
        
        const maxDistance = Math.max(window.innerWidth, window.innerHeight) * 0.4;
        if (distance < maxDistance && Math.abs(vector.z) < 1) {
            svg.style.opacity = "1";
            svg.style.pointerEvents = "auto"; 
        } else {
            svg.style.opacity = "0";
            svg.style.pointerEvents = "none"; 
        }
    });
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
directionalLight1.position.set(10, 1, 5);
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
    updateSVGVisibility();
}

animate();

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

document.getElementById("submitBtn").addEventListener("click", () => {
    if (isDoorOpen) {
    } else {
        document.getElementById('errorMessage').innerText = "Please open the door first!";
        gsap.to(garageDoor.material.color, { r: 1, g: 0, b: 0, duration: 0.5, onComplete: () => {
            gsap.to(garageDoor.material.color, { r: 1, g: 1, b: 1, duration: 0.5 });
        }});
    }
});

export function jumpscare() {
    const audio = new Audio('assets/jumpscare.mp3');
    audio.play();

    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = 0;
    flash.style.left = 0;
    flash.style.width = '100%';
    flash.style.height = '100%';
    flash.style.backgroundColor = 'black';
    flash.style.opacity = 0;
    flash.style.zIndex = 9999;
    document.body.appendChild(flash);

    gsap.to(flash, {
        opacity: 1,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
            document.body.removeChild(flash);
            gsap.to(humanoid, {
                scale: 15,
                left: 730,
                top: 1750,
                opacity: 1,
                duration: 0.3, 
                ease: "power2.inOut",
                onComplete: () => {
                    setTimeout(() => {
                        gsap.to(humanoid, {
                            display: 'none',
                            ease: "power2.inOut",
                            duration: 0.3,
                            onComplete: () => {
                                const randomTime = Math.random() * 5000 + 2000;
                                setTimeout(() => {
                                    gsap.to(humanoid, {
                                        display: 'flex',
                                        opacity: 1,
                                        duration: 0.3,
                                        ease: "power2.inOut",
                                        onComplete: () => {
                                            const flashInterval = setInterval(() => {
                                                flash.style.opacity = flash.style.opacity === '1' ? '0' : '1';
                                            }, 100);

                                            setTimeout(() => {
                                                clearInterval(flashInterval);
                                                flash.style.opacity = '0';
                                            }, 2000);
                                        }
                                    });
                                }, randomTime);
                            }
                        });
                    }, 100);
                }
            });
        }
    });
}

humanoid.addEventListener("mouseenter", () => {
    jumpscare();
});

window.addEventListener("keyup", (event) => {
    if ((event.key === " " || event.key === 'Space')) {
        toggleGarageDoor();
    }
    if ((event.key === 'Escape') && inGarage) {
        document.getElementById('loginForm').reset();
        document.getElementById('exitBtn').style.display = 'none';
        document.getElementById('graphContainer').style.display = 'none';
        document.getElementById('skillsGraphContainer').style.display = 'none';
        document.getElementById('userInfo').style.display = 'none';
        document.getElementById('errorMessage').innerHTML = '';
        humanoid.style.display = 'none';
        logout();
    }
});

let startingCameraPosition = { x: 0, y: 0, z: 3.27 }; // Default position, update after login
let startingGarageDoorY = garageDoor.position.y; // Capture the initial Y position of the garage door

const logout = async () => {
    localStorage.removeItem('jwtToken');

    return new Promise((resolve) => {
        // Animate camera position back to the default position smoothly
        gsap.to(camera.position, {
            x: startingCameraPosition.x,
            y: startingCameraPosition.y,
            z: startingCameraPosition.z,
            duration: 3,
            ease: "power2.inOut",
            onUpdate: () => {
                controls.target.set(0, 0, 0);
                controls.update();
            },
            onComplete: () => {
                document.getElementsByClassName('container')[0].style.display = "flex"; 
                if (isDoorOpen) {
                    gsap.to(garageDoor.position, { 
                        y: garageDoor.userData.initialY, 
                        duration: 2, 
                        onComplete: () => {
                            isDoorOpen = false;
                            resolve();
                        }
                    });
                } else {
                    resolve();
                }
            }
        });

        // Animate camera rotation to the default rotation smoothly
        gsap.to(camera.rotation, {
            y: 0,
            duration: 3, 
            ease: "power2.inOut",
        });
    });
};

export const updateStartingPositions = () => {
    startingCameraPosition = {
        x: camera.position.x,
        y: camera.position.y,
        z: camera.position.z
    };
    startingGarageDoorY = garageDoor.position.y; // Update if garage door position changes
};

document.getElementById("exitBtn").addEventListener("click", () => {
    document.getElementById('loginForm').reset();
    document.getElementById('exitBtn').style.display = 'none';
    document.getElementById('graphContainer').style.display = 'none';
    document.getElementById('skillsGraphContainer').style.display = 'none';
    document.getElementById('userInfo').style.display = 'none';
    document.getElementById('errorMessage').innerHTML = '';
    humanoid.style.display = 'none';
    logout();
});
