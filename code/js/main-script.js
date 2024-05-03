import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
var renderer, scene, camera;
var g_top, g_bot, lanca, cabine, torre, base, contra_lanca, porta_lanca;
var g_peso, contra_peso1, contra_peso2, contra_peso3, contra_peso4;
var g_garra, g_carrinho, carrinho, cabo, garra, pinca1, pinca2, pinca3, pinca4, BB_garra, BB_container;
var pivot_pinca1, pivot_pinca2, pivot_pinca3, pivot_pinca4;
var keyToElement = new Map();
var wireframe = true;
var clock = new THREE.Clock(), deltaTime;
const rotSpeed = 1, ascensionSpeed = 20; // TODO change to 180 and 0.2 or idk

var camera1, camera2, camera3, camera4, camera5, camera6;
var tirante_frente, tirante_tras;
var objects = [];
/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    'use strict';
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd3d3d3);

    createBottomSection();
    createTopSection();
    scene.add(g_bot);
    scene.add(g_top);
    createContainer();
    createCargos();
    createGroundPlane();
    createHUD();
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCamera() {
    'use strict';
    const widthRatio = window.innerWidth / 24;
    const heightRatio = window.innerHeight / 24;
    const aspectRatio = window.innerWidth / window.innerHeight;
    camera1 = new THREE.OrthographicCamera( -widthRatio, widthRatio, heightRatio, -heightRatio, 1, 1000 );
    camera2 = new THREE.OrthographicCamera( -widthRatio, widthRatio, heightRatio, -heightRatio, 1, 1000 );
    camera3 = new THREE.OrthographicCamera( -widthRatio, widthRatio, heightRatio, -heightRatio, 1, 1000 );
    camera4 = new THREE.OrthographicCamera( -widthRatio, widthRatio, heightRatio, -heightRatio, 1, 1000 );
    camera5 = new THREE.PerspectiveCamera(70, aspectRatio, 1, 1000);
    camera6 = new THREE.PerspectiveCamera(70, aspectRatio, 0.1, 1000);

    setCamera(camera1, 0, 30, -50, 0, 30, 0);
    setCamera(camera2, 50, 30, 0, 0, 30, 0);
    setCamera(camera3, 0, 70, 0, 0, 0, 0); // Positioned above the scene looking down
    camera3.rotateZ(Math.PI/2);
    setCamera(camera4, 50, 45, -20, 0, 35, -5);
    setCamera(camera5, 50, 45, -20, 0, 35, -5);
    camera6.rotateX(-Math.PI/2);
    camera6.position.set(0, -0.1, 0); // avoids the camera to be inside the object
    g_garra.add(camera6);

    camera = camera6; // set default camera
}

function switchCamera(cameraType) {
    'use strict';
    switch(cameraType) {
        case 'frontal': // 1
            // aligned with the z-axis
            console.log(camera1.isCamera);
            camera = camera1;
            break;
        case 'lateral': // 2
            // aligned with the x-axis
            camera = camera2;
            break;
        case 'top': // 3   
            // aligned with the y-axis
            camera = camera3;
            break;
        case 'ortographic': // 4
            console.log('Orthographic Camera');
            camera = camera4;
            break;
        case 'perspective': // 5
            console.log('Perspective Camera');
            camera = camera5;
            break;
        case 'mobile': // 6
            console.log('Mobile Camera');
            camera = camera6;
            break;

    }
}

function setCamera(camera, x, y, z, xLook, yLook, zLook) {
    camera.position.x = x;
    camera.position.y = y;
    camera.position.z = z;
    camera.lookAt(xLook, yLook, zLook);
}
/////////////////////
/* CREATE LIGHT(S) */
/////////////////////
function createLights() {
    const ambientLight = new THREE.HemisphereLight(0xffffff, 0x080820, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.shadow.mapSize.width = 5120 // default
    directionalLight.shadow.mapSize.height = 5120 // default
    directionalLight.position.set(50, 70, 40);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.top = -100 // default
    directionalLight.shadow.camera.right = 100 // default
    directionalLight.shadow.camera.left = -100 // default
    directionalLight.shadow.camera.bottom = 100 // default
    scene.add(directionalLight);
}
////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function createMesh(geometry, color) {
    var material = new THREE.MeshPhongMaterial({ color: color, wireframe: wireframe });
    var mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

function createClawMesh(geometry, color) {
    var material = new THREE.MeshPhongMaterial({ color: color, wireframe: wireframe, side: THREE.DoubleSide});
    var mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}


function createBoxObject(x, y, z, width, height, depth, color) {
    'use strict';
    var mesh = createMesh(new THREE.BoxGeometry(width, height, depth), color);
    mesh.position.set(x, y, z);
    return mesh;
}


function createCylinderObject(x, y, z, radiusTop, radiusBottom, height, color) {
    'use strict';
    var mesh = createMesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height), color);
    mesh.position.set(x, y, z);
    return mesh;
}


