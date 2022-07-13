import * as THREE from './build/three.module.js';
import Stats from './examples/jsm/libs/stats.module.js';
import { GLTFLoader } from './examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from './examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from './examples/jsm/environments/RoomEnvironment.js';
import { OutlineEffect } from './examples/jsm/effects/OutlineEffect.js';
import { DRACOLoader } from './examples/jsm/loaders/DRACOLoader.js';
import { GUI } from './examples/jsm/libs/lil-gui.module.min.js';
import { EffectComposer } from './examples/jsm/postprocessing/EffectComposer.js';
import { PixelShader } from './examples/jsm/shaders/PixelShader.js';
import { RenderPass } from './examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from './examples/jsm/postprocessing/ShaderPass.js';
import { LDrawLoader } from './examples/jsm/loaders/LDrawLoader.js';
import { LDrawUtils } from './examples/jsm/utils/LDrawUtils.js';
import { CSS3DRenderer, CSS3DObject } from './examples/jsm/renderers/CSS3DRenderer.js';
import { LuminosityShader } from './examples/jsm/shaders/LuminosityShader.js';
import { SobelOperatorShader } from './examples/jsm/shaders/SobelOperatorShader.js';
import { OutlinePass } from './examples/jsm/postprocessing/OutlinePass.js';
import { TextureLoader } from './src/loaders/TextureLoader.js';
import { LoadingManager } from './src/loaders/LoadingManager.js';
import { UnrealBloomPass } from './examples/jsm/postprocessing/UnrealBloomPass.js';
import { Octree } from './examples/jsm/math/Octree.js';
import { OctreeHelper } from './examples/jsm/helpers/OctreeHelper.js';
import { Capsule } from './examples/jsm/math/Capsule.js';
import { Reflector } from './examples/jsm/objects/Reflector.js';
import { SSRPass } from './examples/jsm/postprocessing/SSRPass.js';
import { GammaCorrectionShader } from './examples/jsm/shaders/GammaCorrectionShader.js';
import { ReflectorForSSRPass } from './examples/jsm/objects/ReflectorForSSRPass.js';
import { FXAAShader } from './examples/jsm/shaders/FXAAShader.js';
import { PointerLockControls } from './examples/jsm/controls/PointerLockControls.js';
import { FirstPersonControls } from './examples/jsm/controls/FirstPersonControls.js';
import { RectAreaLightHelper } from './examples/jsm/helpers/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from './examples/jsm/lights/RectAreaLightUniformsLib.js';
import { VideoTexture } from './src/textures/VideoTexture.js';
import { TrackballControls } from './examples/jsm/controls/TrackballControls.js';

//Loading Manager

const manager = new THREE.LoadingManager();
manager.onStart = function (url, itemsLoaded, itemsTotal) {

    console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');

};

const progressBarContainer = document.querySelector('.progress-bar-container');

manager.onLoad = function () {

    console.log('Loading complete!');
    progressBarContainer.style.display = 'none';
};


const progressBar = document.getElementById('progress-bar');


manager.onProgress = function (url, itemsLoaded, itemsTotal) {

    progressBar.value = (itemsLoaded / itemsTotal) * 100;
    console.log('Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');

};

manager.onError = function (url) {

    console.log('There was an error loading ' + url);

};

let effect, composer;
const clock = new THREE.Clock();

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x88ccee);
//scene.fog = new THREE.Fog(0x88ccee, 0, 50);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.rotation.order = 'YXZ';

const fillLight1 = new THREE.HemisphereLight(0x4488bb, 0x002244, 0.5);
fillLight1.position.set(2, 1, 1);
//scene.add(fillLight1);

const Amlight = new THREE.AmbientLight(0x404040, 2); // soft white light
scene.add(Amlight);

const bulbGeometry = new THREE.SphereGeometry(0.02, 16, 8);
const bulbLight = new THREE.PointLight(0xFFFDD0, 1, 100, 20);
const bulbMat = new THREE.MeshStandardMaterial({
    emissive: 0xffffee,
    emissiveIntensity: 1,
    color: 0x000000
});
bulbLight.add(new THREE.Mesh(bulbGeometry, bulbMat));
bulbLight.position.set(3, 5, -0.80);
bulbLight.castShadow = true;
bulbLight.power = 20;
bulbLight.distance = 100;
bulbLight.angle = Math.PI * 0.2;
bulbLight.shadow.camera.near = 0.1;
bulbLight.shadow.camera.far = 100;
bulbLight.shadow.mapSize.width = 1024;
bulbLight.shadow.mapSize.height = 1024;
scene.add(bulbLight); // Right

