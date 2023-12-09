import { ResizeSystem } from '../common/engine/systems/ResizeSystem.js';
import { UpdateSystem } from '../common/engine/systems/UpdateSystem.js';
import { Renderer } from './Renderer.js';
import { Scene } from './Scene.js';
import { Collider } from './Components/Collider.js';
import {
  Camera,
  Model,
  Node,
  Transform,
} from '../common/engine/core.js';
import { NetworkManager } from './Network.js';
import { UserInterface } from './UserInterface.js';

// global variables
export let debug_objects = [];
let oldTime = Date.now();

const canvas = document.querySelector('canvas');

// play background mucic
const backgroundMusic = document.getElementById('background-music');
backgroundMusic.volume = 0.1;
backgroundMusic.loop = true;
backgroundMusic.play();

let sceneNode = new Scene();
await sceneNode.initialize();

for (let i in debug_objects) {
  sceneNode.scene.addChild(debug_objects[i]);
}

const renderer = new Renderer(canvas);
await renderer.initialize();

function update(time, dt) {
  let static_colliders = []
  let dynamic_colliders = []
  sceneNode.scene.traverse(node => {
    for (const component of node.components) {
      component.update?.(time, dt);
      if (component instanceof Collider) {
        if (component.isStatic) {
          static_colliders.push(node);
        } else {
          dynamic_colliders.push(node);
        }
      }
    }
  });

  Collider.resolveCollisions(static_colliders, dynamic_colliders);
  updateStats();
  NetworkManager.instance();

  //let UI = UserInterface.getInstance();
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
  // UserInterface.getInstance().updatePos();
}

new ResizeSystem({ canvas, resize }).start();
new UpdateSystem({ update, render }).start();
