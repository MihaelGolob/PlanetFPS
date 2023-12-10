import { GLTFLoader } from '../common/engine/loaders/GLTFLoader.js';
import { GoodFPSController } from './Components/FPS/GoodFPSController.js';
import { Light } from './Light.js';
import {
  Camera,
  Model,
  Node,
  Transform,
} from '../common/engine/core.js';
import { Collider } from './Components/Collider.js';
import { vec3, vec4, mat4, quat } from '../lib/gl-matrix-module.js';
import { toVec3 } from '../common/engine/core/SceneUtils.js';
import { NetworkManager } from './Network.js';
import { UserInterface } from './UI/UserInterface.js';
import { InGameUI } from './UI/InGameUI.js';
import { MainMenuUI } from './UI/MainMenuUI.js';
import { SkyboxComponent } from './Components/util/SkyboxComponent.js';
import { MoveComponent } from './Components/util/MoveComponent.js';
import { treeData } from './data/TreeData.js';
import { GunComponent } from './Components/GunComponent.js';

export class Scene {
  constructor() {
    this.scene = new Node();
    this.uiContainer = document.getElementById("ui-container");
    NetworkManager.instance().setSceneNode(this.scene);
  }

  async initialize() {
    // set scene
    // let sceneLoader = new GLTFLoader();
    // await sceneLoader.load('../Assets/Models/scene.gltf');
    // this.scene = sceneLoader.loadScene(0);
    // ground
    let ground = await this.loadModel('../Assets/Models/scene.gltf');
    let groundCollider = new Collider(ground, 10, true, () => { });
    ground.addChild(this.createColliderNode([0, 0, 0], groundCollider));
    this.scene.addChild(ground);

    // trees
    await this.SpawnTrees();
    await this.SpawnGrass('../Assets/Models/grass01.gltf');
    await this.SpawnGrass('../Assets/Models/grass02.gltf');

    // fps + camera
    const [fps, camera] = await this.createFPSController();
    this.camera = camera;
    this.scene.addChild(fps);

    // skybox
    let skybox = await this.loadModel('../Assets/Models/skybox.gltf');
    skybox.addComponent(new SkyboxComponent(skybox, fps.getComponentOfType(Transform)));
    this.scene.addChild(skybox);

    // light
    let sun1 = this.createLight(-10, 20, 0);
    this.scene.addChild(sun1);

    let sun2 = this.createLight(10, -20, 0);
    this.scene.addChild(sun2);

    // ui
    UserInterface.setInstance(InGameUI);
    // this.userInterface = new InGameUI();

    // network
    NetworkManager.instance().sendCreateNetPlayer();
  }

  async loadModel(path) {
    const loader = new GLTFLoader();
    await loader.load(path);
    return loader.loadNode(0);
  }

  async SpawnTrees() {
    for (let i = 0; i < treeData.length; i++) {
      await this.createObjectOnSphere(10, treeData[i].theta, treeData[i].phi, treeData[i].randomRotation, this.createTreeNode, this);
    }
  }

  async SpawnGrass(path) {
    for (let i = 0; i < 200; i++) {
      let theta = Math.random() * 100 * Math.PI;
      let phi = Math.random() * 100 * Math.PI;
      await this.createObjectOnSphere(10, theta, phi, 0, this.createGrassNode, this, path);
    }
  }

  // TODO: get more tree models
  async createObjectOnSphere(radius, theta, phi, randomAngle, nodeCreator, context, path = null) {
    let objectNode = null;
    if (path != null) {
      objectNode = await nodeCreator(context, path);
    } else {
      objectNode = await nodeCreator(context);
    }

    let sin_phi = Math.sin(phi);
    let cos_phi = Math.cos(phi);
    let sin_theta = Math.sin(theta);
    let cos_theta = Math.cos(theta);

    // tree position
    let globalPosition = vec3.fromValues(radius * sin_theta * cos_phi, radius * sin_theta * sin_phi, radius * cos_theta);
    let objectTransform = objectNode.getComponentOfType(Transform);
    objectTransform.translation = globalPosition;

    // tree rotation
    let globalDown = toVec3(vec4.transformMat4(vec4.create(), vec4.fromValues(0, -1, 0, 0), objectTransform.matrix));
    let gravityDir = vec3.normalize(vec3.create(), globalPosition);
    vec3.scale(gravityDir, gravityDir, -1);

    let rotation = quat.rotationTo(quat.create(), globalDown, gravityDir);
    quat.mul(objectTransform.rotation, rotation, objectTransform.rotation);

    // spin
    let randomRotation = quat.setAxisAngle(quat.create(), vec3.fromValues(0, 1, 0), randomAngle);
    quat.mul(objectTransform.rotation, objectTransform.rotation, randomRotation);

    this.scene.addChild(objectNode);
  }