const bulbGeometry2 = new THREE.SphereGeometry(0.02, 16, 8);
const bulbLight2 = new THREE.PointLight(0x0000FF, 1, 100, 20);
const bulbMat2 = new THREE.MeshStandardMaterial({
    emissive: 0xffffee,
    emissiveIntensity: 1,
    color: 0x000000
});
bulbLight2.add(new THREE.Mesh(bulbGeometry2, bulbMat2));
bulbLight2.position.set(-5, 5, -5);
bulbLight2.castShadow = true;
bulbLight2.power = 100;
bulbLight2.distance = 100;
bulbLight2.angle = Math.PI * 0.2;
bulbLight2.shadow.camera.near = 0.1;
bulbLight2.shadow.camera.far = 100;
bulbLight2.shadow.mapSize.width = 1024;
bulbLight2.shadow.mapSize.height = 1024;
scene.add(bulbLight2); // Left

const bulbGeometry1 = new THREE.SphereGeometry(0.02, 16, 8);
const bulbLight1 = new THREE.PointLight(0xFF00FF, 1, 100, 20);
const bulbMat1 = new THREE.MeshStandardMaterial({
    emissive: 0xffffee,
    emissiveIntensity: 1,
    color: 0x000000
});
bulbLight1.add(new THREE.Mesh(bulbGeometry1, bulbMat1));
bulbLight1.position.set(0, 2, -10);
bulbLight1.castShadow = true;
bulbLight1.power = 40;
scene.add(bulbLight1); //Back




const container = document.getElementById('container');

const canvas = document.querySelector('.webgl');
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio * 1);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
//renderer.shadowMap.type = THREE.VSMShadowMap;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ReinhardToneMapping;
container.appendChild(renderer.domElement);

/* const stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';
container.appendChild(stats.domElement); */

const GRAVITY = 30;

const NUM_SPHERES = 100;
const SPHERE_RADIUS = 0.2;

const STEPS_PER_FRAME = 5;

const sphereGeometry = new THREE.IcosahedronGeometry(SPHERE_RADIUS, 5);
const sphereMaterial = new THREE.MeshLambertMaterial({ color: 0xbbbb44 });

const spheres = [];
let sphereIdx = 0;

for (let i = 0; i < NUM_SPHERES; i++) {

    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.castShadow = true;
    sphere.receiveShadow = true;

    scene.add(sphere);

    spheres.push({
        mesh: sphere,
        collider: new THREE.Sphere(new THREE.Vector3(0, - 100, 0), SPHERE_RADIUS),
        velocity: new THREE.Vector3()
    });

}

const worldOctree = new Octree();

const playerCollider = new Capsule(new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0, 1, 0), 0.35);

const playerVelocity = new THREE.Vector3();
const playerDirection = new THREE.Vector3();

let playerOnFloor = false;
let mouseTime = 0;

const keyStates = {};

const vector1 = new THREE.Vector3();
const vector2 = new THREE.Vector3();
const vector3 = new THREE.Vector3();

document.addEventListener('keydown', (event) => {

    keyStates[event.code] = true;

});

document.addEventListener('keyup', (event) => {

    keyStates[event.code] = false;

});

container.addEventListener('mousedown', () => {

    document.body.requestPointerLock();

    mouseTime = performance.now();

});

document.addEventListener('mouseup', () => {

    //  if (document.pointerLockElement !== null) throwBall();

});

document.body.addEventListener('mousemove', (event) => {

    if (document.pointerLockElement === document.body) {

        camera.rotation.y -= event.movementX / 500;
        camera.rotation.x -= event.movementY / 500;

    }

});

window.addEventListener('resize', onWindowResize);