function createClawFinger(geometry, color, rotationX, rotationZ) {
    var pinca = createClawMesh(geometry, color);
    pinca.rotateX(rotationX);
    pinca.rotateZ(rotationZ);
    pinca.position.set(0, -1, 0);
    return pinca;
}


function createClaw() {
    cabo = createCylinderObject(0, -5, 0, 0.1, 0.1, 10, 0x00ff00);
    garra = createMesh(new THREE.BoxGeometry(0.5, 0.2, 0.5), 0xff00f0);
    
    pinca1 = createClawFinger(new THREE.CylinderGeometry(1, 1, 0.2, 50, 2, true, 0, 2*Math.PI/3), 0xff0000, -Math.PI/2, 0);
    pinca2 = createClawFinger(new THREE.CylinderGeometry(1, 1, 0.2, 50, 2, true, 0, -2*Math.PI/3), 0xff0000, -Math.PI/2, 0);
    pinca3 = createClawFinger(new THREE.CylinderGeometry(1, 1, 0.2, 50, 2, true, 0, 2*Math.PI/3), 0xff0000, -Math.PI/2, -Math.PI/2);
    pinca4 = createClawFinger(new THREE.CylinderGeometry(1, 1, 0.2, 50, 2, true, 0, -2*Math.PI/3), 0xff0000, -Math.PI/2, -Math.PI/2);
    
    pivot_pinca1 = new THREE.Object3D();
    pivot_pinca1.add(pinca1);
    
    pivot_pinca2 = new THREE.Object3D();
    pivot_pinca2.add(pinca2);

    pivot_pinca3 = new THREE.Object3D();
    pivot_pinca3.add(pinca3);
    
    pivot_pinca4 = new THREE.Object3D();
    pivot_pinca4.add(pinca4);
    g_garra = new THREE.Object3D();
    g_garra.add(garra);
    g_garra.add(pivot_pinca1);
    g_garra.add(pivot_pinca2);
    g_garra.add(pivot_pinca3);
    g_garra.add(pivot_pinca4);
    g_garra.position.set(0, -cabo.geometry.parameters.height, 0);

    BB_garra = new THREE.Sphere(g_garra.getWorldPosition(new THREE.Vector3()), 0.8);
}


function createCart() {
    'use strict';
    carrinho = createBoxObject(0, 0, 0, 1, 0.5, 1, 0x0000ff);
    g_carrinho = new THREE.Object3D();
    g_carrinho.add(carrinho);
    g_carrinho.add(cabo);
    g_carrinho.add(g_garra);
    g_carrinho.position.set(0, 2, -15);
}


function createCounterWeight() {
    'use strict';
    contra_peso1 = createBoxObject(0, 2, 0, 2, 4, 1, 0x555555);
    contra_peso2 = createBoxObject(0, 2, 1, 2, 4, 1, 0x666666);
    contra_peso3 = createBoxObject(0, 2, 2, 2, 4, 1, 0x777777);
    contra_peso4 = createBoxObject(0, 2, 3, 2, 4, 1, 0x888888);
    g_peso = new THREE.Object3D();
    g_peso.add(contra_peso1);
    g_peso.add(contra_peso2);
    g_peso.add(contra_peso3);
    g_peso.add(contra_peso4);
    g_peso.position.set(0, 0, 9.5);
}


function createBottomSection() {
    'use strict';
    base = createBoxObject(0, 1, 0, 5, 2, 5, 0x00ffff);
    torre = createBoxObject(0, 24 + 2, 0, 2, 48, 2, 0xff00ff);
    g_bot = new THREE.Object3D();
    g_bot.add(base);
    g_bot.add(torre);
    g_bot.position.set(0, 0, 0);
}


function createTopSection() {
    'use strict';
    createCounterWeight();
    createClaw();
    createCart();
    cabine = createBoxObject(0, 1, 0, 2, 2, 2, 0x0ffff0);
    lanca = createBoxObject(0, 1 + 2, -15 - 1, 2, 2, 30, 0xff000f);
    contra_lanca = createBoxObject(0, 2 + 1, 4 + 1, 2, 2, 8, 0xff000f);
    porta_lanca = createBoxObject(0, 3 + 2, 0, 2, 6, 2, 0xf0f00f);
    tirante_frente = createCylinderObject(0, 5.9, -14.5, 0.1, 0.1, 28, 0xff0000);
    tirante_frente.rotateX(0.455*Math.PI);
    tirante_tras = createCylinderObject(0, 5.9, 5.5, 0.1, 0.1, 12, 0xff0000);
    tirante_tras.rotateX(-0.397*Math.PI);

    g_top = new THREE.Object3D();
    g_top.add(cabine);
    g_top.add(lanca);
    g_top.add(contra_lanca);
    g_top.add(porta_lanca);
    g_top.add(g_peso);
    g_top.add(g_carrinho);
    g_top.add(tirante_frente);
    g_top.add(tirante_tras);
    g_top.position.set(0, 50, 0);
}


