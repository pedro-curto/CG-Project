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
var wireframe = false, items = [];
var clock = new THREE.Clock(), deltaTime;
const rotSpeed = 3, ascensionSpeed = 10, cartSpeed = 6, clawSpeed = 8; // adjust parameters if needed

var pressedKeys = {};

const keyActions = {
    '1': keyOneDown,
    '2': keyTwoDown,
    '3': keyThreeDown,
    '4': keyFourDown,
    '5': keyFiveDown,
    '6': keySixDown,
    '7': keySevenDown,
    'W': keyWDown,
    'S': keySDown,
    'Q': keyQDown,
    'A': keyADown,
    'E': keyEDown,
    'D': keyDDown,
    'R': keyRDown,
    'F': keyFDown
};

var camera1, camera2, camera3, camera4, camera5, camera6;
var tirante_frente, tirante_tras;
var objects = [];
//var cargo1, cargo2, cargo3, cargo4, cargo5, cargo6;
var cargos = [];
var onGoing = false, index, animation_phase = 0, z_cargo_final, isClawHoldingObject = false;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    'use strict';
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.add(new THREE.AxesHelper(10));

    createBottomSection();
    createTopSection();
    scene.add(g_bot);
    scene.add(g_top);
    createContainer();
    createCargos();
    createGroundPlane();
    createHUD();
    console.log(items, items.size);
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
            camera = camera4;
            break;
        case 'perspective': // 5
            camera = camera5;
            break;
        case 'mobile': // 6
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
    items.push(mesh);
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
    var geometry = new THREE.BoxGeometry(width, 0.1, depth);
    var mesh = createMesh(geometry, 0x7393B3);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}


function addContainerWall(obj, x, y, z, width, height, depth) {
    'use strict';
    var geometry = new THREE.BoxGeometry(width, height, depth);
    var mesh = createMesh(geometry, 0x7393B3);
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
        '7': 'Toggle Wireframe',
        'W': 'Move Forward',
        'S': 'Move Backward',
        'Q': 'Rotate Upper Section Counter Clockwise',
        'A': 'Rotate Upper Section Clockwise',
        'E': 'Raise Claw',
        'D': 'Lower Claw',
        'R': 'Close Claw',
        'F': 'Open Claw'
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
    var container_walls = new THREE.Object3D();
    var container_base = new THREE.Object3D();

    //                               x, y, z, width, height, depth
    addContainerWall(container_walls, 0, 2.5, 4.9, 5, 5, 0.2);
    addContainerWall(container_walls, 2.4, 2.5, 0, 0.2, 5, 10);
    addContainerWall(container_walls, -2.4, 2.5, 0, 0.2, 5, 10);
    addContainerWall(container_walls, 0, 2.5, -4.9, 5, 5, 0.2);
    addContainerBase(container_base, 0, 0.1, 0, 5, 10);

    container.add(container_walls);
    container.add(container_base);
    container.position.set(0, 0, -20);
    scene.add(container);
    
    BB_container = new THREE.Sphere(container.position, 5);
}

function generatePosition(obj) {
    let objBox = new THREE.Box3();
    objBox.setFromObject(obj);
    let height = objBox.max.y - objBox.min.y;
    let radius = Math.max(objBox.max.x - objBox.min.x, objBox.max.z - objBox.min.z, height) / 2;
    let objBB = new THREE.Sphere(obj.position, radius);

    let x = 0, z = 0;
    do {
        do {
            x = Math.random() * 30;
            z = Math.random() * 30;
        } while ((x**2+z**2) < 36 || (x**2+z**2) > 900);

        if (Math.random() < 0.5) x *= -1;
        if (Math.random() < 0.5) z *= -1;

        obj.position.set(x, height/2, z);
        objBB.set(obj.position, radius);

    } while (existsCollisions(objBB));
    objects.push(objBB);
}

