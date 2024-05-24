import * as THREE from 'three';
import { VRButton } from 'three/addons/webxr/VRButton.js';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';

//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
let renderer, scene, defaultCamera, stereoCamera;
let isRing1Moving = true, isRing2Moving = true, isRing3Moving = true;
let wireframe = false;
let sceneItems = new Map();
let camera1;
let main_cylinder;
let ring1Group, ring2Group, ring3Group;
let ring1MovDir = 1, ring2MovDir = 1, ring3MovDir = 1;
let rings = [];
const ringThickness = 25, ringHeight = 15;
const lowerLimit = 0, upperLimit = 100-ringHeight, ascensionSpeed = 40;
var surfaces = [], spotlights = [];
var clock = new THREE.Clock(), deltaTime;
const cylinderHeight = 100, cylinderRadius = 20, rotationSpeed = 128, cylinderRotSpeed = 5;
var pressedKeys = {};
var directionalLight, ambientLight;
var mobiusLightsGroup;
var geometries;

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
    'R': keyRDown,
    'T': keyTDown
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
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCamera() {
    'use strict';
    const widthRatio = window.innerWidth / 24;
    const heightRatio = window.innerHeight / 24;
    const aspectRatio = widthRatio / heightRatio;
    camera1 = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 10000);
    stereoCamera = new THREE.StereoCamera();
    setCamera(camera1, -150, 150, -150, 0, 0, 0);
    defaultCamera = camera1 // set default camera
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
    directionalLight.position.set(200, 200, 200);
    scene.add(directionalLight);
}

function createObjectLight(object, group) {
    const light = new THREE.SpotLight(0xffffff, 100, 100, Math.PI/4);
    light.position.set(object.position.x, ringHeight, object.position.z);
    light.target = object;
    object.add(light);
    spotlights.push(light);
    group.add(light);
}

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

function createMobiusMesh(geometry, color) {
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
    const lambertMaterial = new THREE.MeshLambertMaterial({ color: 0x4169E1, side: THREE.DoubleSide});
    const toonMaterial = new THREE.MeshToonMaterial({ color: 0x4169E1, side: THREE.DoubleSide});
    const normalMaterial = new THREE.MeshNormalMaterial({ 
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide});
    const basicMaterial = new THREE.MeshBasicMaterial({ color: 0x4169E1, side: THREE.DoubleSide});
    var mesh = new THREE.Mesh(geometry, material);
    sceneItems.set(mesh, {phong: material, lambert: lambertMaterial, toon: toonMaterial, normal: normalMaterial,
        basic: basicMaterial});
    return mesh;
}

function createMesh(geometry, color) {
    const phongMaterial = new THREE.MeshPhongMaterial({ color: color, wireframe: wireframe });
    const lambertMaterial = new THREE.MeshLambertMaterial({ color: color, wireframe: wireframe });
    const toonMaterial = new THREE.MeshToonMaterial({ color: color, wireframe: wireframe });
    const normalMaterial = new THREE.MeshNormalMaterial({ wireframe: wireframe });
    const basicMaterial = new THREE.MeshBasicMaterial({ color: color, wireframe: wireframe });
    var mesh = new THREE.Mesh(geometry, phongMaterial);
    sceneItems.set(mesh, {phong: phongMaterial, lambert: lambertMaterial, toon: toonMaterial, normal: normalMaterial,
        basic: basicMaterial});
    return mesh;
}

function createParamSurfaceMesh(geometry) {
    var phongMaterial = new THREE.MeshLambertMaterial( { color: 0x00ff00, side: THREE.DoubleSide});
    var lambertMaterial = new THREE.MeshLambertMaterial( { color: 0x00ff00, side: THREE.DoubleSide});
    var toonMaterial = new THREE.MeshToonMaterial( { color: 0x00ff00, side: THREE.DoubleSide});
    var normalMaterial = new THREE.MeshNormalMaterial( { side: THREE.DoubleSide});
    var basicMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00, side: THREE.DoubleSide});
    var mesh = new THREE.Mesh(geometry, toonMaterial);
    sceneItems.set(mesh, {phong: phongMaterial, lambert: lambertMaterial, toon: toonMaterial, normal: normalMaterial,
        basic: basicMaterial});
    return mesh;
}