function initComposer() {
    var renderPass, copyPass;
    //BLOOM
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0.3;
    bloomPass.strength = 0.5;
    bloomPass.radius = 0.1;
    renderer.toneMappingExposure = 0.8;

    const renderScene = new RenderPass(scene, camera);

    effect = new OutlineEffect(renderer, {
        defaultThickness: 0.005, defaultKeepAlive: false
    });


    composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    //composer.addPass(effectFXAA);





    //REFLECTION 100% COMPOSER
    /*   ssrPass = new SSRPass({
          renderer,
          scene,
          camera,
          width: innerWidth,
          height: innerHeight,
          groundReflector: params.groundReflector ? groundReflector : null,
          selects: params.groundReflector ? selects : null
      });
      groundReflector.distanceAttenuation = ssrPass.distanceAttenuation;
      ssrPass.maxDistance = .1;
      groundReflector.maxDistance = ssrPass.maxDistance;
      composer.addPass(ssrPass);
      composer.addPass(new ShaderPass(GammaCorrectionShader)); */
    //REFLECTION ENDED
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

}

function throwBall() {

    const sphere = spheres[sphereIdx];

    camera.getWorldDirection(playerDirection);

    sphere.collider.center.copy(playerCollider.end).addScaledVector(playerDirection, playerCollider.radius * 1.5);

    // throw the ball with more force if we hold the button longer, and if we move forward

    const impulse = 15 + 30 * (1 - Math.exp((mouseTime - performance.now()) * 0.001));

    sphere.velocity.copy(playerDirection).multiplyScalar(impulse);
    sphere.velocity.addScaledVector(playerVelocity, 2);

    sphereIdx = (sphereIdx + 1) % spheres.length;

}

function playerCollisions() {

    const result = worldOctree.capsuleIntersect(playerCollider);

    playerOnFloor = false;

    if (result) {

        playerOnFloor = result.normal.y > 0;

        if (!playerOnFloor) {

            playerVelocity.addScaledVector(result.normal, - result.normal.dot(playerVelocity));

        }

        playerCollider.translate(result.normal.multiplyScalar(result.depth));

    }

}

function updatePlayer(deltaTime) {

    let damping = Math.exp(- 4 * deltaTime) - 1;

    if (!playerOnFloor) {

        playerVelocity.y -= GRAVITY * deltaTime;

        // small air resistance
        damping *= 0.1;

    }

    playerVelocity.addScaledVector(playerVelocity, damping);

    const deltaPosition = playerVelocity.clone().multiplyScalar(deltaTime);
    playerCollider.translate(deltaPosition);

    playerCollisions();

    camera.position.copy(playerCollider.end);

}

function playerSphereCollision(sphere) {

    const center = vector1.addVectors(playerCollider.start, playerCollider.end).multiplyScalar(0.5);

    const sphere_center = sphere.collider.center;

    const r = playerCollider.radius + sphere.collider.radius;
    const r2 = r * r;

    // approximation: player = 3 spheres

    for (const point of [playerCollider.start, playerCollider.end, center]) {

        const d2 = point.distanceToSquared(sphere_center);

        if (d2 < r2) {

            const normal = vector1.subVectors(point, sphere_center).normalize();
            const v1 = vector2.copy(normal).multiplyScalar(normal.dot(playerVelocity));
            const v2 = vector3.copy(normal).multiplyScalar(normal.dot(sphere.velocity));

            playerVelocity.add(v2).sub(v1);
            sphere.velocity.add(v1).sub(v2);

            const d = (r - Math.sqrt(d2)) / 2;
            sphere_center.addScaledVector(normal, - d);

        }

    }

}

function spheresCollisions() {

    for (let i = 0, length = spheres.length; i < length; i++) {

        const s1 = spheres[i];

        for (let j = i + 1; j < length; j++) {

            const s2 = spheres[j];

            const d2 = s1.collider.center.distanceToSquared(s2.collider.center);
            const r = s1.collider.radius + s2.collider.radius;
            const r2 = r * r;

            if (d2 < r2) {

                const normal = vector1.subVectors(s1.collider.center, s2.collider.center).normalize();
                const v1 = vector2.copy(normal).multiplyScalar(normal.dot(s1.velocity));
                const v2 = vector3.copy(normal).multiplyScalar(normal.dot(s2.velocity));

                s1.velocity.add(v2).sub(v1);
                s2.velocity.add(v1).sub(v2);

                const d = (r - Math.sqrt(d2)) / 2;

                s1.collider.center.addScaledVector(normal, d);
                s2.collider.center.addScaledVector(normal, - d);

            }

        }

    }

}

