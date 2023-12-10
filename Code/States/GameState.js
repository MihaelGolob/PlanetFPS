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
import { State } from "./BaseState.js";
import { debug_objects } from '../main.js';
import { UserInterface } from '../UI/UserInterface.js';
import { InGameUI } from '../UI/InGameUI.js';

export class GameState extends State {
  constructor() {
    super();

    this.oldTime = Date.now();
  }

  async onEnterState() {

    document.getElementById('loading-screen').style.display = 'flex';
    this.sceneNode = new Scene(this.ip);
    await this.sceneNode.initialize();

    UserInterface.setInstance(InGameUI);

    this.renderer = new Renderer(canvas);
    await this.renderer.initialize();

    this.resizeSystem = new ResizeSystem({ canvas, resize: this.resize.bind(this) });
    this.resizeSystem.start();
    this.updateSystem = new UpdateSystem({ update: this.update.bind(this), render: this.render.bind(this) });
    this.updateSystem.start();

    document.getElementById('loading-screen').style.display = 'none';
  }

  onDeleteState() {
    this.resizeSystem.stop();
    this.updateSystem.stop();
    delete this.sceneNode;
  }

  resize({ displaySize: { width, height } }) {
    this.sceneNode.camera.getComponentOfType(Camera).aspect = width / height;
  }

  render() {
    this.renderer.render(this.sceneNode.scene, this.sceneNode.camera);
  }

  updateStats() {
    let now = Date.now();
    let delta = now - this.oldTime;
    let fps = (1000 / delta).toFixed(1);
    this.oldTime = Date.now();

    document.getElementById('stat-fps').innerHTML = fps;

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
    this.updateStats();
    NetworkManager.instance();
  }
}

