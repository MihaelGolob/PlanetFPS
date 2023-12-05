import { ResizeSystem } from '../common/engine/systems/ResizeSystem.js';
import { UpdateSystem } from '../common/engine/systems/UpdateSystem.js';
import { GLTFLoader } from '../common/engine/loaders/GLTFLoader.js';
import { Renderer } from './Renderer.js';
import { Light } from './Light.js';

import {
  Camera,
  Model,
  Node,
  Transform,
} from '../common/engine/core.js';

import { GoodFPSController } from './Components/FPS/GoodFPSController.js';

const canvas = document.querySelector('canvas');

// scene setup
const glftLoader = new GLTFLoader();
await glftLoader.load('./common/models/monkey.gltf');



const scene = glftLoader.loadScene(glftLoader.defaultScene);

let FPSRoot = new Node();
FPSRoot.addComponent(new Transform({ position: [0, 0, 10] }));
scene.addChild(FPSRoot);

let FPSBody = new Node();
FPSRoot.addChild(FPSBody);
FPSBody.addComponent(new Transform({ position: [0, 1, 10] }));

// scene supports only one camera for now
let FPSCamera = new Node();
FPSCamera.addComponent(new Camera());
let cameraTransform = new Transform({ position: [0, 1.5, 10], });
FPSCamera.addComponent(cameraTransform);
FPSBody.addChild(FPSCamera);


FPSRoot.addComponent(new GoodFPSController(FPSRoot, FPSBody, cameraTransform));


//let camera = scene.find(node => node.getComponentOfType(Camera));

const model = scene.find(node => node.getComponentOfType(Model));

const light = new Node();
light.addComponent(new Transform({
  translation: [3, 3, 1],
}));
light.addComponent(new Light({ ambient: 0.3, shininess: 10 }));

scene.addChild(light);

const renderer = new Renderer(canvas);
await renderer.initialize();

function update(time, dt) {
  scene.traverse(node => {
    for (const component of node.components) {
      component.update?.(time, dt);
    }
  });
}

function render() {
  renderer.render(scene, FPSCamera);
}

//function resize({ displaySize: { width, height } }) {
//camera.getComponentOfType(Camera).aspect = width / height;
//}

//new ResizeSystem({ canvas, resize }).start();
//
new UpdateSystem({ update, render }).start();