function createCylinderObject(x, y, z, radiusTop, radiusBottom, height, color) {
    'use strict';
    var geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 128);
    var mesh = createMesh(geometry, color);
    mesh.position.set(x, y, z);
    return mesh;
}


/////////////////////////////////////////////////////////////////////////////////
//                 AUXILIAR FUNCTIONS FOR PARAMETRIC SURFACES                  //
/////////////////////////////////////////////////////////////////////////////////

function cilindroSemBases(u, t, target) { // 1
    const rho = 2.5;
    const height = 5;
    const phi = u * 2 * Math.PI;

    const x = rho * Math.cos(phi);
    const z = rho * Math.sin(phi);
    const y = t * height - height/2;

    target.set(x,y,z);
}

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

    const x = size * (u-0.5);
    const z = size * (t-0.5);
    const y = (height * (1-2.2*(u-0.5)) * (0.7-(t-0.5)));

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

////////////////////////////////////////////////////////////////////////////////
//                        PARAMETRIC SURFACES CREATION                        //
////////////////////////////////////////////////////////////////////////////////



function createObjects(radius, ringGroup) {
    geometries = [cilindroSemBases, cilindroSemBasesNaoCircular, cilindroSemBaseTorto, 
        cone, MeioConeMeioCilindro, coneTorto, planoTorto, hiperboloide];
    let positions = Array.from(Array(8).keys());
    const n_objects = 8;
    const angle = 2 * Math.PI / n_objects;
    for (let i = 0; i < n_objects; i++) {
        const geometry = new ParametricGeometry(geometries[i], 100, 100);
        const object = createParamSurfaceMesh(geometry);

        const pos_index = Math.floor(Math.random() * positions.length);
        const pos = positions.splice(pos_index, 1).at(0);

        object.position.set(
            (radius + ringThickness/2) * Math.sin(angle * pos),
            ringHeight + 10,
            (radius + ringThickness/2) * Math.cos(angle * pos)
        );

        object.scale.multiplyScalar(Math.random() + 1); // scale randomly

        const randomAxis = new THREE.Vector3(Math.random(), Math.random(), Math.random());
        randomAxis.normalize();

        const randomAngle = Math.random() * Math.PI;

        object.rotateOnAxis(randomAxis, randomAngle);

        geometry.computeBoundingBox();
        const boundingBox = geometry.boundingBox;

        const centroid = new THREE.Vector3();
        centroid.addVectors(boundingBox.min, boundingBox.max).multiplyScalar(0.5);

        geometry.translate(-centroid.x, -centroid.y, -centroid.z);

        ringGroup.add(object);
        surfaces.push(object);
        createObjectLight(object, ringGroup);
    }
}

////////////////////////////////////////////////////////////////////////
/*                   CREATE MOBIUS STRIP AND LIGHTS                   */
////////////////////////////////////////////////////////////////////////

