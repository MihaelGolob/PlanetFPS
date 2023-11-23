import { ResizeSystem } from '../common/engine/systems/ResizeSystem.js';
import { UpdateSystem } from '../common/engine/systems/UpdateSystem.js';
import { GLTFLoader } from '../common/engine/loaders/GLTFLoader.js';
import { FirstPersonController } from '../common/engine/controllers/FirstPersonController.js';
import { Renderer } from './Renderer.js';
import { Light } from './Light.js';
import { FPSController } from './Components/FPS/FPSController.js';

import {
    Camera,
    Model,
    Node,
    Transform,
} from '../common/engine/core.js';

const canvas = document.querySelector('canvas');

// scene setup
const glftLoader = new GLTFLoader();
await glftLoader.load('./common/models/monkey.gltf');

const scene = glftLoader.loadScene(glftLoader.defaultScene);
const camera = scene.find(node => node.getComponentOfType(Camera));
camera.addComponent(new FPSController(camera.getComponentOfType(Transform)));

const model = scene.find(node => node.getComponentOfType(Model));

const light = new Node();
light.addComponent(new Transform({
    translation: [3, 3, 1],
}));
light.addComponent(new Light({ambient: 0.3, shininess: 10}));

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
    renderer.render(scene, camera);
}

function resize({ displaySize: { width, height }}) {
    camera.getComponentOfType(Camera).aspect = width / height;
}

new ResizeSystem({ canvas, resize }).start();
new UpdateSystem({ update, render }).start();