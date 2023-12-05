import { GLTFLoader } from '../common/engine/loaders/GLTFLoader.js';
import { GoodFPSController } from './Components/FPS/GoodFPSController.js';
import { Light } from './Light.js';
import {
  Camera,
  Model,
  Node,
  Transform,
} from '../common/engine/core.js';

export class Scene {
  constructor() {
    this.scene = new Node();
  } 

  async initialize() {
    // ground
    let ground = await this.loadModel('../Assets/Models/sphere.gltf');
    this.scene.addChild(ground);
    // ball
    let ball = await this.loadModel('../Assets/Models/sphere.gltf');
    let ballTransform = ball.getComponentOfType(Transform);
    ballTransform.scale = [0.1, 0.1, 0.1];
    ballTransform.translation = [0, 9, -5];
    this.scene.addChild(ball);
    // fps + camera
    const [fps, camera] = this.createFPSController();
    this.camera = camera;
    this.scene.addChild(fps);
    // light
    let sun = this.createLight(3, 10, 1);
    this.scene.addChild(sun)
  }

  async loadModel(path) {
    const loader = new GLTFLoader();
    await loader.load(path);
    return loader.loadNode(0);
  }

  createFPSController() {
    let FPSRoot = new Node();
    this.scene.addChild(FPSRoot);
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

    return [FPSRoot, FPSCamera];
  }

  createLight(x, y, z) {
    const light = new Node();
    light.addComponent(new Transform({
      translation: [x, y, z],
    }));
    light.addComponent(new Light({ ambient: 0.3, shininess: 3 }));

    return light;
  } 
}
