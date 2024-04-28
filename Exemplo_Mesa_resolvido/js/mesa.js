import * as THREE from 'three';

var camera, scene, renderer;

var geometry, material, mesh;

var ball;

var moveLeft = false;
var moveRight = false;
var moveForward = false;
var moveBackward = false;

function addTableLeg(obj, x, y, z) {
    'use strict';

    geometry = new THREE.BoxGeometry(2, 6, 2);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y - 3, z);
    obj.add(mesh);
}

function addTableTop(obj, x, y, z) {
    'use strict';
    geometry = new THREE.BoxGeometry(60, 2, 20);
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    obj.add(mesh);
}

function createBall(x, y, z) {
    'use strict';

    ball = new THREE.Object3D();
    ball.userData = { jumping: true, step: 0 };

    material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true});
    geometry = new THREE.SphereGeometry(4, 10, 10);
    mesh = new THREE.Mesh(geometry, material);

    ball.add(mesh);
    ball.position.set(x, y, z);

    scene.add(ball);
}


function createTable(x, y, z) {
    'use strict';

    var table = new THREE.Object3D();

    material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

    addTableTop(table, 0, 0, 0);
    addTableLeg(table, -25, -1, -8);
    addTableLeg(table, -25, -1, 8);
    addTableLeg(table, 25, -1, 8);
    addTableLeg(table, 25, -1, -8);
    
    scene.add(table);
    
    table.position.x = x;
    table.position.y = y;
    table.position.z = z;
}

function createScene() {
    'use strict';

    scene = new THREE.Scene();


    scene.add(new THREE.AxesHelper(10));

    createTable(0, 8, 0);
    createBall(0, 0, 15);
}

function createCamera() {
    'use strict';
    camera = new THREE.PerspectiveCamera(70,
                                         window.innerWidth / window.innerHeight,
                                         1,
                                         1000);
    camera.position.x = 50;
    camera.position.y = 50;
    camera.position.z = 50;
    camera.lookAt(scene.position);
}

function onResize() {
    'use strict';

    renderer.setSize(window.innerWidth, window.innerHeight);

    if (window.innerHeight > 0 && window.innerWidth > 0) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }

}

function onKeyDown(e) {
    'use strict';
    switch (e.keyCode) {
    case 65: //A
    case 97: //a
        scene.traverse(function (node) {
            if (node instanceof THREE.Mesh) {
                node.material.wireframe = !node.material.wireframe;
            }
        });
        break;
    case 83:  //S
    case 115: //s
        ball.userData.jumping = !ball.userData.jumping;
        break;
    case 69:  //E
    case 101: //e
        scene.traverse(function (node) {
            if (node instanceof THREE.AxesHelper) {
                node.visible = !node.visible;
            }
        });
        break;
    case 37: // Left arrow key
        moveLeft = true;
        break;
    case 39: // Right arrow key
        moveRight = true;
        break;
    case 38: // Up arrow key
        moveForward = true;
        break;
    case 40: // Down arrow key
        moveBackward = true;
        break;
    }
}

function onKeyUp(e) {
    'use strict';
    switch (e.keyCode) {
        case 37: // Left arrow key
            moveLeft = false;
            break;
        case 39: // Right arrow key
            moveRight = false;
            break;
        case 38: // Up arrow key
            moveForward = false;
            break;
        case 40: // Down arrow key
            moveBackward = false;
            break;
    }
}


function render() {
    'use strict';
    renderer.render(scene, camera);
}

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

var isDragging = false;
var previousMouseX = 0;
var previousMouseY = 0;

function onDocumentMouseDown(event) {
    if (event.button === 0) { // Check if left mouse button is pressed (M1)
        isDragging = true;
        previousMouseX = event.clientX;
        previousMouseY = event.clientY;
    }
}

function onDocumentMouseUp(event) {
    if (event.button === 0) { // Check if left mouse button is released
        isDragging = false;
    }
}

function onDocumentMouseMove(event) {
    if (isDragging) {
        var deltaX = event.clientX - previousMouseX;
        var deltaY = event.clientY - previousMouseY;

        rotateScene(deltaX, deltaY);

        previousMouseX = event.clientX;
        previousMouseY = event.clientY;
    }
}

document.addEventListener('mousedown', onDocumentMouseDown, false);
document.addEventListener('mouseup', onDocumentMouseUp, false);
document.addEventListener('mousemove', onDocumentMouseMove, false);

function rotateScene(deltaX, deltaY) {
    // Adjust rotation angles based on mouse movement
    var rotationSpeed = 0.01;
    var distance = 30; // Adjust the distance from the object

    // Convert mouse movement to spherical coordinates
    var thetaDelta = -deltaX * rotationSpeed;
    var phiDelta = -deltaY * rotationSpeed;

    // Calculate new spherical coordinates
    camera.position.sub(scene.position); // Move camera to the origin
    camera.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), thetaDelta); // Rotate horizontally
    camera.position.applyAxisAngle(new THREE.Vector3(1, 0, 0), phiDelta); // Rotate vertically
    camera.position.add(scene.position); // Move camera back to its original position
    camera.lookAt(scene.position); // Look at the center of the scene
}

function moveCamera(deltaX, deltaY) {
    // Adjust rotation angles based on mouse movement
    var rotationSpeed = 0.05;

    // Convert mouse movement to spherical coordinates
    var thetaDelta = -deltaX * rotationSpeed;
    var phiDelta = deltaY * rotationSpeed;

    // Calculate new spherical coordinates
    var spherical = new THREE.Spherical().setFromVector3(camera.position.clone().sub(scene.position));
    spherical.theta -= thetaDelta;
    spherical.phi -= phiDelta;

    // Wrap theta around 360 degrees
    spherical.theta = (spherical.theta + 2 * Math.PI) % (2 * Math.PI);

    // Convert spherical coordinates back to Cartesian coordinates
    camera.position.copy(new THREE.Vector3().setFromSpherical(spherical)).add(scene.position);

    // Update camera's lookAt to focus on the scene center
    camera.lookAt(scene.position);
}

function animate() {
    'use strict';

    if (ball.userData.jumping) {
        ball.userData.step += 0.04;
        ball.position.y = Math.abs(30 * (Math.sin(ball.userData.step)));
        ball.position.z = 15 * (Math.cos(ball.userData.step));
    }

    var deltaX = (moveRight ? 1 : 0) - (moveLeft ? 1 : 0);
    var deltaY = (moveForward ? 1 : 0) - (moveBackward ? 1 : 0);

    // Move camera spherically
    moveCamera(deltaX, deltaY);
    
    render();
    
    requestAnimationFrame(animate);
}

init();
animate();