function updateSpheres(deltaTime) {

    spheres.forEach(sphere => {

        sphere.collider.center.addScaledVector(sphere.velocity, deltaTime);

        const result = worldOctree.sphereIntersect(sphere.collider);

        if (result) {

            sphere.velocity.addScaledVector(result.normal, - result.normal.dot(sphere.velocity) * 1.5);
            sphere.collider.center.add(result.normal.multiplyScalar(result.depth));

        } else {

            sphere.velocity.y -= GRAVITY * deltaTime;

        }

        const damping = Math.exp(- 1.5 * deltaTime) - 1;
        sphere.velocity.addScaledVector(sphere.velocity, damping);

        playerSphereCollision(sphere);

    });

    spheresCollisions();

    for (const sphere of spheres) {

        sphere.mesh.position.copy(sphere.collider.center);

    }

}

function getForwardVector() {

    camera.getWorldDirection(playerDirection);
    playerDirection.y = 0;
    playerDirection.normalize();

    return playerDirection;

}

function getSideVector() {

    camera.getWorldDirection(playerDirection);
    playerDirection.y = 0;
    playerDirection.normalize();
    playerDirection.cross(camera.up);

    return playerDirection;

}

function controls(deltaTime) {

    // gives a bit of air control
    const speedDelta = deltaTime * (playerOnFloor ? 25 : 8);

    if (keyStates['KeyW']) {

        playerVelocity.add(getForwardVector().multiplyScalar(speedDelta));

    }

    if (keyStates['KeyS']) {

        playerVelocity.add(getForwardVector().multiplyScalar(- speedDelta));

    }

    if (keyStates['KeyA']) {

        playerVelocity.add(getSideVector().multiplyScalar(- speedDelta));

    }

    if (keyStates['KeyD']) {

        playerVelocity.add(getSideVector().multiplyScalar(speedDelta));

    }

    if (playerOnFloor) {

        if (keyStates['Space']) {

            playerVelocity.y = 7;

        }

    }

}



const loader = new GLTFLoader(manager);
loader.load('/asset/nftcenter.gltf', (gltf) => {

    scene.add(gltf.scene);

    worldOctree.fromGraphNode(gltf.scene);

    gltf.scene.traverse(child => {

        if (child.isMesh) {

            child.castShadow = true;
            child.receiveShadow = true;

            if (child.material.map) {

                child.material.map.anisotropy = 4;

            }

        }

    });
    gltf.scene.traverse((child) => {

        if (child.isMesh) {
            //  console.log(child);
            //CHANGE to PHONG
            const originalMaterial = child.material;
            const newMaterial = new THREE.MeshPhongMaterial();
            // these are missing and required
            child.geometry.computeVertexNormals();
            // use the texture from the original material
            newMaterial.map = originalMaterial.map;
            child.material = newMaterial;

        }
    })



    const helper = new OctreeHelper(worldOctree);
    helper.visible = false;
    scene.add(helper);

    /* const gui = new GUI({ width: 200 });
    gui.add({ debug: false }, 'debug')
        .onChange(function (value) {

            helper.visible = value;

        }); */

    animate();

});

function teleportPlayerIfOob() {

    if (camera.position.y <= - 25) {

        playerCollider.start.set(0, 0.35, 0);
        playerCollider.end.set(0, 1, 0);
        playerCollider.radius = 0.35;
        camera.position.copy(playerCollider.end);
        camera.rotation.set(0, 0, 0);

    }

}


function animate() {

    const deltaTime = Math.min(0.05, clock.getDelta()) / STEPS_PER_FRAME;

    // we look for collisions in substeps to mitigate the risk of
    // an object traversing another too quickly for detection.

    for (let i = 0; i < STEPS_PER_FRAME; i++) {

        controls(deltaTime);

        updatePlayer(deltaTime);

        updateSpheres(deltaTime);

        teleportPlayerIfOob();

    }

    initComposer();
    renderer.render(scene, camera);

    // stats.update();

    requestAnimationFrame(animate);

}