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
var wireframe = true;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    'use strict';
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xDEEFF5);
    scene.add(g_bot);
    scene.add(g_top);

}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCamera() {
    'use strict';
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.x = 50;
    camera.position.y = 45;
    camera.position.z = -20;
    camera.lookAt(0,35,-5);
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
         new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: false, side: THREE.DoubleSide }));
pinca1.rotateX(-Math.PI/2);
pinca1.position.set(0, -1, 0);

pinca2 = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.2, 50, 2, true, 0, -2*Math.PI/3),
            new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: false, side: THREE.DoubleSide }));
pinca2.rotateX(-Math.PI/2);
pinca2.position.set(0, -1, 0);

pinca3 = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.2, 50, 2, true, 0, 2*Math.PI/3),
            new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: false, side: THREE.DoubleSide }));
pinca3.rotateX(-Math.PI/2);
pinca3.rotateZ(-Math.PI/2);
pinca3.position.set(0, -1, 0);

pinca4 = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.2, 50, 2, true, 0, -2*Math.PI/3),
            new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: false, side: THREE.DoubleSide }));
pinca4.rotateX(-Math.PI/2);
pinca4.rotateZ(-Math.PI/2);
pinca4.position.set(0, -1, 0);


g_peso = new THREE.Object3D();
g_peso.add(contra_peso1);
g_peso.add(contra_peso2);
g_peso.add(contra_peso3);
g_peso.add(contra_peso4);
g_peso.position.set(0, 0, 9.5);

g_garra = new THREE.Object3D();
g_garra.add(garra);
g_garra.add(pinca1);
g_garra.add(pinca2);
g_garra.add(pinca3);
g_garra.add(pinca4);
g_garra.position.set(0, -cabo.geometry.parameters.height, 0);

g_carrinho = new THREE.Object3D();
g_carrinho.add(carrinho);
g_carrinho.add(cabo);
g_carrinho.add(g_garra);
g_carrinho.position.set(0, 2, -15);

g_top = new THREE.Object3D();
g_top.add(cabine);
g_top.add(lanca);
g_top.add(contra_lanca);
g_top.add(porta_lanca);
g_top.add(g_peso);
g_top.add(g_carrinho);
g_top.position.set(0, 50, 0);

g_bot = new THREE.Object3D();
g_bot.add(base);
g_bot.add(torre);

g_bot.position.set(0, 0, 0);


//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions(){
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
function update(){
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
        case 87: // W
        case 119: // w
            g_carrinho.position.z -= 1 ? g_carrinho.position.z > -30 : null ;
            break;
        case 83: // S
        case 115: // s
            g_carrinho.position.z += 1 ? g_carrinho.position.z < -6 : null;
            break;
        case 37: // Left
            g_top.rotation.y += Math.PI / 24;
            break;
        case 39: // Right
            g_top.rotation.y -= Math.PI / 24;
            break;
        case 38: // Up
            const len = cabo.geometry.parameters.height;
            if (len - 1 < 3) break;
            cabo.geometry = new THREE.CylinderGeometry(0.1, 0.1, cabo.geometry.parameters.height - 1);
            cabo.position.y += 0.5;
            g_garra.position.set(0, -cabo.geometry.parameters.height, 0);
            break;
        case 40: // Down
            const len2 = cabo.geometry.parameters.height;
            if (len2 + 1 > 50) break;
            cabo.geometry = new THREE.CylinderGeometry(0.1, 0.1, cabo.geometry.parameters.height + 1);
            cabo.position.y -= 0.5;
            g_garra.position.set(0, -cabo.geometry.parameters.height, 0);
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