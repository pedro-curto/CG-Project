import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import * as Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
import { ParametricGeometries } from 'three/addons/geometries/ParametricGeometries.js';

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
var renderer, scene, defaultCamera, controls;
var wireframe = false, items = [];
var sceneItems = new Map();
var camera1, camera2, camera3, camera4, camera5, camera6;
var ring1Group, ring2Group, ring3Group;
var ring1MovDir = 1, ring2MovDir = 1, ring3MovDir = 1;
var rings = [];
const ringThickness = 25, ringHeight = 15;
const lowerLimit = 0, upperLimit = 100-ringHeight, ascensionSpeed = 25;
var surfaces = [];
var clock = new THREE.Clock(), deltaTime;
const cylinderHeight = 100, cylinderRadius = 20, rotationSpeed = 128;
var pressedKeys = {};
var directionalLight, ambientLight;
var mobiusLightsGroup, spotlightsGroup;
var defaultMaterial = 2;
var geometries, materials; // TODO do the materials still make sense?

const keyActions = {
    '1': keyOneDown,
    '2': keyTwoDown,
    '3': keyThreeDown,
    'D': keyDDown,
    'P': keyPDown,
    'S': keySDown,
    'Q': keyQDown,
    'W': keyWDown,
    'E': keyEDown,
    'R': keyRDown
};

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
    'use strict';
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.add(new THREE.AxesHelper(10));
    createBase();
    createSkydome();
    createMobiusStrip();
    console.log(items, items.size);
    console.log(sceneItems, sceneItems.size);
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCamera() {
    'use strict';
    const widthRatio = window.innerWidth / 24;
    const heightRatio = window.innerHeight / 24;
    const aspectRatio = window.innerWidth / window.innerHeight;
    camera1 = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 10000);
    setCamera(camera1, 200, 50, 200, 0, 0, 0);

    defaultCamera = camera1; // set default camera
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
    ambientLight = new THREE.AmbientLight(0xffa500, 0.5);
    scene.add(ambientLight);

    directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.shadow.mapSize.width = 5120 // default
    directionalLight.shadow.mapSize.height = 5120 // default
    directionalLight.position.set(200, 200, 200);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.top = -100 // default
    directionalLight.shadow.camera.right = 100 // default
    directionalLight.shadow.camera.left = -100 // default
    directionalLight.shadow.camera.bottom = 100 // default
    scene.add(directionalLight);
}

function createObjectLight(object) {
    const light = new THREE.SpotLight(0xffffff, 100, 100, Math.PI/4);
    light.position.set(object.position.x, ringHeight, object.position.z);
    light.target = object;
    // light.target.position.set(object.position.x, 300, object.position.z);
    spotlightsGroup.add(light);
}

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function createMesh(geometry, color) {
    var phongMaterial = new THREE.MeshPhongMaterial({ color: color, wireframe: wireframe });
    var lambertMaterial = new THREE.MeshLambertMaterial({ color: color, wireframe: wireframe });
    var toonMaterial = new THREE.MeshToonMaterial({ color: color, wireframe: wireframe });
    var normalMaterial = new THREE.MeshNormalMaterial({ wireframe: wireframe });
    var mesh = new THREE.Mesh(geometry, phongMaterial);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    items.push(mesh);
    sceneItems.set(mesh, {phong: phongMaterial, lambert: lambertMaterial, toon: toonMaterial, normal: normalMaterial});
    return mesh;
}

function createParamSurfaceMesh(geometry) {
    var phongMaterial = new THREE.MeshPhongMaterial( { 
        color: 0xff0000,
        transparent: true,
        opacity: 0.6,
        shininess: 100,
        specular: 0xffffff,
        side: THREE.DoubleSide,
        depthWrite: false
    });
    var lambertMaterial = new THREE.MeshLambertMaterial( { color: 0x00ff00, side: THREE.DoubleSide});
    var toonMaterial = new THREE.MeshToonMaterial( { color: 0x00ff00, side: THREE.DoubleSide});
    var normalMaterial = new THREE.MeshNormalMaterial( { side: THREE.DoubleSide});
    var mesh = new THREE.Mesh(geometry, toonMaterial);
    sceneItems.set(mesh, {phong: phongMaterial, lambert: lambertMaterial, toon: toonMaterial, normal: normalMaterial});
    return mesh;
}


