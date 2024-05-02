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
var g_garra, g_carrinho, carrinho, cabo, garra, pinca1, pinca2, pinca3, pinca4;
var pivot_pinca1, pivot_pinca2, pivot_pinca3, pivot_pinca4;
var keyToElement = new Map();
var wireframe = true;
const rotSpeed = 18, ascensionSpeed = 1; // TODO change to 180 and 0.2 or idk

var camera1, camera2, camera3, camera4, camera5, camera6;
var tirante_frente, tirante_tras;

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
    //createGroundPlane();
    createHUD();
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCamera() {
    'use strict';
    const aspectRatio = window.innerWidth / window.innerHeight;
    camera1 = new THREE.OrthographicCamera( window.innerWidth / - 24, window.innerWidth / 24,
        window.innerHeight / 24, window.innerHeight / - 24, 1, 1000 );
    camera2 = new THREE.OrthographicCamera( window.innerWidth / - 24, window.innerWidth / 24,
        window.innerHeight / 24, window.innerHeight / - 24, 1, 1000 );
    camera3 = new THREE.OrthographicCamera( window.innerWidth / - 24, window.innerWidth / 24,
        window.innerHeight / 24, window.innerHeight / - 24, 1, 1000 );
    camera4 = new THREE.OrthographicCamera( window.innerWidth / - 24, window.innerWidth / 24,
        window.innerHeight / 24, window.innerHeight / - 24, 1, 1000 );
    camera5 = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera6 = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);

    setCamera(camera1, 0, 30, -50, 0, 30, 0);
    setCamera(camera2, 50, 30, 0, 0, 30, 0);
    setCamera(camera3, 0, 70, 0, 0, 0, 0); // Positioned above the scene looking down
    camera3.rotateZ(Math.PI/2);
    setCamera(camera4, 50, 45, -20, 0, 35, -5);
    setCamera(camera5, 50, 45, -20, 0, 35, -5);
    camera6.rotateX(-Math.PI/2);
    camera6.position.set(0, -0.1, 0); // avoids the camera to be inside the object
    g_garra.add(camera6);

    camera = camera5; // set default camera
}

function switchCamera(cameraType) {
    'use strict';
    switch(cameraType) {
        case 'frontal': // 1
            //console.log('Frontal Camera');
            // aligned with the z-axis
            console.log(camera1.isCamera);
            camera = camera1;
            break;
        case 'lateral': // 2
            //console.log('Lateral Camera');
            // aligned with the x-axis
            camera = camera2;
            break;
        case 'top': // 3   
            //console.log('Top Camera');
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
        case 54: // 6 (câmara móvel com projecção perspectiva)
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

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function createMesh(geometry, color) {
    var material = new THREE.MeshBasicMaterial({ color: color, wireframe: wireframe });
    var mesh = new THREE.Mesh(geometry, material);
    return mesh;
}

function createClawMesh(geometry, color) {
    var material = new THREE.MeshBasicMaterial({ color: color, wireframe: wireframe, side: THREE.DoubleSide});
    var mesh = new THREE.Mesh(geometry, material);
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
    const planeWidth = 10000;
    const planeHeight = 10000;
    
    const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
    
    const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x9fff65, side: THREE.DoubleSide });
    
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    
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
    if (active) {
        div.classList.add('active');
    } else {
        div.classList.remove('active');
    }
}

/*function updateHUD() {
    const hudEl = document.getElementById('hud');
    hudEl.innerHTML = '';
    
    keys.forEach(key => {
        const div = document.createElement('div');
        div.innerHTML = key;
        hudEl.appendChild(div);
    });
}*/


function createContainer() {
    'use strict';
    var container = new THREE.Object3D();
    const containerWidth = 25;
    const containerHeight = 10;
    const containerDepth = 15;
    addContainerBase(container, 0, 0.5, 0, containerWidth, containerDepth);
    // frontal walls
    addContainerWall(container, containerWidth/2, containerHeight/2, 0, 1, containerHeight, containerDepth);
    addContainerWall(container, -containerWidth/2, containerHeight/2, 0, 1, containerHeight, containerDepth);
    // lateral walls
    addContainerWall(container, 0, containerHeight/2, -containerDepth / 2, containerWidth, containerHeight, 1);
    addContainerWall(container, 0, containerHeight/2, containerDepth / 2, containerWidth, containerHeight, 1);
    container.position.set(-15, 0, -15);
    scene.add(container);
}

