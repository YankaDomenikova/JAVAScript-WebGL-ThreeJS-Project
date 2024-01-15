import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import WebGL from 'three/addons/capabilities/WebGL.js';
import TWEEN from 'tween.js';

let scene, camera, renderer, controls, model;
let autoRotate = false;

const resetButton = document.getElementById('reset-button');
const toggleFullscreenBtn = document.getElementById('toggle-fullscreen');
const toggleAutorotate = document.getElementById('toggle-autorotate');
const zoomInButton = document.getElementById('zoomInButton');
const zoomOutButton = document.getElementById('zoomOutButton');
const rotationSpeedSlider = document.getElementById('rotation-speed-slider');

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x191919);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    renderer.shadowMap.enabled = true;

    loadModel();
    setupLights();
    setupControls();
    addEventListeners();
    setupZoomButtons();
}

function setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 3);
    scene.add(ambientLight);
}

function loadModel() {
    const loader = new GLTFLoader();
    loader.load('/assets/model.glb', (gltf) => {
        model = gltf.scene;
        model.scale.set(1.45, 1.45, 1.45);
        model.rotation.set(0.75, 0, 0);
        scene.add(model);
    }, undefined, (error) => {
        console.error(error);
    });
}

function setupControls() {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enableZoom = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI;
    controls.autoRotate = autoRotate;
}

function addEventListeners() {
    window.addEventListener('resize', onWindowResize);

    resetButton.addEventListener('click', tweenCameraToInitialPosition);
    toggleFullscreenBtn.addEventListener('click', toggleFullscreen);
    toggleAutorotate.addEventListener('change', toggleAutoRotation);

    rotationSpeedSlider.addEventListener('input', () => {
        updateAutoRotationSpeed(parseFloat(rotationSpeedSlider.value));
    });

    document.addEventListener('mousewheel', onMouseWheel, false);
    document.addEventListener('DOMMouseScroll', onMouseWheel, false);    
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseWheel(event) {
    event.preventDefault();

    const zoomDirection = event.deltaY > 0 ? 1 : -1;

    const targetDistance = controls.target.distanceTo(controls.object.position) * (1 + zoomDirection * 0.1);

    const newPosition = controls.object.position.clone().sub(controls.target).normalize().multiplyScalar(targetDistance).add(controls.target);

    new TWEEN.Tween(controls.object.position)
        .to({ x: newPosition.x, y: newPosition.y, z: newPosition.z }, 350) 
        .easing(TWEEN.Easing.Quadratic.Out)
        .onUpdate(() => {
            controls.update();
        })
        .start();
}

function tweenCameraToInitialPosition() {
    const initialCameraPosition = new THREE.Vector3(0, 0, 5);
    const duration = 1000;

    new TWEEN.Tween(camera.position)
        .to(initialCameraPosition, duration)
        .easing(TWEEN.Easing.Quadratic.Out) 
        .start();
}

function toggleFullscreen() {
    const elem = document.documentElement;

    if (!document.fullscreenElement) {
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) { 
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) { 
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

function setupZoomButtons() {
    zoomInButton.addEventListener('click', () => {
        tweenZoom(0.9);
    });

    zoomOutButton.addEventListener('click', () => {
        tweenZoom(1.1); 
    });
}

function tweenZoom(factor) {
    const distance = controls.object.position.distanceTo(controls.target);
    const newDistance = distance * factor;

    new TWEEN.Tween(controls.object.position)
        .to({
            x: controls.target.x + newDistance * controls.object.position.x / distance,
            y: controls.target.y + newDistance * controls.object.position.y / distance,
            z: controls.target.z + newDistance * controls.object.position.z / distance,
        }, 500) 
        .easing(TWEEN.Easing.Quadratic.Out) 
        .onUpdate(() => {
            controls.update();
        })
        .start();
}

function updateAutoRotationSpeed(speed) {
    controls.autoRotateSpeed = speed;
}

function toggleAutoRotation() {
    autoRotate = !autoRotate;
    controls.autoRotate = autoRotate;
}

function animate() {
    requestAnimationFrame(animate);
    TWEEN.update(); 
    controls.update();
    renderer.render(scene, camera);
}

function start() {
    if (WebGL.isWebGLAvailable()) {
        init();
        animate();
    } else {
        const warning = WebGL.getWebGLErrorMessage();
        document.getElementById('container').appendChild(warning);
    }
}

start();