  async createTreeNode(context) {
    const treeLoader = new GLTFLoader();
    await treeLoader.load('../Assets/Models/drevo.gltf');
    let tree = treeLoader.loadNode(0);
    let collider1 = new Collider(tree, 0.6, true, () => { })
    // await collider1.initializeDebugDraw();
    tree.addChild(context.createColliderNode([-0.08, 0.8, 0.06], collider1));

    let collider2 = new Collider(tree, 0.6, true, () => { })
    // await collider2.initializeDebugDraw();
    tree.addChild(context.createColliderNode([0.07, 1.92, -0.15], collider2));

    let collider3 = new Collider(tree, 1.6, true, () => { })
    // await collider3.initializeDebugDraw();
    tree.addChild(context.createColliderNode([0.13, 3.57, 0.2], collider3));

    return tree;
  }

  async createGrassNode(context, path) {
    const grassLoader = new GLTFLoader();
    await grassLoader.load(path);
    let grass = grassLoader.loadNode(0);
    return grass;
  }

  async createFPSController() {
    let FPSRoot = new Node();
    this.scene.addChild(FPSRoot);
    let FPSRootTransform = new Transform({ translation: [0, 20, 0] });
    FPSRoot.addComponent(FPSRootTransform);

    let FPSCollider = new Collider(FPSRoot, 1, false, (otherNode) => {
      let checkIfBullet = otherNode.id == 420;
      if (!checkIfBullet) return;

      let damage = 50;
      FPSRoot.getComponentOfType(GoodFPSController).takeDamage(damage);
    });
    // await FPSCollider.initializeDebugDraw();
    FPSRoot.addChild(this.createColliderNode([0, 0.5, 0], FPSCollider, 1));

    let isGroundedCollider = new Collider(FPSRoot, 0.09, false, () => {
      FPSRoot.getComponentOfType(GoodFPSController).isGrounded = true;
    }, true);
    // await isGroundedCollider.initializeDebugDraw();
    FPSRoot.addChild(this.createColliderNode([0, -0.6, 0], isGroundedCollider));

    let FPSBody = new Node();
    FPSRoot.addChild(FPSBody);
    let bodyTransform = new Transform({ translation: [0, 1, 0] })
    FPSBody.addComponent(bodyTransform);

    let FPSCamera = new Node();
    FPSBody.addChild(FPSCamera);
    FPSCamera.addComponent(new Camera());
    let cameraTransform = new Transform({ translation: [0, 1.5, 0], });
    FPSCamera.addComponent(cameraTransform);

    let gunLoader = new GLTFLoader();
    await gunLoader.load('../Assets/Models/gun.gltf');
    let gun = gunLoader.loadNode(0);
    let gunTransform = gun.getComponentOfType(Transform);
    gunTransform.translation = [1.5, -1, -2.4];
    let gunComponent = new GunComponent(gunTransform);
    gun.addComponent(gunComponent);
    FPSCamera.addChild(gun);

    FPSRoot.addComponent(new GoodFPSController(FPSRoot, FPSRootTransform, bodyTransform, cameraTransform, gun, this.scene));

    return [FPSRoot, FPSCamera];
  }

  createColliderNode(position, colliderComponent, id = -1) {
    let colliderNode = new Node(id);
    colliderNode.addComponent(new Transform({ translation: position }));
    colliderNode.addComponent(colliderComponent);
    return colliderNode;
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