function createMobiusStrip() {
    const mobius_group = new THREE.Group();
    const mobiusGeometry = new THREE.BufferGeometry();
    const vertices = [2.38, 0, 0, 2.35, 0, 0.38, 2.29, 0, 0.62, 2.21, 0, 0.62, 2.15, 0, 0.38, 2.13, 0, 0, 2.15, 0, -0.38, 2.21, 0, -0.62, 2.29, 0, -0.62, 2.35, 0, -0.38, 2.38, 0, 0, 1.92, 1.39, 0.04, 1.8, 1.31, 0.39, 1.7, 1.23, 0.6, 1.64, 1.19, 0.58, 1.65, 1.2, 0.33, 1.72, 1.25, -0.04, 1.84, 1.34, -0.39, 1.95, 1.41, -0.6, 2, 1.46, -0.58, 1.99, 1.45, -0.33, 1.92, 1.39, 0.04, 0.73, 2.24, 0.07, 0.65, 2, 0.37, 0.59, 1.82, 0.52, 0.57, 1.76, 0.48, 0.6, 1.85, 0.25, 0.66, 2.04, -0.07, 0.74, 2.28, -0.37, 0.8, 2.46, -0.52, 0.82, 2.52, -0.48, 0.79, 2.43, -0.25, 0.73, 2.24, 0.07, -0.72, 2.21, 0.1, -0.62, 1.9, 0.31, -0.55, 1.69, 0.39, -0.53, 1.64, 0.33, -0.58, 1.79, 0.14, -0.67, 2.07, -0.1, -0.77, 2.38, -0.31, -0.84, 2.59, -0.39, -0.86, 2.64, -0.33, -0.81, 2.49, -0.14, -0.72, 2.21, 0.1, -1.85, 1.35, 0.12, -1.55, 1.13, 0.21, -1.35, 0.98, 0.23, -1.33, 0.97, 0.15, -1.5, 1.09, 0.02, -1.79, 1.3, -0.12, -2.09, 1.52, -0.21, -2.29, 1.66, -0.23, -2.31, 1.68, -0.15, -2.14, 1.55, -0.02, -1.85, 1.35, 0.12, -2.25, 0, 0.13, -1.87, 0, 0.1, -1.63, 0, 0.04, -1.63, 0, -0.04, -1.87, 0, -0.1, -2.25, 0, -0.12, -2.63, 0, -0.1, -2.87, 0, -0.04, -2.87, 0, 0.04, -2.63, 0, 0.1, -2.25, 0, 0.13, -1.79, -1.3, 0.12, -1.5, -1.09, -0.02, -1.33, -0.97, -0.15, -1.35, -0.98, -0.23, -1.55, -1.13, -0.21, -1.85, -1.35, -0.12, -2.14, -1.55, 0.02, -2.31, -1.68, 0.15, -2.29, -1.66, 0.23, -2.09, -1.52, 0.21, -1.79, -1.3, 0.12, -0.67, -2.07, 0.1, -0.58, -1.79, -0.14, -0.53, -1.64, -0.33, -0.55, -1.69, -0.39, -0.62, -1.9, -0.31, -0.72, -2.21, -0.1, -0.81, -2.49, 0.14, -0.86, -2.64, 0.33, -0.84, -2.59, 0.39, -0.77, -2.38, 0.31, -0.67, -2.07, 0.1, 0.66, -2.04, 0.07, 0.6, -1.85, -0.25, 0.57, -1.76, -0.48, 0.59, -1.82, -0.52, 0.65, -2, -0.37, 0.73, -2.24, -0.07, 0.79, -2.43, 0.25, 0.82, -2.52, 0.48, 0.8, -2.46, 0.52, 0.74, -2.28, 0.37, 0.66, -2.04, 0.07, 1.72, -1.25, 0.04, 1.65, -1.2, -0.33, 1.64, -1.19, -0.58, 1.7, -1.23, -0.6, 1.8, -1.31, -0.39, 1.92, -1.39, -0.04, 1.99, -1.45, 0.33, 2, -1.46, 0.58, 1.95, -1.41, 0.6, 1.84, -1.34, 0.39, 1.72, -1.25, 0.04, 2.13, 0, 0, 2.15, 0, -0.38, 2.21, 0, -0.62, 2.29, 0, -0.62, 2.35, 0, -0.38, 2.38, 0, 0, 2.35, 0, 0.38, 2.29, 0, 0.62, 2.21, 0, 0.62, 2.15, 0, 0.38, 2.13, 0, 0];
    const indices = [0, 1, 11, 1, 12, 11, 1, 2, 12, 2, 13, 12, 2, 3, 13, 3, 14, 13, 3, 4, 14, 4, 15, 14, 4, 5, 15, 5, 16, 15, 5, 6, 16, 6, 17, 16, 6, 7, 17, 7, 18, 17, 7, 8, 18, 8, 19, 18, 8, 9, 19, 9, 20, 19, 9, 10, 20, 10, 21, 20, 11, 12, 22, 12, 23, 22, 12, 13, 23, 13, 24, 23, 13, 14, 24, 14, 25, 24, 14, 15, 25, 15, 26, 25, 15, 16, 26, 16, 27, 26, 16, 17, 27, 17, 28, 27, 17, 18, 28, 18, 29, 28, 18, 19, 29, 19, 30, 29, 19, 20, 30, 20, 31, 30, 20, 21, 31, 21, 32, 31, 22, 23, 33, 23, 34, 33, 23, 24, 34, 24, 35, 34, 24, 25, 35, 25, 36, 35, 25, 26, 36, 26, 37, 36, 26, 27, 37, 27, 38, 37, 27, 28, 38, 28, 39, 38, 28, 29, 39, 29, 40, 39, 29, 30, 40, 30, 41, 40, 30, 31, 41, 31, 42, 41, 31, 32, 42, 32, 43, 42, 33, 34, 44, 34, 45, 44, 34, 35, 45, 35, 46, 45, 35, 36, 46, 36, 47, 46, 36, 37, 47, 37, 48, 47, 37, 38, 48, 38, 49, 48, 38, 39, 49, 39, 50, 49, 39, 40, 50, 40, 51, 50, 40, 41, 51, 41, 52, 51, 41, 42, 52, 42, 53, 52, 42, 43, 53, 43, 54, 53, 44, 45, 55, 45, 56, 55, 45, 46, 56, 46, 57, 56, 46, 47, 57, 47, 58, 57, 47, 48, 58, 48, 59, 58, 48, 49, 59, 49, 60, 59, 49, 50, 60, 50, 61, 60, 50, 51, 61, 51, 62, 61, 51, 52, 62, 52, 63, 62, 52, 53, 63, 53, 64, 63, 53, 54, 64, 54, 65, 64, 55, 56, 66, 56, 67, 66, 56, 57, 67, 57, 68, 67, 57, 58, 68, 58, 69, 68, 58, 59, 69, 59, 70, 69, 59, 60, 70, 60, 71, 70, 60, 61, 71, 61, 72, 71, 61, 62, 72, 62, 73, 72, 62, 63, 73, 63, 74, 73, 63, 64, 74, 64, 75, 74, 64, 65, 75, 65, 76, 75, 66, 67, 77, 67, 78, 77, 67, 68, 78, 68, 79, 78, 68, 69, 79, 69, 80, 79, 69, 70, 80, 70, 81, 80, 70, 71, 81, 71, 82, 81, 71, 72, 82, 72, 83, 82, 72, 73, 83, 73, 84, 83, 73, 74, 84, 74, 85, 84, 74, 75, 85, 75, 86, 85, 75, 76, 86, 76, 87, 86, 77, 78, 88, 78, 89, 88, 78, 79, 89, 79, 90, 89, 79, 80, 90, 80, 91, 90, 80, 81, 91, 81, 92, 91, 81, 82, 92, 82, 93, 92, 82, 83, 93, 83, 94, 93, 83, 84, 94, 84, 95, 94, 84, 85, 95, 85, 96, 95, 85, 86, 96, 86, 97, 96, 86, 87, 97, 87, 98, 97, 88, 89, 99, 89, 100, 99, 89, 90, 100, 90, 101, 100, 90, 91, 101, 91, 102, 101, 91, 92, 102, 92, 103, 102, 92, 93, 103, 93, 104, 103, 93, 94, 104, 94, 105, 104, 94, 95, 105, 95, 106, 105, 95, 96, 106, 96, 107, 106, 96, 97, 107, 97, 108, 107, 97, 98, 108, 98, 109, 108, 99, 100, 110, 100, 111, 110, 100, 101, 111, 101, 112, 111, 101, 102, 112, 102, 113, 112, 102, 103, 113, 103, 114, 113, 103, 104, 114, 104, 115, 114, 104, 105, 115, 105, 116, 115, 105, 106, 116, 106, 117, 116, 106, 107, 117, 107, 118, 117, 107, 108, 118, 108, 119, 118, 108, 109, 119, 109, 120, 119];

    mobiusGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    mobiusGeometry.setIndex(indices);
    mobiusGeometry.computeVertexNormals();

    const mobius = createMobiusMesh(mobiusGeometry, 0x4169E1);
    mobius.scale.multiplyScalar(25);
    mobius.rotateX(Math.PI/2);

    createMobiusLights();
    mobius_group.add(mobius);
    mobius_group.add(mobiusLightsGroup);
    mobius_group.position.set(0,cylinderHeight + 30,0);
    scene.add(mobius_group);
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
    createMainCylinder();
    createRings();
    scene.add(ring1Group);
    scene.add(ring2Group);
    scene.add(ring3Group);
}


