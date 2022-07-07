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


var composer;
let effect, pixelPass, textureLoader;
let gui, guiData;
let particleLight;
let ballMat, floorMat;
let selectedObjects = [];
let bulbLight5, bulbMat5, hemiLight;
var camera, renderer, composer, mixer, loader, clock;
let scene, scene2, mesh, outlinePass, dracoLoader;


let groundReflector;
var height = 480,
    width = 640;
var clearColor = '#ffffff';
const selects = [];
let groundMirror;
let ssrPass;
let frustumSize = 1.5;
let controls, container;
var stats;
let videoTexture;
let ads1, ads2;
var raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
var mouse = new THREE.Vector2();
var projector, objects = [];
var selectedPiece = null;
//var Cloud, Sky;
//FPS
//let raycaster;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;

let prevTime = performance.now();
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const vertex = new THREE.Vector3();
const color = new THREE.Color();

//FPS DONE


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

container = document.getElementById('container');




load();

function load() {
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


    //Create Material
    /* const citytexture = new THREE.TextureLoader().load("./asset/Sweep2Surface_Color.jpg");
    citytexture.flipY = false;
    citytexture.encoding = THREE.sRGBEncoding;

    const citymaterial = new THREE.MeshBasicMaterial({ map: citytexture });
    const outlineMaterial = new THREE.MeshBasicMaterial({ color: "black" });
 */


    loader = new GLTFLoader(manager);
    clock = new THREE.Clock();
    scene = new THREE.Scene();
    scene2 = new THREE.Scene();
    dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('./examples/js/libs/draco/gltf/');
    loader.setDRACOLoader(dracoLoader);
    loader.load('/asset/CryptoCity35b.gltf', function (gltf) {
        mesh = gltf.scene;
        //mesh.position.y = - 0.3;
        mesh.scale.set(0.1, 0.1, 0.1);

        mesh.traverse((child) => {
            console.log(child);
            //child.material = citymaterial;
        })


        gltf.scene.traverse((child) => {

            if (child.isMesh) {
                //  console.log(child);
                child.receiveShadow = true;
                child.castShadow = true;

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

        mixer = new THREE.AnimationMixer(mesh);
        mixer.clipAction(gltf.animations[0]).play();

        scene.add(gltf.scene);

        var floorgeometry = new THREE.PlaneGeometry(2.5, 2.5, 1, 1);
        var floormaterial = new THREE.MeshPhongMaterial({
            color: 0x0C090A,
            wireframe: false
        });

        //STATS
        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';
        container.appendChild(stats.domElement);

        // scene.add(floor);
        // scene.fog = new THREE.Fog(0x88ccee, 5.5, 10);

        //REFLECTION START 100% working
        /* const geometry = new THREE.PlaneGeometry(4, 4);
        groundReflector = new ReflectorForSSRPass(geometry, {
            clipBias: 0.0003,
            textureWidth: window.innerWidth,
            textureHeight: window.innerHeight,
            color: 0x888888,
            useDepthTexture: true,
        });
        groundReflector.material.depthWrite = false;
        groundReflector.rotation.x = - Math.PI / 2;
        groundReflector.visible = false;
        scene2.add(groundReflector); */
        //REFLECTION END

        init();
        animate();
    });

}

function init() {

    initWebsite();
    initCamera();
    initScene();
    initRenderer();
    music();
    // inityoutube(); //MUST USE CSS3D Renderer
    //initFps();
    initControl();
    initComposer();

}

function initCamera() {
    //  camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 1, 1000);

    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.OrthographicCamera(frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 1000);
    camera.position.set(-2, 2, 5);

    scene.add(camera);
}

function music() {
    // instantiate a listener
    const audioListener = new THREE.AudioListener();

    // add the listener to the camera
    camera.add(audioListener);

    // instantiate audio object
    const oceanAmbientSound = new THREE.Audio(audioListener);

    // add the audio object to the scene
    scene.add(oceanAmbientSound);

    // instantiate a loader
    const loader = new THREE.AudioLoader();

    // load a resource
    loader.load('/asset/city.mp3',

        // onLoad callback
        function (audioBuffer) {
            // set the audio object buffer to the loaded object
            oceanAmbientSound.setBuffer(audioBuffer);

            // play the audio
            oceanAmbientSound.play();
        },
    )
}

function inityoutube(id, x, y, z, ry) {
    const div = document.createElement('div');
    div.style.width = '480px';
    div.style.height = '360px';
    div.style.backgroundColor = '#000';

    const iframe = document.createElement('iframe');
    iframe.style.width = '480px';
    iframe.style.height = '360px';
    iframe.style.border = '0px';
    iframe.src = ['https://www.youtube.com/embed/', id, '?rel=0'].join('');
    div.appendChild(iframe);

    const object = new CSS3DObject(div);
    object.position.set(x, y, z);
    object.rotation.y = ry;

    return object;

}

function initWebsite() {
    const textureVid = document.getElementById("video");
    textureVid.src = '/asset/mhcToys.mp4';
    textureVid.play();

    videoTexture = new VideoTexture(textureVid);
    videoTexture.needsUpdate;
    //videoTexture.encoding = sRGBEncoding;
    const plane = new THREE.PlaneGeometry(0.48, 0.55, 1, 1);
    ads1 = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({
        opacity: 1,
        map: videoTexture,
    }));

    ads1.position.set(-0.07, 0.6, -1.135);
    ads1.rotation.y = - Math.PI / 2;
    scene.add(ads1);

    const plane2 = new THREE.PlaneGeometry(0.28, 0.13, 1, 1);
    const mat2 = new THREE.MeshLambertMaterial({ color: 0x0000ff, opacity: 0, transparent: true });
    ads2 = new THREE.Mesh(plane2, mat2);
    ads2.position.set(0.135, 0.525, -0.135);
    ads2.rotation.y = - Math.PI / 3.8;
    scene.add(ads2);

}

function initScene() {

    const Amlight = new THREE.AmbientLight(0x404040, 4); // soft white light
    scene.add(Amlight);

    //BACKGROUND
    //const loader = new THREE.TextureLoader();
    //const bgTexture = loader.load('./asset/night.jpg');
    //scene.background = bgTexture;
    scene.background = new THREE.Color(0x000000);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(4, 4, 4);
    //dirLight.castShadow = true;

    dirLight.distance = 100;
    dirLight.angle = Math.PI * 0.2;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 100;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    const light = new THREE.DirectionalLight(0xffffff, 2); //Blue
    light.position.set(1.12, 0.35, -0.73);
    light.castShadow = true;

    // scene.add(light);


    const light2 = new THREE.DirectionalLight(0xFF00FF, 1); // pink
    light2.position.set(2, 2, -1);
    //light2.castShadow = true;
    //scene.add(light2);


    const mainLight = new THREE.PointLight(0xffffff, 5, 2);
    mainLight.position.y = 10;
    mainLight.position.x = 2;
    // mainLight.castShadow = true;
    // scene.add(mainLight);

    const bulbGeometry = new THREE.SphereGeometry(0.02, 16, 8);
    const bulbLight = new THREE.PointLight(0xFF00FF, 1, 100, 20);
    const bulbMat = new THREE.MeshStandardMaterial({
        emissive: 0xffffee,
        emissiveIntensity: 1,
        color: 0x000000
    });
    bulbLight.add(new THREE.Mesh(bulbGeometry, bulbMat));
    bulbLight.position.set(0.39, 0.2, -0.80);
    bulbLight.castShadow = true;
    bulbLight.power = 50;
    scene.add(bulbLight); // CENTER PINK

    const bulbGeometry1 = new THREE.SphereGeometry(0.02, 16, 8);
    const bulbLight1 = new THREE.PointLight(0xFFFFFF, 1, 100, 20);
    const bulbMat1 = new THREE.MeshStandardMaterial({
        emissive: 0xffffee,
        emissiveIntensity: 1,
        color: 0x000000
    });
    bulbLight1.add(new THREE.Mesh(bulbGeometry1, bulbMat1));
    bulbLight1.position.set(0.30, 0.7, -0.80);
    bulbLight1.castShadow = true;
    bulbLight1.power = 10;
    scene.add(bulbLight1);



    const bulbGeometry2 = new THREE.SphereGeometry(0.02, 16, 8);
    const bulbLight2 = new THREE.PointLight(0xffee88, 1, 10, 10);
    const bulbMat2 = new THREE.MeshStandardMaterial({
        emissive: 0xffffee,
        emissiveIntensity: 1,
        color: 0x000000
    });
    bulbLight2.add(new THREE.Mesh(bulbGeometry2, bulbMat2));
    bulbLight2.position.set(0, 0.2, 1);
    bulbLight2.castShadow = true;
    bulbLight2.power = 50;
    scene.add(bulbLight2);

    const bulbGeometry3 = new THREE.SphereGeometry(0.02, 16, 8);
    const bulbLight3 = new THREE.PointLight(0xffee88, 1, 100, 1);
    const bulbMat3 = new THREE.MeshStandardMaterial({
        emissive: 0xffffee,
        emissiveIntensity: 1,
        color: 0x000000
    });
    bulbLight3.add(new THREE.Mesh(bulbGeometry2, bulbMat2));
    bulbLight3.position.set(-1, 1, -2);
    bulbLight3.castShadow = true;
    // bulbLight3.shadowMapHeight = 1600;
    //bulbLight3.shadowMapWidth = 1600;
    bulbLight3.power = 50;
    scene.add(bulbLight3);

    const bulbGeometry4 = new THREE.SphereGeometry(0.02, 16, 8);
    const bulbLight4 = new THREE.PointLight(0x00008B, 1, 100, 10);
    const bulbMat4 = new THREE.MeshStandardMaterial({
        emissive: 0xffffee,
        emissiveIntensity: 1,
        color: 0x000000
    });
    bulbLight4.add(new THREE.Mesh(bulbGeometry2, bulbMat2));
    bulbLight4.position.set(2, 0.2, -2);
    bulbLight4.castShadow = true;
    bulbLight4.power = 50;
    scene.add(bulbLight4);

    const bulbGeometry5 = new THREE.SphereGeometry(0.02, 16, 8);
    bulbLight5 = new THREE.PointLight(0x00008B, 0.1, 50, 10);
    bulbMat5 = new THREE.MeshStandardMaterial({
        emissive: 0xffffee,
        emissiveIntensity: 0.1,
        color: 0x000000
    });
    bulbLight5.add(new THREE.Mesh(bulbGeometry5, bulbMat5));
    bulbLight5.position.set(1.02, 1, -1.2);
    bulbLight5.castShadow = true;
    bulbLight5.power = 100;
    scene.add(bulbLight5);

    const bulbGeometry6 = new THREE.SphereGeometry(0.02, 16, 8);
    const bulbLight6 = new THREE.PointLight(0xffffff, 0.1, 50, 10);
    const bulbMat6 = new THREE.MeshStandardMaterial({
        emissive: 0xffffee,
        emissiveIntensity: 0.1,
        color: 0x000000
    });
    bulbLight6.add(new THREE.Mesh(bulbGeometry6, bulbMat6));
    bulbLight6.position.set(0.65, 0.75, -1.2);
    // bulbLight6.castShadow = true;
    bulbLight6.power = 50;
    // scene.add(bulbLight6);

    const spotLight = new THREE.SpotLight(0xFFA500, 2);
    spotLight.position.set(1.0, 0.75, -1.2);
    spotLight.castShadow = false;
    spotLight.angle = 1;
    spotLight.penumbra = 0.2;
    spotLight.decay = 0.2;
    spotLight.distance = 1;
    spotLight.target.position.set(0.65, 0.75, -1.2);
    scene.add(spotLight);
    scene.add(spotLight.target);

    const spotLight2 = new THREE.SpotLight(0xFFA500, 15);
    spotLight2.position.set(0.47, 0.5, -0.17);
    spotLight2.castShadow = true;
    spotLight2.angle = 0.5;
    spotLight2.penumbra = 1;
    spotLight2.decay = 0.2;
    spotLight2.distance = 1;
    spotLight2.target.position.set(0.35, 0, -0.17);
    scene.add(spotLight2);
    scene.add(spotLight2.target);

    const spotLight3 = new THREE.SpotLight(0xFFA500, 8);
    spotLight3.position.set(0.84, 0.7, -1.4);
    spotLight3.castShadow = true;
    spotLight3.angle = 0.3;
    spotLight3.penumbra = 1;
    spotLight3.decay = 0.2;
    spotLight3.distance = 1;
    spotLight3.target.position.set(0.84, 0, -1);
    scene.add(spotLight3);
    scene.add(spotLight3.target);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 20, 0);
    //  scene.add(hemiLight);

    // Helper (optional)
    const camera_helper = new THREE.CameraHelper(light.shadow.camera);
    // scene.add(camera_helper);


    //YOUTUBE 
    const group = new THREE.Group();
    group.add(new inityoutube('oqKzxPMLWxo', 0, 0, 2, 0));
    group.add(new inityoutube('Y2-xZ-1HE-Q', 2, 0, 0, Math.PI / 2));
    group.add(new inityoutube('IrydklNpcFI', 0, 0, - 2, Math.PI));
    group.add(new inityoutube('9ubytEsCaS0', -2, 0, 0, - Math.PI / 2));
    scene.add(group);
    // group.position.set(0, 1, 0);
}

function initRenderer() {
    const canvas = document.querySelector('.webgl');
    container = document.createElement('div');

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    //renderer.setClearColor(clearColor);
    renderer.setPixelRatio(window.devicePixelRatio * 1.5);
    renderer.setSize(window.innerWidth, window.innerHeight);
    //renderer.outputEncoding = THREE.sRGBEncoding; //Bright 
    renderer.shadowMap.enabled = true;
    renderer.shadowMapType = THREE.BasicShadowMap;
    //renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.shadowMap.autoUpdate = true;
    renderer.receiveShadow = true;

    //renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMapping = THREE.ReinhardToneMapping;
    //renderer.toneMapping = THREE.CineonToneMapping
    container.appendChild(renderer.domElement);


    renderer.gammaOuput = true;
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

    //  renderer.setClearColor(clearColor);
    document.body.appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('click', onClick);

}

function onPointerMove(event) {

    // calculate pointer position in normalized device coordinates
    // (-1 to +1) for both components

    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

}

function resetMaterials() {

    for (let i = 0; i < scene.children.length; i++) {
        if (scene.children[i].material) {
            //scene.children[i].material.opacity = 1.0;
            scene.children[i].material.opacity = scene.children[i] == selectedPiece ? 0.5 : 1.0;

            //scene.children[i].material.color.set(0xff0000);
        }

    }
}

function hoverPieces() {

    let ads = [ads1, ads2];

    // update the picking ray with the camera and pointer position
    raycaster.setFromCamera(pointer, camera);

    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(ads);

    for (let i = 0; i < intersects.length; i++) {

        //intersects[i].object.material.color.set(0xff0000);
        intersects[i].object.material.transparent = true;
        intersects[i].object.material.opacity = 0.5;
        //  intersects[i].object.material.outline = 2;
    }
}

function onClick(event) {


    raycaster.setFromCamera(pointer, camera);

    // calculate objects intersecting the picking ray
    let intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        selectedPiece = intersects[0].object;
        //  window.open('https://www.google.com', intersects[0].objects);

        if (selectedPiece == ads1)

            window.open('https://twitter.com/metaheroesclub', intersects[0].objects);

        if (selectedPiece == ads2)
            window.open('https://www.roblox.com/', intersects[0].objects);
    }
}