function generatePosition(obj) {
    let objBox = new THREE.Box3();
    objBox.setFromObject(obj);
    let height = objBox.max.y - objBox.min.y;

    let x = 0, y = 0;
    while (Math.sqrt(x**2+y**2) < 6 || Math.sqrt(x**2+y**2) > 30) {
        x = Math.random() * 24 + 6;
        y = Math.random() * 24 + 6;
    }
    if (Math.random() < 0.5) x *= -1;
    if (Math.random() < 0.5) y *= -1;

    console.log(obj, x,y);
    obj.position.set(x, height/2, y);
}

function createCargos() {
    let cargos = new THREE.Object3D();

    let cargo1 = createMesh(new THREE.BoxGeometry(2, 2, 2), 0x0ffff0);
    let cargo2 = createMesh(new THREE.BoxGeometry(3, 5, 7), 0x0ffff0);
    let cargo3 = createMesh(new THREE.DodecahedronGeometry(3), 0x0ffff0);
    let cargo4 = createMesh(new THREE.IcosahedronGeometry(2), 0x0ffff0);
    let cargo5 = createMesh(new THREE.TorusGeometry(2), 0x0ffff0);
    let cargo6 = createMesh(new THREE.TorusKnotGeometry(2), 0x0ffff0);

    generatePosition(cargo1);
    generatePosition(cargo2);
    generatePosition(cargo3);
    generatePosition(cargo4);
    generatePosition(cargo5);
    generatePosition(cargo6);


    // randomly scatters the cargos

    // cargo1.position.set(-5, 0 , -25);
    // cargo2.position.set(20, 0, 20);
    // cargo3.position.set(15, 0, -15);
    // cargo4.position.set(2, 0, 2);
    // cargo5.position.set(4, 0, 4);
    //  cargo6.position.set(6, (tmp.max.y - tmp.min.y)/2 , 6);
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
function checkCollisions() {
    'use strict';

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
    document.body.appendChild(renderer.domElement);
    createScene();
    createCamera();

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

    // var deltaX = (moveRight ? 1 : 0) - (moveLeft ? 1 : 0);
    // var deltaY = (moveForward ? 1 : 0) - (moveBackward ? 1 : 0);
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
            g_carrinho.position.z -= 1 ? g_carrinho.position.z > -30 : null;
            break;
        case 83: // S
        case 115: // s
            g_carrinho.position.z += 1 ? g_carrinho.position.z < -6 : null;
            break;
        case 37: // Left
            g_top.rotation.y += Math.PI / rotSpeed; 
            break;
        case 39: // Right
            g_top.rotation.y -= Math.PI / rotSpeed;
            break;
        case 38: // Up
            const len = cabo.geometry.parameters.height;
            if (len - 1 < 3) break;
            cabo.geometry = new THREE.CylinderGeometry(0.1, 0.1, cabo.geometry.parameters.height - ascensionSpeed);
            cabo.position.y += ascensionSpeed/2;
            g_garra.position.set(0, -cabo.geometry.parameters.height, 0);
            break;
        case 40: // Down
            const len2 = cabo.geometry.parameters.height;
            if (len2 + 1 > 50) break;
            cabo.geometry = new THREE.CylinderGeometry(0.1, 0.1, cabo.geometry.parameters.height + ascensionSpeed);
            cabo.position.y -= ascensionSpeed/2;
            g_garra.position.set(0, -cabo.geometry.parameters.height, 0);
            break;
        case 82: // R (close claw)
            if (pivot_pinca1.rotation.z > -Math.PI/7) {
                pivot_pinca1.rotateZ(-Math.PI/rotSpeed);
                pivot_pinca2.rotateZ(Math.PI/rotSpeed);
                pivot_pinca3.rotateX(Math.PI/rotSpeed);
                pivot_pinca4.rotateX(-Math.PI/rotSpeed);
            }
            break;
        case 70: // F (open claw)
            if (pivot_pinca1.rotation.z < Math.PI/6) {
                pivot_pinca1.rotateZ(Math.PI/rotSpeed);
                pivot_pinca2.rotateZ(-Math.PI/rotSpeed);
                pivot_pinca3.rotateX(-Math.PI/rotSpeed);
                pivot_pinca4.rotateX(Math.PI/rotSpeed);
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
