import { ResizeSystem } from '../../common/engine/systems/ResizeSystem.js';
import { UpdateSystem } from '../../common/engine/systems/UpdateSystem.js';
import { Renderer } from '../Renderer.js';
import { Scene } from '../Scene.js';
import { Collider } from '../Components/Collider.js';
import {
  Camera,
  Model,
  Node,
  Transform,
} from '../../common/engine/core.js';
import { NetworkManager } from '../Network.js';
import { BaseState } from "./BaseState.js";
import { debug_objects } from '../main.js';

export class GameState extends BaseState {
    constructor() {
        super();

        this.oldTime = Date.now();
    }

    update(time, dt) {
        let static_colliders = []
        let dynamic_colliders = []
        this.sceneNode.scene.traverse(node => {
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
    }

    updateStats() {
        let now = Date.now();
        let delta = now - oldTime;
        let fps = (1000 / delta).toFixed(1);
        this.oldTime = Date.now();
        
        document.getElementById('stat-fps').innerHTML = fps;
    }

    render() {
        this.renderer.render(this.sceneNode.scene, this.sceneNode.camera);
    }

    resize({ displaySize: { width, height } }) {
        this.sceneNode.camera.getComponentOfType(Camera).aspect = width / height;
        // UserInterface.getInstance().updatePos();
    }

    async enter() {
        const canvas = document.querySelector('canvas');

        this.sceneNode = new Scene();
        await this.sceneNode.initialize();
        
        for (let i in debug_objects) {
            sceneNode.scene.addChild(debug_objects[i]);
        }
        
        this.renderer = new Renderer(canvas);
        await this.renderer.initialize();

        let resize = this.resize
        let update = this.update
        let render = this.render
        new ResizeSystem({ canvas, resize }).start();
        new UpdateSystem({ update, render }).start();
   }
}