function createCylinderObject(x, y, z, radiusTop, radiusBottom, height, color) {
    'use strict';
    // var mesh = createMesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height), color);   TODO: fix this
    var geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height);
    var mesh = createMesh(geometry, color);
    mesh.receiveShadow = true;
    items.push(mesh);
    mesh.position.set(x, y, z);
    return mesh;
}


function cilindroSemBases(u, t, target) { // 1
    const rho = 2.5;
    const height = 5;
    const phi = u * 2 * Math.PI;

    const x = rho * Math.cos(phi);
    const z = rho * Math.sin(phi);
    const y = t * height - height/2;

    target.set(x,y,z);
}

/////////////////////////////////////////////////////////////////////////////////
//                  AUXILIAR FUNCTION FOR PARAMETRIC SURFACES                  //
/////////////////////////////////////////////////////////////////////////////////

function cilindroSemBasesNaoCircular(u, t, target) { // 2
    const rho = 2.5;
    const height = 5;
    const phi = u * 2 * Math.PI;

    const x = rho * Math.cos(phi) + Math.sin(phi) * 2 * Math.sin(phi - 2.1)**5;
    const z = rho * Math.sin(phi) + Math.sin(phi) * 2 * Math.sin(phi - 2.1)**5;
    const y = t * height - height/2;

    target.set(x,y,z);
}

function cilindroSemBaseTorto(u, t, target) { // 3
    const rho = 2.5;
    const height = 5;
    const phi = u * 2 * Math.PI;

    const x = rho * Math.cos(phi) + Math.sin(phi) * 2 * Math.sin(phi - 1)**5 + 3 * t;
    const z = rho * Math.sin(phi) + Math.sin(phi) * 2 * Math.sin(phi - 1.2)**3 + t;
    const y = t * height - height/2;

    target.set(x,y,z);
}

function cone(u, t, target) { // 4
    const rho = 2.5;
    const height = 6;
    const phi = u * 2 * Math.PI;

    const x = rho * Math.cos(phi) * (1-t);
    const z = rho * Math.sin(phi) * (1-t);
    const y = t * height - height/2;

    target.set(x,y,z);
}

function MeioConeMeioCilindro(u, t, target) { // 5
    const rho = 2.5;
    const height = 6;
    const phi = u * 2 * Math.PI;

    const x = rho * Math.cos(phi) * (1-t/2);
    const z = rho * Math.sin(phi) * (1-t/2);
    const y = t * height - height/2;

    target.set(x,y,z);
}

function coneTorto(u, t, target) { // 6
    const rho = 2.5;
    const height = 6;
    const phi = u * 2 * Math.PI;

    const x = (rho * Math.cos(phi) + Math.sin(phi) * Math.sin(phi - 1.2)**3) * (1-t) + 3 * t;
    const z = (rho * Math.sin(phi) + Math.sin(phi) * Math.sin(phi - 1.2)**3) * (1-t) + t;
    const y = t * height - height/2;

    target.set(x,y,z);
}

// ParametricGeometries.mobius 

function planoTorto(u, t, target) { // 7
    const size = 5;
    const height = 2;

    const x = size * u;
    const z = size * t;
    const y = (height * (1-2.2*u) * (0.7-t));

    target.set(x,y,z);
}

function hiperboloide(u, t, target) { // 8
    const rho = 2.5;
    const height = 5;
    const phi = u * 2 * Math.PI;

    const x = rho * Math.cos(phi) * (Math.sqrt((0.5-t)**2 + 0.01) + 0.5);
    const z = rho * Math.sin(phi) * (Math.sqrt((0.5-t)**2 + 0.01) + 0.5);
    const y = t * height - height/2;

    target.set(x,y,z);
}

