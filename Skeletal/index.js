import {VertexArray} from '../../src/VertexArray.js';
import {VertexAttributes} from '../../src/VertexAttribute.js';
import {ShaderProgram} from '../../src/ShaderProgram.js';
import {Matrix4} from '../../src/Matrix4.js';
import {Camera} from '../../src/Camera.js';
import {Vector3} from '../../src/Vector3.js';
import {Vector2} from '../../src/Vector2.js';
import {Vector4} from '../../src/Vector4.js';

import { Trackball } from '../../src/Trackball.js';
import { Generate } from '../../src/Generate.js';
import { Noise } from '../../src/Noise.js';


//Variables for setup

let container;
let camera;
let renderer;
let scene;
let house;
let mixer;

function init() {
  container = document.querySelector(".scene");

  //Create scene
  scene = new THREE.Scene();

  const fov = 35;
  const aspect = container.clientWidth / container.clientHeight;
  const near = 0.1;
  const far = 1000;

  //Camera setup
  camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 0, 100);

  const ambient = new THREE.AmbientLight(0x404040, 2);
  scene.add(ambient);

  const light = new THREE.DirectionalLight(0xffffff, 2);
  light.position.set(50, 50, 100);
  scene.add(light);
  
  
  // controls.addEventListener('change', renderer);
        
        
  //Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  
  controls = new THREE.OrbitControls(camera, renderer.domElement);

  container.appendChild(renderer.domElement);

  const clock = new THREE.Clock();

  //Load Model
  let loader = new THREE.GLTFLoader();
  loader.load("./house/bbb.glb", function(gltf) {
    scene.add(gltf.scene);
    house = gltf.scene.children[0];

    mixer = new THREE.AnimationMixer( house );
    mixer.clipAction(gltf.animations[0]).play();

    animate();
  });
}

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  mixer.update( delta );

  house.rotation.z += 0.005;
  renderer.render(scene, camera);
}

init();

function onWindowResize() {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(container.clientWidth, container.clientHeight);
}

window.addEventListener("resize", onWindowResize);
