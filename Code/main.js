import { ResizeSystem } from '../common/engine/systems/ResizeSystem.js';
import { UpdateSystem } from '../common/engine/systems/UpdateSystem.js';
import { GLTFLoader } from '../common/engine/loaders/GLTFLoader.js';
import { Renderer } from './Renderer.js';
import { Light } from './Light.js';
import { GoodFPSController } from './Components/FPS/GoodFPSController.js';
import {
  Camera,
  Model,
  Node,
  Transform,
} from '../common/engine/core.js';

// global variables
let oldTime = Date.now();

const canvas = document.querySelector('canvas');

// scene setup
const planetLoader = new GLTFLoader();
await planetLoader.load('./Assets/models/sphere.gltf');

// README: for each model you create a new loader (i think) and then
// you can access the node with the 'loadNode' function.
// Then just add the node to the scene.
const ballLoader = new GLTFLoader();
await ballLoader.load('./Assets/models/sphere.gltf');
const ball = ballLoader.loadNode(0);
const ballTransform = ball.getComponentOfType(Transform);
ballTransform.translation = [0, 10, -4];
ballTransform.scale = [0.1,0.1,0.1];

const scene = planetLoader.loadScene(planetLoader.defaultScene);

scene.addChild(ball);

let FPSRoot = new Node();
scene.addChild(FPSRoot);
let FPSRootTransform = new Transform({ translation: [0, 10, 0] });
FPSRoot.addComponent(FPSRootTransform);

let FPSBody = new Node();
FPSRoot.addChild(FPSBody);
let bodyTransform = new Transform({ translation: [0, 1, 0] })
FPSBody.addComponent(bodyTransform);

let FPSCamera = new Node();
FPSBody.addChild(FPSCamera);
FPSCamera.addComponent(new Camera());
let cameraTransform = new Transform({ translation: [0, 1.5, 0], });
FPSCamera.addComponent(cameraTransform);

FPSRoot.addComponent(new GoodFPSController(FPSRoot, FPSRootTransform, bodyTransform, cameraTransform));

const light = new Node();
light.addComponent(new Transform({
  translation: [3, 10, 1],
}));
light.addComponent(new Light({ ambient: 0.3, shininess: 3 }));

scene.addChild(light);

const renderer = new Renderer(canvas);
await renderer.initialize();

function update(time, dt) {
  scene.traverse(node => {
    for (const component of node.components) {
      component.update?.(time, dt);
    }
  });

  updateStats();
}

function updateStats() {
  let now = Date.now();
  let delta = now - oldTime;
  let fps = (1000 / delta).toFixed(1);
  oldTime = Date.now();

  document.getElementById('stat-fps').innerHTML = fps;
}

function render() {
  renderer.render(scene, FPSCamera);
}

function resize({ displaySize: { width, height } }) {
  FPSCamera.getComponentOfType(Camera).aspect = width / height;
}

new ResizeSystem({ canvas, resize }).start();
new UpdateSystem({ update, render }).start();
