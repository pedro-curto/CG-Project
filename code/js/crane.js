import * as THREE from 'three';

function createCraneBase(obj, x, y, z) {
    'use strict'
    var geometry = new THREE.BoxGeometry(4, 2, 4);
    var material = new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: wireframe });
    var base = new THREE.Mesh(geometry, material);
    base.position.set(x, y + 1, z);
    obj.add(base);
}

function createCraneTower(obj, x, y, z) {
    'use strict'
    var geometry = new THREE.BoxGeometry(2,48,2);
    var material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: wireframe });
    var tower = new THREE.Mesh(geometry, material);
    tower.position.set(x, y + 24, z);
    obj.add(tower);
}

function createCraneCabin(obj, x, y, z) {
    'use strict'
    var geometry = new THREE.BoxGeometry(2,2,2);
    var material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: wireframe });
    var cabin = new THREE.Mesh(geometry, material);
    cabin.position.set(x, y + 2, z);
    obj.add(cabin);
}

function createCraneTop(obj, x, y, z) {
    'use strict'
    var geometry = new THREE.BoxGeometry(2,6,2);
    var material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: wireframe });
    var top = new THREE.Mesh(geometry, material);
    top.position.set(x, y + 4, z);
    obj.add(top);
}

function createCraneLance(obj, x, y, z) {
    'use strict'
    var geometry = new THREE.BoxGeometry(2,2,10);
    var material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: wireframe });
    var lance = new THREE.Mesh(geometry, material);
    lance.position.set(x, y + 2, z - 16);
    obj.add(lance);
}

export function createCrane(scene, x,y,z) {
    'use strict'
    var crane = new THREE.Object3D();
    createCraneBase(crane, 0, 0, 0);
    createCraneTower(crane, 0, 2, 0);
    createCraneCabin(crane, 0, 49, 0);
    createCraneTop(crane, 0, 51, 0);
    createCraneLance(crane, 0, 49, 0);
    scene.add(crane);
    crane.position.set(x, y, z);
}