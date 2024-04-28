import * as THREE from 'three';

var moveLeft = false;
var moveRight = false;
var moveForward = false;
var moveBackward = false;


function createMovingCamera() {
    'use strict';

    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000)

    camera.position.x = 50;
    camera.position.y = 50;
    camera.position.z = 50;
    camera.lookAt(0,25,0);

    return camera;
}


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
    camera.lookAt(0,25,0); // Look at the center of the scene
}