function initializeArrays() {
    geometries = [cilindroSemBases, cilindroSemBasesNaoCircular, cilindroSemBaseTorto, 
        cone, MeioConeMeioCilindro, coneTorto, planoTorto, hiperboloide];
    // TODO does this still make sense?
    materials = [
        new THREE.MeshLambertMaterial( { color: 0x00ff00, side: THREE.DoubleSide}),
        new THREE.MeshPhongMaterial( { 
            color: 0xff0000,
            transparent: true,
            opacity: 0.6,
            shininess: 100,
            specular: 0xffffff,
            side: THREE.DoubleSide,
            depthWrite: false
        }),
        new THREE.MeshToonMaterial( { color: 0x00ff00, side: THREE.DoubleSide}),
        new THREE.MeshNormalMaterial( { side: THREE.DoubleSide}),
    ]
}



function createObjects(radius, ringGroup) {
    const n_objects = 8;
    const angle = 2 * Math.PI / n_objects;
    for (let i = 0; i < n_objects; i++) {
        const geometry = new ParametricGeometry(geometries[i], 100, 100);
        const object = createParamSurfaceMesh(geometry);
        object.castShadow = true;
        object.receiveShadow = true;
        object.position.set(
            (radius + ringThickness/2) * Math.sin(angle * i),
            ringHeight + 2.5,
            (radius + ringThickness/2) * Math.cos(angle * i)
        );
        ringGroup.add(object);
        surfaces.push(object);
        createObjectLight(object);
    }
}

function rotateParametricSurfaces () {
    // for (let surface of surfaces) {
    //     surface.rotateY(Math.PI/rotationSpeed) * deltaTime;
    // } 
    surfaces.forEach(surface => { 
        surface.rotateX(Math.PI/rotationSpeed) * deltaTime;
    })
}

////////////////////////////////////////////////////////////////////////
/*                   CREATE MOBIUS STRIP AND LIGHTS                   */
////////////////////////////////////////////////////////////////////////

function createMobiusStrip() {
    const mobius_group = new THREE.Group();
    const mobiusGeometry = new THREE.BufferGeometry();
    const segments = 100;
    const vertices = [];
    const indices = [];
    const position = new THREE.Vector3();

    // vértices
    for (let i = 0; i <= segments; i++) {
        const u = i / segments;

        for (let j = 0; j <= segments; j++) {
            const t = j / segments;
            create_points(u, t, position);
            vertices.push(position.x, position.y, position.z);
        }
    }

    for (let i = 0; i < segments; i++) {
        for (let j = 0; j < segments; j++) {
            const a = i * (segments + 1) + j;
            const b = i * (segments + 1) + (j + 1);
            const c = (i + 1) * (segments + 1) + (j + 1);
            const d = (i + 1) * (segments + 1) + j;

            indices.push(a, b, d);
            indices.push(b, c, d);
        }
    }

    mobiusGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    mobiusGeometry.setIndex(indices);
    mobiusGeometry.computeVertexNormals();

    const material = new THREE.MeshPhongMaterial({
        color: 0x4169E1,
        // color: 0xff7700,
        transparent: true,
        opacity: 0.6,
        shininess: 100,
        specular: 0xffffff,
        side: THREE.DoubleSide,
        depthWrite: false // Importante para transparência
    });
    const mobius = new THREE.Mesh(mobiusGeometry, material);
    mobius.scale.multiplyScalar(25);
    mobius.rotateX(Math.PI/2);

    createMobiusLights();
    mobius_group.add(mobius);
    mobius_group.add(mobiusLightsGroup);
    mobius_group.position.set(0,cylinderHeight + 20,0);
    scene.add(mobius_group);


    // helper function
    function create_points(u, t, target) {
		// volumetric mobius strip
		u *= Math.PI;
		t *= 2 * Math.PI;

		u = u * 2;
		const phi = u / 2;
		const major = 2.25, a = 0.125, b = 0.65;

		let x = a * Math.cos( t ) * Math.cos( phi ) - b * Math.sin( t ) * Math.sin( phi );
		const z = a * Math.cos( t ) * Math.sin( phi ) + b * Math.sin( t ) * Math.cos( phi );
		const y = ( major + x ) * Math.sin( u );
		x = ( major + x ) * Math.cos( u );

		target.set( x, y, z );
	}
}

