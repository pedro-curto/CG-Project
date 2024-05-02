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
var wireframe = true;
var camera1, camera2, camera3, camera4, camera5, camera6;
var tirante_frente, tirante_tras;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    'use strict';
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd3d3d3);
    createCargos();
    createContainer();
    createGroundPlane();
    scene.add(g_bot);
    scene.add(g_top);
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCamera() {
    'use strict';
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
    g_garra.add(camera6);

    camera = camera5; // set default camera
}

function switchCamera(cameraType) {
    'use strict';
    switch(cameraType) {
        case 'frontal': // 1
            console.log('Frontal Camera');
            // aligned with the z-axis
            console.log(camera1.isCamera);
            camera = camera1;
            break;
        case 'lateral': // 2
            console.log('Lateral Camera');
            // aligned with the x-axis
            camera = camera2;
            break;
        case 'top': // 3   
            console.log('Top Camera');
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
/////////////////////
/* CREATE LIGHT(S) */
/////////////////////

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////
base = new THREE.Mesh(new THREE.BoxGeometry(5, 2, 5), new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: wireframe }));
base.position.set(0, 1, 0);

torre = new THREE.Mesh(new THREE.BoxGeometry(2, 48, 2), new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: wireframe }));
torre.position.set(0, 24 + 2, 0);

cabine = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshBasicMaterial({ color: 0x0ffff0, wireframe: wireframe }));
cabine.position.set(0, 1, 0);

porta_lanca = new THREE.Mesh(new THREE.BoxGeometry(2,6,2), new THREE.MeshBasicMaterial({ color: 0xf0f00f, wireframe: wireframe }));
porta_lanca.position.set(0, 3 + 2, 0);

contra_lanca = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 8), new THREE.MeshBasicMaterial({ color: 0xff000f, wireframe: wireframe }));
contra_lanca.position.set(0, 2 + 1, 4 + 1);

lanca = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 30), new THREE.MeshBasicMaterial({ color: 0xff000f, wireframe: wireframe }));
lanca.position.set(0, 1 + 2, -15 - 1);

contra_peso1 = new THREE.Mesh(new THREE.BoxGeometry(2, 4, 1), new THREE.MeshBasicMaterial({ color: 0x555555, wireframe: wireframe }));
contra_peso1.position.set(0, 2, 0)

contra_peso2 = new THREE.Mesh(new THREE.BoxGeometry(2, 4, 1), new THREE.MeshBasicMaterial({ color: 0x666666, wireframe: wireframe }));
contra_peso2.position.set(0, 2, 1)

contra_peso3 = new THREE.Mesh(new THREE.BoxGeometry(2, 4, 1), new THREE.MeshBasicMaterial({ color: 0x777777, wireframe: wireframe }));
contra_peso3.position.set(0, 2, 2)

contra_peso4 = new THREE.Mesh(new THREE.BoxGeometry(2, 4, 1), new THREE.MeshBasicMaterial({ color: 0x888888, wireframe: wireframe }));
contra_peso4.position.set(0, 2, 3)

carrinho = new THREE.Mesh(new THREE.BoxGeometry(1, 0.5, 1), new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: wireframe }));

cabo = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 10), new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: false }));
cabo.position.set(0, -5, 0);

garra = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.5), new THREE.MeshBasicMaterial({ color: 0xff00f0, wireframe: false }));

pinca1 = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.2, 50, 2, true, 0, 2*Math.PI/3),
         new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: wireframe, side: THREE.DoubleSide }));
pinca1.rotateX(-Math.PI/2);
pinca1.position.set(0, -1, 0);

pinca2 = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.2, 50, 2, true, 0, -2*Math.PI/3),
            new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: wireframe, side: THREE.DoubleSide }));
pinca2.rotateX(-Math.PI/2);
pinca2.position.set(0, -1, 0);

pinca3 = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.2, 50, 2, true, 0, 2*Math.PI/3),
            new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: wireframe, side: THREE.DoubleSide }));
pinca3.rotateX(-Math.PI/2);
pinca3.rotateZ(-Math.PI/2);
pinca3.position.set(0, -1, 0);

pinca4 = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.2, 50, 2, true, 0, -2*Math.PI/3),
            new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: wireframe, side: THREE.DoubleSide }));
pinca4.rotateX(-Math.PI/2);
pinca4.rotateZ(-Math.PI/2);
pinca4.position.set(0, -1, 0);

pivot_pinca1 = new THREE.Object3D();
pivot_pinca1.add(pinca1);

pivot_pinca2 = new THREE.Object3D();
pivot_pinca2.add(pinca2);

