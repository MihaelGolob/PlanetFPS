import { GLTFLoader } from '../../../common/engine/loaders/GLTFLoader.js';
import { SelfDestroyComponent } from '../util/SelfDestroyComponent.js';
import { Transform } from '../../../common/engine/core.js';
import { MoveComponent } from '../util/MoveComponent.js';
import { vec3 } from '../../../../lib/gl-matrix-module.js';
import { Collider } from '../Collider.js'
import { Node } from '../../../common/engine/core/Node.js';

export class Bullet {
    constructor(parent, startPosition, direction) {
        // bullet parameters
        this.speed = 50;
        this.damage = 15;
        this.lifetime = 3;
        this.parent = parent;
        this.startPosition = startPosition;
        this.direction = direction;
    } 

    async initialize() {
        let loader = new GLTFLoader();
        await loader.load('../Assets/Models/bullet.gltf');
        this.bulletNode = loader.loadNode(0);

        // transform
        this.transform = this.bulletNode.getComponentOfType(Transform);
        this.transform.scale = [1, 1, 1];
        this.transform.translation = this.startPosition;
        
        this.parent.addChild(this.bulletNode);

        // movement
        this.moveComponent = new MoveComponent(this.transform, this.speed, this.direction);
        this.bulletNode.addComponent(this.moveComponent);

        // collider
        let colliderNode = new Node();
        colliderNode.addComponent(new Transform());
        let collider = new Collider(this.bulletNode, 0.1, false, (hitNode) => {
            this.parent.removeChild(this.bulletNode);
            console.log('bullet collision, id:', hitNode.id);
        }, true);
        colliderNode.addComponent(collider);
        this.bulletNode.addChild(colliderNode);

        // self destroy
        let selfDestroy = new SelfDestroyComponent(this.bulletNode, this.parent, this.lifetime);
        this.bulletNode.addComponent(selfDestroy);
    }
}