    import * as THREE from 'three';
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
    import { VRButton } from 'three/addons/webxr/VRButton.js';
    import * as Stats from 'three/addons/libs/stats.module.js';
    import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

    //////////////////////
    /* GLOBAL VARIABLES */
    //////////////////////
    var renderer, scene, camera;
    var wireframe = false, items = [];
    var camera1, camera2, camera3, camera4, camera5, camera6;

    /////////////////////
    /* CREATE SCENE(S) */
    /////////////////////
    function createScene() {
        'use strict';
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x87ceeb);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          scene.add(new THREE.AxesHelper(10));
        createBase();

        createGroundPlane();
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

        setCamera(camera1, 0, 30, -50, 0, 30, 0);
        setCamera(camera2, 50, 30, 0, 0, 30, 0);
        setCamera(camera3, 0, 70, 0, 0, 0, 0); // Positioned above the scene looking down
        camera3.rotateZ(-Math.PI/2);
        setCamera(camera4, 50, 45, -20, 0, 35, -5);
        setCamera(camera5, 50, 45, -20, 0, 35, -5);

        camera = camera4; // set default camera
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

    /* 
    * Creates the central cylinder and three concentric rings
    */
    function createBase() {
        'use strict';
        createMainCylinder();

        // Crie os três anéis concêntricos
        const ringRadius = 5;
        const ringHeight = 1;
        const ringGeometry = new THREE.RingGeometry(ringRadius, ringRadius + 0.5, 32);
        const ringMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000, side: THREE.DoubleSide });
        const rings = [];
        for (let i = 0; i < 3; i++) {
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.position.setY(5 + i * ringHeight); // Ajuste a altura dos anéis
            scene.add(ring);
            rings.push(ring);
        }
    }

    class CustomStraightCurve extends THREE.Curve {
        constructor() {
            super();
        }

        getPoint(t, optionalTarget = new THREE.Vector3()) {
            // Define the straight path along the y-axis
            const tx = 0;
            const ty = t * 10; // Adjust the length of the tube by modifying this value
            const tz = 0;

            return optionalTarget.set(tx, ty, tz);
        }
    }

    function createMainCylinder() {
        'use strict';
        const mainRadius = 2;
        const mainHeight = 10;
        const mainRadialSegments = 32;
        const mainTubeSegments = 32;
        const path = new CustomStraightCurve();
        const mainGeometry = new THREE.TubeGeometry(path, mainRadialSegments, mainRadius, mainTubeSegments, false);
        const mainMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        const mainCylinder = new THREE.Mesh(mainGeometry, mainMaterial);
        scene.add(mainCylinder);
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



    //////////////////////
    /* CHECK COLLISIONS */
    //////////////////////



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

    }

    ///////////////////////
    /* KEY UP CALLBACK */
    ///////////////////////
    function onKeyUp(e) {

    }

    init();
    animate();
