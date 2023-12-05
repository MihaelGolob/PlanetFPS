import { ResizeSystem } from '../common/engine/systems/ResizeSystem.js';
import { UpdateSystem } from '../common/engine/systems/UpdateSystem.js';
import { GLTFLoader } from '../common/engine/loaders/GLTFLoader.js';
import { Renderer } from './Renderer.js';
import { Light } from './Light.js';
import { Scene } from './Scene.js';
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

let sceneNode = new Scene();
await sceneNode.initialize();

const renderer = new Renderer(canvas);
await renderer.initialize();

function update(time, dt) {
  sceneNode.scene.traverse(node => {
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
  renderer.render(sceneNode.scene, sceneNode.camera);
}

function resize({ displaySize: { width, height } }) {
  sceneNode.camera.getComponentOfType(Camera).aspect = width / height;
}

new ResizeSystem({ canvas, resize }).start();
new UpdateSystem({ update, render }).start();
