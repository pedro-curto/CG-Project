import * as THREE from 'three';

var scene;

export function createScene() {
    'use strict';

    scene = new THREE.Scene();

    scene.add(new THREE.AxesHelper(10));

    createCrane(0, 0, 0);
}

export function onResize(renderer) {
    'use strict';

    renderer.setSize(window.innerWidth, window.innerHeight);

    if (window.innerHeight > 0 && window.innerWidth > 0) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
}

export function render(renderer) {
    'use strict';
    renderer.render(scene, camera);
}