pivot_pinca3 = new THREE.Object3D();
pivot_pinca3.add(pinca3);

pivot_pinca4 = new THREE.Object3D();
pivot_pinca4.add(pinca4);

g_peso = new THREE.Object3D();
g_peso.add(contra_peso1);
g_peso.add(contra_peso2);
g_peso.add(contra_peso3);
g_peso.add(contra_peso4);
g_peso.position.set(0, 0, 9.5);

g_garra = new THREE.Object3D();
g_garra.add(garra);
g_garra.add(pivot_pinca1);
g_garra.add(pivot_pinca2);
g_garra.add(pivot_pinca3);
g_garra.add(pivot_pinca4);
g_garra.position.set(0, -cabo.geometry.parameters.height, 0);

g_carrinho = new THREE.Object3D();
g_carrinho.add(carrinho);
g_carrinho.add(cabo);
g_carrinho.add(g_garra);
g_carrinho.position.set(0, 2, -15);

tirante_frente = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 28, 50, 2, false, 0, 2*Math.PI),
            new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: wireframe, side: THREE.DoubleSide }));
tirante_frente.rotateX(0.455*Math.PI);
tirante_frente.position.set(0, 5.9, -14.5);

tirante_tras = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 12, 50, 2, false, 0, 2*Math.PI),
            new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: wireframe, side: THREE.DoubleSide }));
tirante_tras.rotateX(-0.397*Math.PI);
tirante_tras.position.set(0, 5.9, 5.5);

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

g_bot = new THREE.Object3D();
g_bot.add(base);
g_bot.add(torre);

g_bot.position.set(0, 0, 0);

function createMesh(geometry, color) {
    var material = new THREE.MeshBasicMaterial({ color: color, wireframe: wireframe });
    var mesh = new THREE.Mesh(geometry, material);
    return mesh;
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


function createGroundPlane() {
    const planeWidth = 10000;
    const planeHeight = 10000;

    const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);

    const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x9fff65, side: THREE.DoubleSide, wireframe: wireframe });

    const plane = new THREE.Mesh(planeGeometry, planeMaterial);

    plane.position.set(0, 0, 0);
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);
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
    window.addEventListener("resize", onResize);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
    'use strict';

    // var deltaX = (moveRight ? 1 : 0) - (moveLeft ? 1 : 0);
    // var deltaY = (moveForward ? 1 : 0) - (moveBackward ? 1 : 0);

    // moveCamera(deltaX, deltaY);
    
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
            g_carrinho.position.z -= 1 ? g_carrinho.position.z > -30 : null ;
            break;
        case 83: // S
        case 115: // s
            g_carrinho.position.z += 1 ? g_carrinho.position.z < -6 : null;
            break;
        case 37: // Left
            g_top.rotation.y += Math.PI / 180;
            break;
        case 39: // Right
            g_top.rotation.y -= Math.PI / 180;
            break;
        case 38: // Up
            const len = cabo.geometry.parameters.height;
            if (len - 1 < 3) break;
            cabo.geometry = new THREE.CylinderGeometry(0.1, 0.1, cabo.geometry.parameters.height - 0.2);
            cabo.position.y += 0.1;
            g_garra.position.set(0, -cabo.geometry.parameters.height, 0);
            break;
        case 40: // Down
            const len2 = cabo.geometry.parameters.height;
            if (len2 + 1 > 50) break;
            cabo.geometry = new THREE.CylinderGeometry(0.1, 0.1, cabo.geometry.parameters.height + 0.2);
            cabo.position.y -= 0.1;
            g_garra.position.set(0, -cabo.geometry.parameters.height, 0);
            break;
        case 82: // R (close claw)
            if (pivot_pinca1.rotation.z > -Math.PI/7) {
                pivot_pinca1.rotateZ(-Math.PI/180);
                pivot_pinca2.rotateZ(Math.PI/180);
                pivot_pinca3.rotateX(Math.PI/180);
                pivot_pinca4.rotateX(-Math.PI/180);
            }
            break;
        case 70: // F (open claw)
            if (pivot_pinca1.rotation.z < Math.PI/6) {
                pivot_pinca1.rotateZ(Math.PI/180);
                pivot_pinca2.rotateZ(-Math.PI/180);
                pivot_pinca3.rotateX(-Math.PI/180);
                pivot_pinca4.rotateX(Math.PI/180);
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
function onKeyUp(e){
    'use strict';
}

init();
animate();

function setCamera(camera, x, y, z, xLook, yLook, zLook) {
    camera.position.x = x;
    camera.position.y = y;
    camera.position.z = z;
    camera.lookAt(xLook, yLook, zLook);
}