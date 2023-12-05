import { GLTFLoader } from '../../../common/engine/loaders/GLTFLoader.js';
import { SelfDestroyComponent } from '../util/SelfDestroyComponent.js';
import { Transform } from '../../../common/engine/core.js';
import { MoveComponent } from '../util/MoveComponent.js';

export class Bullet {
    constructor(parent, startPosition, speed, direction, damage, lifetime) {
        // bullet parameters
        this.speed = speed;
        this.damage = damage;
        this.lifetime = lifetime;
        this.parent = parent;
        this.startPosition = startPosition;
        this.direction = direction;
    } 

    async initialize() {
        let loader = new GLTFLoader();
        await loader.load('../Assets/Models/sphere.gltf');
        this.node = loader.loadNode(0);

        // transform
        this.transform = new Transform();
        this.transform.translation = this.startPosition;
        this.transform.scale = [0.01, 0.01, 0.01];
        this.node.addComponent(this.transform);
        
        this.parent.addChild(this.node);

        // movement
        this.moveComponent = new MoveComponent(this.transform, this.speed, this.direction);
        this.node.addComponent(this.moveComponent);

        // TODO: add collider

        // self destroy
        let selfDestroy = new SelfDestroyComponent(this.node, this.parent, this.lifetime);
        this.node.addComponent(selfDestroy);
    }
}