/*  camera.position.x = mouse.x;
 camera.position.z = mouse.y; */

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

function initControl() {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0.7, 0.5, -1);
    controls.update();
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.minZoom = 0.4;
    controls.maxZoom = 2;
    controls.minPolarAngle = 0; // radians
    controls.maxPolarAngle = 1.55; // radians

}

function initFps() {
    controls = new FirstPersonControls(camera, renderer.domElement);
    controls.movementSpeed = 500;
    controls.lookSpeed = 10;

}
function onWindowResize() {

    const aspect = window.innerWidth / window.innerHeight;

    camera.left = - frustumSize * aspect / 2;
    camera.right = frustumSize * aspect / 2;
    camera.top = frustumSize / 2;
    camera.bottom = - frustumSize / 2;

    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    // controls.handleResize();
};

function animate() {

    var delta = clock.getDelta()
    requestAnimationFrame(animate);
    update(delta);

    //Moving Bulb
    /*  const time = Date.now() * 0.0005;
     bulbLight5.position.y = Math.cos(time) * 0.2 + 1; //MOVE BULB */
    //bulbLight5.position.x = Math.cos(time) * 0.5 + 0.8; //MOVE BULB

    // resetMaterials() //for hover mode only
    //   hoverPieces();
    render(delta);
    stats.update();




}

function update(delta) {
    if (mixer) mixer.update(delta);
}


function render(delta) {

    controls.update(clock.getDelta());
    effect.render(scene, camera);



    //ROTATE CAMERA


    /*   if (params.autoRotate) {
  
          const timer = Date.now() * 0.0002;
  
          camera.position.x = Math.sin(timer) * 4;
          camera.position.y = 1;
          camera.position.z = Math.cos(timer) * 4;
          camera.lookAt(0.6, 0.5, -1);
  
      } else {
  
          controls.update();
  
      } */
    //ROTATE CAMERA END

}