function addContainerBase(obj, x, y, z, width, depth) {
    'use strict';
    var geometry = new THREE.BoxGeometry(width, 1, depth);
    var mesh = createMesh(geometry, 0x000000);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}


function addContainerWall(obj, x, y, z, width, height, depth) {
    'use strict';
    var geometry = new THREE.BoxGeometry(width, height, depth);
    var mesh = createMesh(geometry, 0x000000);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function createGroundPlane() {
    const planeWidth = 1000;
    const planeHeight = 1000;
    
    const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
    
    const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x9fff65, side: THREE.DoubleSide, wireframe: wireframe});
    
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    
    plane.receiveShadow = true;
    plane.position.set(0, 0, 0); 
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);
}

function createHUD() {
    const hudEl = document.getElementById('hud');
    hudEl.innerText = '';
    const keys = {
        '1': 'Frontal Camera',
        '2': 'Lateral Camera',
        '3': 'Top Camera',
        '4': 'Orthographic Camera',
        '5': 'Perspective Camera',
        '6': 'Mobile Camera',
        'W': 'Move Forward',
        'S': 'Move Backward',
        'ArrowLeft': 'Rotate Left',
        'ArrowRight': 'Rotate Right',
        'ArrowUp': 'Raise Cargo',
        'ArrowDown': 'Lower Cargo',
        'R': 'Close Claw',
        'F': 'Open Claw',
        'V': 'Toggle Wireframe'
    };
    
    Object.keys(keys).forEach(key => {
        const div = document.createElement('div');
        const description = keys[key];
        div.textContent = `${key}: ${description}`;
        div.className = 'key-box';
        hudEl.appendChild(div);
        keyToElement.set(key.toLowerCase(), div);
    });
}

function updateHUD(key, active) {
    const div = keyToElement.get(key.toLowerCase());
    if (!div) return;
    if (active) {
        div.classList.add('active');
    } else {
        div.classList.remove('active');
    }
}

function createContainer() {
    'use strict';

    var container = new THREE.Object3D();
    var container_walls = new THREE.Mesh(new THREE.CylinderGeometry(15, 10, 5, 4, 5, true), new THREE.MeshPhongMaterial({ color: 0x7393B3, side: THREE.DoubleSide, wireframe: wireframe}));
    container_walls.rotateY(Math.PI/4);
    container_walls.position.set(-15, 2.5, -15);
    container_walls.castShadow = true;
    var container_base = new THREE.Mesh(new THREE.PlaneGeometry(Math.sqrt(200), Math.sqrt(200)), new THREE.MeshPhongMaterial({ color: 0x7393B3, side: THREE.DoubleSide, wireframe: wireframe}));
    container_base.rotateY(Math.PI/2);
    container_base.rotateX(-Math.PI/2);
    container_base.position.set(-15, 0.1, -15);
    container.add(container_walls);
    container.add(container_base);
    scene.add(container);

    BB_container = new THREE.Box3().setFromObject(container);
}

function generatePosition(obj) {

    let objBox = new THREE.Box3();
    objBox.setFromObject(obj);
    let height = objBox.max.y - objBox.min.y;
    let objBB = new THREE.Sphere(obj.position, height/2);

    let x = 0, z = 0;
    do {
        do {
            x = Math.random() * 24 + 6;
            z = Math.random() * 24 + 6;
        } while (Math.sqrt(x**2+z**2) < 6 || Math.sqrt(x**2+z**2) > 30);

        if (Math.random() < 0.5) x *= -1;
        if (Math.random() < 0.5) z *= -1;

        obj.position.set(x, height/2, z);
        objBB.set(obj.position, height/2);

    } while (existsCollisions(objBB));
    objects.push(objBB);
}

function createCargos() {
    let cargos = new THREE.Object3D();

    let cargo1 = createMesh(new THREE.BoxGeometry(2, 2, 2), 0x0ffff0);
    let cargo2 = createMesh(new THREE.BoxGeometry(3, 5, 7), 0x0ffff0);
    let cargo3 = createMesh(new THREE.DodecahedronGeometry(3), 0x0ffff0);
    let cargo4 = createMesh(new THREE.IcosahedronGeometry(2), 0x0ffff0);
    let cargo5 = createMesh(new THREE.TorusGeometry(2), 0x0ffff0);
    let cargo6 = createMesh(new THREE.TorusKnotGeometry(2), 0x0ffff0);

    // randomly scatters the cargos

    generatePosition(cargo1);
    generatePosition(cargo2);
    generatePosition(cargo3);
    generatePosition(cargo4);
    generatePosition(cargo5);
    generatePosition(cargo6);

    cargos.add(cargo1);
    cargos.add(cargo2);
    cargos.add(cargo3);
    cargos.add(cargo4);
    cargos.add(cargo5);
    cargos.add(cargo6);
    scene.add(cargos);
}