function createMobiusLights() {
    const n_lights = 8;
    const radius = 34;
    mobiusLightsGroup = new THREE.Group();
    for (let i = 0; i < n_lights; i++) {
        const light = new THREE.PointLight(0xffffff, 250, 50, 2);
        light.position.set(
            radius * Math.sin(2*Math.PI / n_lights * i),
            0,
            radius * Math.cos(2*Math.PI / n_lights * i)
        );
        mobiusLightsGroup.add(light);
    }
}


////////////////////////////////////////////////////////////////////////////////
//                            CYLINDER AND RINGS                              //
////////////////////////////////////////////////////////////////////////////////

/* 
* Creates the central cylinder and three concentric rings
*/
function createBase() {
    'use strict';
    ring1Group = new THREE.Group();
    ring2Group = new THREE.Group();
    ring3Group = new THREE.Group();
    spotlightsGroup = new THREE.Group();
    createMainCylinder();
    createRings();
    scene.add(ring1Group);
    scene.add(ring2Group);
    scene.add(ring3Group);
    scene.add(spotlightsGroup);
}


function createMainCylinder() {
    'use strict';
    const color = 0x8a2be2;
    const main_cylinder = createCylinderObject(0, cylinderHeight/2, 0, cylinderRadius, cylinderRadius, cylinderHeight, color);
    scene.add(main_cylinder);
}


function createRing(outerRadius, innerRadius, height, color) {
    const ringShape = new THREE.Shape();
    ringShape.moveTo(outerRadius, 0);
    ringShape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);
    ringShape.holes.push(new THREE.Path().absarc(0, 0, innerRadius, 0, Math.PI * 2, true));

    const extrudeSettings = {
        steps: 1,
        curveSegments: 50,
        depth: height,
        bevelEnabled: false
    };

    const ring = createMesh(new THREE.ExtrudeGeometry(ringShape, extrudeSettings), color);
    ring.rotation.x = Math.PI / 2; // rotates into correct position
    return ring;
}

function createRings() {
    const numRings = 3;
    //const ringColors = [0xff4500, 0x32cd32, 0x1e90ff];
    const ringColors = [0xff6347, 0x4682b4, 0x32cd32];
    var ringInnerRadius = cylinderRadius;
    var ringOuterRadius = ringInnerRadius + ringThickness;

    var ringGroups = [ring1Group, ring2Group, ring3Group];
    
    for (let i = 0; i < numRings; i++) {
        const ringColor = ringColors[i];
        const ring = createRing(ringOuterRadius, ringInnerRadius, ringHeight, ringColor);
        ring.position.set(0, ringHeight, 0);
        rings.push(ring);
        createObjects(ringInnerRadius, ringGroups[i]);
        ringGroups[i].add(ring);
        ringInnerRadius = ringOuterRadius;
        ringOuterRadius = ringInnerRadius + ringThickness;
    }
}


//////////////////////
/*  CREATE SKYDOME  */
//////////////////////

// Carregar a textura
function createSkydome() {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('image.png', function(texture) {
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(3,3);
    });

    // Criar a geometria da calota esférica (skydome)
    const geometry = new THREE.SphereGeometry(500, 100, 100);
    geometry.scale(-1, 1, 1); // Inverter a geometria para criar um interior

    // Aplicar a textura à geometria
    const material = new THREE.MeshBasicMaterial({
        map: texture
    });
    const skydome = new THREE.Mesh(geometry, material);
    scene.add(skydome);
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
    mobiusLightsGroup.rotation.y += 10* 2*Math.PI/rotationSpeed * deltaTime;
    for (const key in pressedKeys) {
        keyActions[key]();
    }
    rotateParametricSurfaces();
}