function createCargos() {
    for (let i = 0; i<20; i++){
        // creates the cargos
        var cargo1 = createMesh(new THREE.BoxGeometry(2, 1, 1), 0x0ffff0);
        var cargo2 = createMesh(new THREE.BoxGeometry(1, 2, 1), 0x0ffff0);
        var cargo3 = createMesh(new THREE.DodecahedronGeometry(1.2), 0x0ffff0);
        var cargo4 = createMesh(new THREE.IcosahedronGeometry(1), 0x0ffff0);
        var cargo5 = createMesh(new THREE.TorusGeometry(0.7), 0x0ffff0);
        var cargo6 = createMesh(new THREE.TorusKnotGeometry(0.8,0.3), 0x0ffff0);

        // randomly rotates the cargos
        cargo1.rotation.set(0, Math.random()*Math.PI*2, 0);
        cargo2.rotation.set(0, Math.random()*Math.PI*2, 0);
        cargo3.rotation.set(0, Math.random()*Math.PI*2, 0);
        cargo4.rotation.set(0, Math.random()*Math.PI*2, 0);
        cargo5.rotation.set(0, Math.random()*Math.PI*2, 0);
        cargo6.rotation.set(0, Math.random()*Math.PI*2, 0);
    
        // randomly scatters the cargos
        generatePosition(cargo1);
        generatePosition(cargo2);
        generatePosition(cargo3);
        generatePosition(cargo4);
        generatePosition(cargo5);
        generatePosition(cargo6);

        // adds the cargos to the scene
        scene.add(cargo1);
        scene.add(cargo2);
        scene.add(cargo3);
        scene.add(cargo4);
        scene.add(cargo5);
        scene.add(cargo6);
        cargos.push(cargo1, cargo2, cargo3, cargo4, cargo5, cargo6);
    }
}

//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function spheresIntersect(sphere1, sphere2) {
    'use strict';
    var xDist = (sphere1.center.x - sphere2.center.x)**2;
    var yDist = (sphere1.center.y - sphere2.center.y)**2;
    var zDist = (sphere1.center.z - sphere2.center.z)**2;
    var distance = xDist + yDist + zDist;
    var radiusSums = (sphere1.radius + sphere2.radius)**2;
    return radiusSums >= distance;
}


function existsCollisions(obj) {
    'use strict';
    if (spheresIntersect(obj, BB_container)) return true;
    for (let i = 0; i < objects.length; i++) {
        if (spheresIntersect(obj, objects[i])) {
            return true;
        }
    }
    return false;
}

function checkColisions() {
    'use strict';
    for (let i = 0; i < objects.length; i++) {
        if (spheresIntersect(BB_garra, objects[i])) {
            if (isClawHoldingObject) return;
            isClawHoldingObject = true;
            index = i;
            let claw_position = g_garra.getWorldPosition(new THREE.Vector3());
            cargos[index].position.set(claw_position.x, claw_position.y - 1.5, claw_position.z);
            g_garra.attach(cargos[index]);
            z_cargo_final = Math.random() * 8 - 24;
            onGoing = true;
        }
    }
    // return false;
}

function betterMod(n, m) {
    return ((n % m) + m) % m;
}

function handleAnimation(){
    if (animation_phase == 0 && g_garra.position.y > -25){
        animation_phase = 1;
    }
    if (animation_phase == 1){
        let isInPosition = (g_top.rotation.y % Math.PI > -0.1 && g_top.rotation.y % Math.PI < 0.1 && g_top.rotation.y % (2*Math.PI) > -0.1 && g_top.rotation.y % (2*Math.PI) < 0.1);
        if (isInPosition) {
            g_top.rotation.y = 0;
            animation_phase = 2;
        }
    }
    if (animation_phase == 2){
        if (g_carrinho.position.z > z_cargo_final - 0.1 && g_carrinho.position.z < z_cargo_final + 0.1){
            animation_phase = 3;
        }
    }
    if (animation_phase == 3){
        var globalPosition = new THREE.Vector3();
        var tmp = new THREE.Box3().setFromObject(cargos[index]);
        var height = tmp.max.y - tmp.min.y;
        cargos[index].getWorldPosition(globalPosition);
        let isOnGround = globalPosition.y < height/2 + (ascensionSpeed/2) * deltaTime
        
        if (isOnGround){
            scene.attach(cargos[index]);
            objects.splice(index,1);
            cargos.splice(index,1);
            animation_phase = 4;
        } 
    }
    if (animation_phase == 4){
        if (g_garra.position.y > -25){
            onGoing = false;
            animation_phase = 0;
            isClawHoldingObject = false;
        }
    }
}

function startAnimation() {
    for (const key in pressedKeys) { delete pressedKeys[key]; }
    handleAnimation();

    if (!onGoing) return;

    if (animation_phase == 0) moveUp();

    if (animation_phase == 1) rotate();

    if (animation_phase == 2) moveCart();

    if (animation_phase == 3) moveDown();

    if (animation_phase == 4) moveUp();

}