//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function existsCollisions(obj) {
    'use strict';
    if (obj.intersectsBox(BB_container)) return true;
    for (let i = 0; i < objects.length; i++) {
        if (obj.intersectsSphere(objects[i])) {
            return true;
        }
    }
    return false;
}

function checkColisions() {
    'use strict';
    for (let i = 0; i < objects.length; i++) {
        if (BB_garra.intersectsSphere(objects[i])) {
            console.log("colisao: " + i);
            return true
        }
    }
    return false;
}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions(){
    'use strict';

}

////////////
/* UPDATE */
////////////
function update() {
    'use strict';

}

/////////////
/* DISPLAY */
/////////////
function render() {
    'use strict';
    renderer.render(scene, camera);
}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {
    'use strict';
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);
    createScene();
    createCamera();
    createLights();

    render();

    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);
    window.addEventListener("resize", onResize);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    'use strict';
    deltaTime = clock.getDelta();

    BB_garra.set(g_garra.getWorldPosition(new THREE.Vector3()), 1.5);

    checkColisions();

    render();
    requestAnimationFrame(animate);
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
export function onResize() {
    'use strict';

    renderer.setSize(window.innerWidth, window.innerHeight);

    if (window.innerHeight > 0 && window.innerWidth > 0) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
    const key = e.key;
    updateHUD(key, true);
    switch (e.keyCode) {
        case 49: // 1
            switchCamera('frontal'); break;
        case 50: // 2
            switchCamera('lateral'); break;
        case 51: // 3
            switchCamera('top'); break;
        case 52: // 4
            switchCamera('ortographic'); break;
        case 53: // 5
            switchCamera('perspective'); break;
        case 54: // 6
            switchCamera('mobile'); break;
        case 87: // W
        case 119: // w
            g_carrinho.position.z -= 1 * deltaTime ? g_carrinho.position.z > -30 : null;
            break;
        case 83: // S
        case 115: // s
            g_carrinho.position.z += 1 * deltaTime ? g_carrinho.position.z < -6 : null;
            break;
        case 37: // Left
            g_top.rotation.y += (Math.PI / rotSpeed) * deltaTime; 
            break;
        case 39: // Right
            g_top.rotation.y -= (Math.PI / rotSpeed) * deltaTime;
            break;
        case 38: // Up
            const len = cabo.geometry.parameters.height;
            if (len - 1 < 3) break;
            cabo.geometry = new THREE.CylinderGeometry(0.1, 0.1, cabo.geometry.parameters.height - ascensionSpeed * deltaTime);
            cabo.position.y += (ascensionSpeed/2) * deltaTime;
            g_garra.position.set(0, -cabo.geometry.parameters.height, 0);
            break;
        case 40: // Down
            const len2 = cabo.geometry.parameters.height;
            if (len2 + 1 > 50) break;
            cabo.geometry = new THREE.CylinderGeometry(0.1, 0.1, cabo.geometry.parameters.height + ascensionSpeed * deltaTime);
            cabo.position.y -= (ascensionSpeed/2) * deltaTime;
            g_garra.position.set(0, -cabo.geometry.parameters.height, 0);
            break;
        case 82: // R (close claw)
            if (pivot_pinca1.rotation.z > -Math.PI/7) {
                const rotIncr = (Math.PI/rotSpeed) * deltaTime;
                pivot_pinca1.rotateZ(-rotIncr);
                pivot_pinca2.rotateZ(rotIncr);
                pivot_pinca3.rotateX(rotIncr);
                pivot_pinca4.rotateX(-rotIncr);
            }
            break;
        case 70: // F (open claw)
            if (pivot_pinca1.rotation.z < Math.PI/6) {
                const rotIncr = (Math.PI/rotSpeed) * deltaTime;
                pivot_pinca1.rotateZ(rotIncr);
                pivot_pinca2.rotateZ(-rotIncr);
                pivot_pinca3.rotateX(-rotIncr);
                pivot_pinca4.rotateX(rotIncr);
            }
            break;
        case 86: // V, display/hide wireframe
            console.log("V pressed")
            scene.traverse(function (node) {
                if (node instanceof THREE.Mesh) {
                    node.material.wireframe = !node.material.wireframe;
                }
            });
            break;
    }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e) {
    'use strict';
    const key = e.key;
    updateHUD(key, false);
}

init();
animate();
