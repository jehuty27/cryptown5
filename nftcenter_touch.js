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
import TouchControls from './examples/jsm/controls/TouchControls.js';

//Mobile Joystick
let controls;
var deltaTime;
let mesh, intersected;


// reflection
const params = {
    exposure: 2,
    bloomStrength: 1.5,
    bloomThreshold: 0,
    bloomRadius: 0,
    enableSSR: true,
    autoRotate: true,
    otherMeshes: true,
    groundReflector: true,
};
let groundReflector;
var height = 480,
    width = 640;
var clearColor = '#ffffff';
const selects = [];
let groundMirror;
let ssrPass;


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

const Amlight = new THREE.AmbientLight(0x404040, 0.8); // soft white light
scene.add(Amlight);

const bulbGeometry = new THREE.SphereGeometry(0.02, 16, 8);
const bulbLight = new THREE.PointLight(0x7400F6, 1, 100, 20);
const bulbMat = new THREE.MeshStandardMaterial({
    emissive: 0xffffee,
    emissiveIntensity: 1,
    color: 0x000000
});
bulbLight.add(new THREE.Mesh(bulbGeometry, bulbMat));
bulbLight.position.set(3, 5, -0.80);
bulbLight.castShadow = true;
bulbLight.power = 10;
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
const bulbLight1 = new THREE.PointLight(0x00FFFF, 1, 100, 20);
const bulbMat1 = new THREE.MeshStandardMaterial({
    emissive: 0xffffee,
    emissiveIntensity: 1,
    color: 0x000000
});
bulbLight1.add(new THREE.Mesh());
bulbLight1.position.set(0, 3, -12);
bulbLight1.castShadow = true;
bulbLight1.power = 5;
scene.add(bulbLight1); //Museum

const bulbGeometry3 = new THREE.SphereGeometry(1, 16, 8);
const bulbLight3 = new THREE.PointLight(0x0000ff, 1, 100, 1);
const bulbMat3 = new THREE.MeshStandardMaterial({
    emissive: 0xffffee,
    emissiveIntensity: 1,
    color: 0x000000
});
// bulbLight3.add(new THREE.Mesh(bulbGeometry2, bulbMat2));wa
bulbLight3.position.set(0.3, 3, -15);
//bulbLight3.castShadow = true;
// bulbLight3.shadowMapHeight = 1600;
//bulbLight3.shadowMapWidth = 1600;
bulbLight3.power = 10;
//scene.add(bulbLight3); //OVER BRIDGE




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
//stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '10px'
stats.domElement.style.left = ''
stats.domElement.style.right = '10px'
stats.domElement.style.top = '0px';
container.appendChild(stats.domElement); */

window.addEventListener('resize', onWindowResize);

function initComposer() {

    //REFLECTION
    const options = {
        width: window.innerWidth,
        height: window.innerHeight,
        useBlur: true,
        //blurKernelSize: POSTPROCESSING.KernelSize.SMALL,
        blurWidth: window.innerWidth,
        blurHeight: window.innerHeight,
        rayStep: 0.1,
        intensity: 1,
        power: 1,
        depthBlur: 0.1,
        enableJittering: false,
        jitter: 0.1,
        jitterSpread: 0.1,
        jitterRough: 0.1,
        roughnessFadeOut: 1,
        MAX_STEPS: 20,
        NUM_BINARY_SEARCH_STEPS: 5,
        maxDepthDifference: 3,
        maxDepth: 1,
        thickness: 10,
        ior: 1.45,
        stretchMissedRays: false,
        useMRT: true,
        useNormalMap: true,
        useRoughnessMap: true
    }
    composer = new EffectComposer(renderer);
    var renderPass, copyPass;
    //BLOOM
    /*   const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
      bloomPass.threshold = 0.3;
      bloomPass.strength = 0.5;
      bloomPass.radius = 0.1;
      renderer.toneMappingExposure = 0.8;
  
      const renderScene = new RenderPass(scene, camera); */

    effect = new OutlineEffect(renderer, {
        defaultThickness: 0.005, defaultKeepAlive: false
    });
    // const ssrPass = new SSRPass(scene, camera, options);
    //composer.addPass(ssrPass)



    // composer.addPass(renderScene);
    // composer.addPass(bloomPass);
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

function addControls() {
    // Controls
    let options = {
        delta: 0.75,           // coefficient of movement
        moveSpeed: 0.02,        // speed of movement
        rotationSpeed: 0.005,  // coefficient of rotation
        maxPitch: 30,          // max camera pitch angle
        // hitTest: false,         // stop on hitting objects
        hitTestDistance: 0.5   // distance to test for hit
    }
    controls = new TouchControls(container.parentNode, camera, options)
    controls.setPosition(-0.5, 2, -1.4);
    controls.addToScene(scene);
    // control.setRotation(0.15, -0.15)
}

// GLTF LOADER
const loader = new GLTFLoader(manager);
loader.load('/asset/nftcenter_v1.gltf', (gltf) => {

    scene.add(gltf.scene);

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

    mesh = gltf.scene;


    /* const gui = new GUI({ width: 200 });
    gui.add({ debug: false }, 'debug')
        .onChange(function (value) {

            helper.visible = value;

        }); */
    addControls();
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

    // deltaTime = Math.min(0.05, clock.getDelta()) / STEPS_PER_FRAME;
    // we look for collisions in substeps to mitigate the risk of
    // an object traversing another too quickly for detection.

    /* for (let i = 0; i < STEPS_PER_FRAME; i++) {

        // controls(deltaTime); //QWERTY
        controls.update(deltaTime); //Touch

        updatePlayer(deltaTime);



        teleportPlayerIfOob();

    } */

    // Mouse hit-testing:
    let vector = new THREE.Vector3(controls.mouse.x, controls.mouse.y, 1)
    vector.unproject(camera)

    //RAYCASTER WORKING
    /*  let raycaster = new THREE.Raycaster(controls.fpsBody.position, vector.sub(controls.fpsBody.position).normalize())
     let intersects = raycaster.intersectObjects(mesh.children)
     if (intersects.length > 0) {
         // console.log(intersects)
         if (intersected != intersects[0].object) {
             if (intersected) intersected.material.emissive.setHex(intersected.currentHex)
             intersected = intersects[0].object
             if (intersected.name != 'Base_Plane') {
                 intersected.currentHex = intersected.material.emissive.getHex()
                 intersected.material.emissive.setHex(0xdd0090)
             }
         }
     } else {
         if (intersected) intersected.material.emissive.setHex(intersected.currentHex)
         intersected = null
     }
  */
    initComposer();

    requestAnimationFrame(animate);
    controls.update();

    renderer.render(scene, camera);

    //stats.update();

}