function rotate() {
    if (betterMod(g_top.rotation.y, 2*Math.PI) < Math.PI) g_top.rotation.y -= (Math.PI / rotSpeed) * deltaTime;
    else g_top.rotation.y += (Math.PI / rotSpeed) * deltaTime;
}

function moveCart() {
    g_carrinho.position.z += g_carrinho.position.z < z_cargo_final ? cartSpeed * deltaTime : -cartSpeed * deltaTime;
}

function moveUp() {
    cabo.geometry = new THREE.CylinderGeometry(0.1, 0.1, cabo.geometry.parameters.height - ascensionSpeed * deltaTime);
    cabo.position.y += (ascensionSpeed/2) * deltaTime;
    g_garra.position.set(0, -cabo.geometry.parameters.height, 0);
}

function moveDown() {
    cabo.geometry = new THREE.CylinderGeometry(0.1, 0.1, cabo.geometry.parameters.height + ascensionSpeed * deltaTime);
    cabo.position.y -= (ascensionSpeed/2) * deltaTime;
    g_garra.position.set(0, -cabo.geometry.parameters.height, 0);
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
    for (const key in pressedKeys) {
        keyActions[key]();
    }


}

function keyOneDown() { switchCamera('frontal'); }
function keyTwoDown() { switchCamera('lateral'); }
function keyThreeDown() { switchCamera('top'); }
function keyFourDown() { switchCamera('ortographic'); }
function keyFiveDown() { switchCamera('perspective'); }
function keySixDown() { switchCamera('mobile'); }
function keySevenDown() {
    for (var i = 0; i < items.length; i++) {
        items[i].material.wireframe = !items[i].material.wireframe;
    }
    delete pressedKeys['7'];
}

function keyWDown() { g_carrinho.position.z -= g_carrinho.position.z > -30 ? cartSpeed * deltaTime : 0; }
function keySDown() { g_carrinho.position.z += g_carrinho.position.z < -6 ? cartSpeed * deltaTime : 0; }

function keyQDown() { g_top.rotation.y += (Math.PI / rotSpeed) * deltaTime; }
function keyADown() { g_top.rotation.y -= (Math.PI / rotSpeed) * deltaTime; }

function keyEDown() {
    const len = cabo.geometry.parameters.height;
    if (len - 1 < 3) return;
    cabo.geometry = new THREE.CylinderGeometry(0.1, 0.1, cabo.geometry.parameters.height - ascensionSpeed * deltaTime);
    cabo.position.y += (ascensionSpeed/2) * deltaTime;
    g_garra.position.set(0, -cabo.geometry.parameters.height, 0);
}

function keyDDown() {
    const len2 = cabo.geometry.parameters.height;
    if (len2 + 1 > 50) return;
    cabo.geometry = new THREE.CylinderGeometry(0.1, 0.1, cabo.geometry.parameters.height + ascensionSpeed * deltaTime);
    cabo.position.y -= (ascensionSpeed/2) * deltaTime;
    g_garra.position.set(0, -cabo.geometry.parameters.height, 0);
}        

function keyRDown() {
    if (pivot_pinca1.rotation.z > -Math.PI/7) {
        const rotIncr = (Math.PI/clawSpeed) * deltaTime;
        pivot_pinca1.rotateZ(-rotIncr);
        pivot_pinca2.rotateZ(rotIncr);
        pivot_pinca3.rotateX(rotIncr);
        pivot_pinca4.rotateX(-rotIncr);
    }
}

function keyFDown() {
    if (pivot_pinca1.rotation.z < Math.PI/6) {
        const rotIncr = (Math.PI/clawSpeed) * deltaTime;
        pivot_pinca1.rotateZ(rotIncr);
        pivot_pinca2.rotateZ(-rotIncr);
        pivot_pinca3.rotateX(-rotIncr);
        pivot_pinca4.rotateX(rotIncr);
    }
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

    if (onGoing) startAnimation();
    else checkColisions();
    update();
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
    if (onGoing) return;
    const key = e.key.toUpperCase();
    updateHUD(key, true);
    const action = keyActions[key];
    if (!action) return;
    pressedKeys[key.toUpperCase()] = action;
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
function onKeyUp(e) {
    'use strict';
    const key = e.key.toUpperCase();
    updateHUD(key, false);
    delete pressedKeys[key];
}

init();
animate();