function createMainCylinder() {
    'use strict';
    const color = 0x8a2be2;
    main_cylinder = createCylinderObject(0, cylinderHeight/2, 0, cylinderRadius, cylinderRadius, cylinderHeight, color);
    scene.add(main_cylinder);
}


function createRing(outerRadius, innerRadius, height, color) {
    const ringShape = new THREE.Shape();
    ringShape.moveTo(outerRadius, 0);
    ringShape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);
    ringShape.holes.push(new THREE.Path().absarc(0, 0, innerRadius, 0, Math.PI * 2, true));

    const extrudeSettings = {
        steps: 1,
        curveSegments: 64,
        depth: height,
        bevelEnabled: false
    };

    const ring = createMesh(new THREE.ExtrudeGeometry(ringShape, extrudeSettings), color);
    ring.rotation.x = Math.PI / 2; // rotates into correct position
    return ring;
}

function createRings() {
    const numRings = 3;
    const ringColors = [0xff6347, 0x4682b4, 0x32cd32];
    var ringInnerRadius = cylinderRadius;
    var ringOuterRadius = ringInnerRadius + ringThickness;

    var ringGroups = [ring1Group, ring2Group, ring3Group];
    
    for (let i = 0; i < numRings; i++) {
        const ringColor = ringColors[i];
        const ring = createRing(ringOuterRadius, ringInnerRadius, ringHeight, ringColor);
        const randY = Math.random() * (upperLimit - lowerLimit) + lowerLimit;
        ring.position.set(0, ringHeight, 0);
        rings.push(ring);
        createObjects(ringInnerRadius, ringGroups[i]);
        ringGroups[i].add(ring);
        ringGroups[i].position.y = randY;
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
    for (const key in pressedKeys) {
        keyActions[key]();
    }
    rotateObjects();
    moveRings();
}

function rotateObjects () {
    surfaces.forEach(surface => { 
        surface.rotateX(Math.PI/rotationSpeed) * deltaTime;
    });
    main_cylinder.rotateY(Math.PI/cylinderRotSpeed) * deltaTime;
    mobiusLightsGroup.rotation.y += 10 * 2*Math.PI/rotationSpeed * deltaTime;
}


function moveRing(ringGroup, ringMovDir) {
    if (ringGroup.position.y >= upperLimit) {
        ringGroup.position.y = upperLimit;
        ringMovDir = -1;
    }
    if (ringGroup.position.y <= lowerLimit && ringMovDir == -1) {
        ringGroup.position.y = lowerLimit;
        ringMovDir = 1;
    }
    ringGroup.position.y += ringMovDir * ascensionSpeed * deltaTime;
    return ringMovDir;
} 


function moveRings() {
    if (isRing1Moving) ring1MovDir = moveRing(ring1Group, ring1MovDir);
    if (isRing2Moving) ring2MovDir = moveRing(ring2Group, ring2MovDir);
    if (isRing3Moving) ring3MovDir = moveRing(ring3Group, ring3MovDir);
}

function keyOneDown() { 
    isRing1Moving = !isRing1Moving;
    delete pressedKeys['1'];
}

function keyTwoDown() { 
    isRing2Moving = !isRing2Moving;
    delete pressedKeys['2'];
}

function keyThreeDown() { 
    isRing3Moving = !isRing3Moving;
    delete pressedKeys['3'];
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
    // iterate through all surfaces and disable their associated lights
    for (let light of spotlights) {
        light.visible = !light.visible;
    }
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
        mesh.material = sceneItems.get(mesh).phong;
    }
    console.log(sceneItems);
    delete pressedKeys['W'];
}

function keyEDown() {
    // changes to MeshToonMaterial
    for (let mesh of sceneItems.keys()) {
        mesh.material = sceneItems.get(mesh).toon;
    }
    delete pressedKeys['E'];
}

function keyRDown() {
    // changes to MeshNormalMaterial
    for (let mesh of sceneItems.keys()) {
        mesh.material = sceneItems.get(mesh).normal;
    }
    delete pressedKeys['R'];
}

function keyTDown() {
    // changes to MeshBasicMaterial
    for (let mesh of sceneItems.keys()) {
        mesh.material = sceneItems.get(mesh).basic;
    }
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
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.xr.enabled = true;
    document.body.appendChild(renderer.domElement);
    document.body.appendChild(VRButton.createButton(renderer));
    createScene();
    createCamera();
    createLights();

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
    renderer.setAnimationLoop(animate);
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