function keyOneDown() { 
    // rings can only move in one direction at a time, and must invert direction if they reach the limits
    if (ring1Group.position.y >= upperLimit) {
        ring1Group.position.y = upperLimit;
        ring1MovDir = -1;
    }
    if (ring1Group.position.y <= lowerLimit && ring1MovDir == -1) {
        ring1Group.position.y = lowerLimit;
        ring1MovDir = 1;
    }
    ring1Group.position.y += ring1MovDir * ascensionSpeed * deltaTime;
}

function keyTwoDown() { 
    if (ring2Group.position.y >= upperLimit) {
        ring2Group.position.y = upperLimit;
        ring2MovDir = -1;
    }
    if (ring2Group.position.y <= lowerLimit) {
        ring2Group.position.y = lowerLimit;
        ring2MovDir = 1;
    }
    ring2Group.position.y += ring2MovDir * ascensionSpeed * deltaTime;
}

function keyThreeDown() { 
    if (ring3Group.position.y >= upperLimit) {
        ring3Group.position.y = upperLimit;
        ring3MovDir = -1;
    }
    if (ring3Group.position.y <= lowerLimit) {
        ring3Group.position.y = lowerLimit;
        ring3MovDir = 1;
    }
    ring3Group.position.y += ring3MovDir * ascensionSpeed * deltaTime;
}

function keyDDown() {
    // toggles global illumination
    directionalLight.visible = !directionalLight.visible;
    delete pressedKeys['D'];
}

function keyPDown() {
    // enables/disables mobius strip lights
    mobiusLightsGroup.visible = !mobiusLightsGroup.visible;
    delete pressedKeys['P'];
}

function keySDown() {
    // enables/disables spotlights for all objects
    spotlightsGroup.visible = !spotlightsGroup.visible;
    delete pressedKeys['S'];
}

function keyQDown() {
    // changes to MeshLambertMaterial
    var i = 0;
    for (let mesh of sceneItems.keys()) {
        if (i = 0) console.log(mesh.material);
        mesh.material = sceneItems.get(mesh).lambert;
        if (i = 0) console.log(mesh.material);
        i++;
    }
    delete pressedKeys['Q'];
}

function keyWDown() {
    // changes to MeshPhongMaterial
    for (let mesh of sceneItems.keys()) {
        console.log(mesh.material);
        mesh.material = sceneItems.get(mesh).phong;
        console.log(mesh.material);
    }
    console.log(sceneItems);
    delete pressedKeys['W'];
}

function keyEDown() {
    // changes to MeshToonMaterial
    for (let mesh of sceneItems.keys()) {
        console.log(mesh.material);
        mesh.material = sceneItems.get(mesh).toon;
        console.log(mesh.material);
    }
    delete pressedKeys['E'];
}

function keyRDown() {
    // changes to MeshNormalMaterial
    for (let mesh of sceneItems.keys()) {
        console.log(mesh.material);
        mesh.material = sceneItems.get(mesh).normal;
        console.log(mesh.material);
    }
    delete pressedKeys['R'];
}

/////////////
/* DISPLAY */
/////////////
function render() {
    'use strict';
    renderer.render(scene, defaultCamera);
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
    initializeArrays();
    createScene();
    createCamera();
    createLights();
    
    controls = new OrbitControls(defaultCamera, renderer.domElement);

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
        defaultCamera.aspect = window.innerWidth / window.innerHeight;
        defaultCamera.updateProjectionMatrix();
    }
}

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown(e) {
    const key = e.key.toUpperCase();
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
    delete pressedKeys[key];
}

init();
animate();
