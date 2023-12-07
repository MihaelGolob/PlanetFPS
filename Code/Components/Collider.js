import {GLTFLoader} from "../../common/engine/loaders/GLTFLoader.js";
import {Node, Transform} from "../../common/engine/core.js";
import { debug_objects } from "../main.js";
import { quat, vec3, vec4, mat4 } from '../../lib/gl-matrix-module.js';


export class Collider {
    static toVec3(v4) {
        if(v4[3]) {
            return vec3.fromValues(v4[0]/v4[3], v4[1]/v4[3], v4[2]/v4[3]);
        }
        return vec3.fromValues(v4[0], v4[1], v4[2]);
    }

    static resolveCollisions(static_colliders, dynamic_colliders) {
        dynamic_colliders.forEach(dynamicNode => {
            let dynamicCollider = dynamicNode.getComponentOfType(Collider);
            let dynamicGlobalPos = Collider.getGlobalPosition(dynamicNode);

            static_colliders.forEach(staticNode => {
                let staticCollider = staticNode.getComponentOfType(Collider);
                let staticGlobalPos = Collider.getGlobalPosition(staticNode);

                let distanceVector = vec3.create();
                vec3.sub(distanceVector, dynamicGlobalPos, staticGlobalPos);
                let distVectorLen = vec3.len(distanceVector);

                if (distVectorLen < dynamicCollider.radius + staticCollider.radius) {
                    // stop dynamic node
                    if (!dynamicCollider.trigger) {
                        vec3.normalize(distanceVector, distanceVector);
                        vec3.scale(distanceVector, distanceVector, dynamicCollider.radius + staticCollider.radius - distVectorLen)
                        let dynamicTransform = dynamicNode.parent.getComponentOfType(Transform);
                        vec3.add(dynamicTransform.translation, dynamicTransform.translation, distanceVector);
                    }

                    dynamicCollider.onCollision?.(staticNode);
                }
            });
        });
    }

    static getGlobalPosition(colliderNode) {
        let parentNode = colliderNode.parent
        let colliderTransform = colliderNode.getComponentOfType(Transform);
        let globalMatrix = parentNode.getComponentOfType(Transform).matrix;
        mat4.mul(globalMatrix, globalMatrix, colliderTransform.matrix);
        return Collider.toVec3(vec4.transformMat4(vec4.create(), vec4.fromValues(0, 0, 0, 1), globalMatrix));
    }

    constructor(node, radius, isStatic, onCollision, trigger = false) {
        this.node = node;
        this.radius = radius;
        this.isStatic = isStatic;
        this.onCollision = onCollision;
        this.trigger = trigger;
        this.transform = node.getComponentOfType(Transform);
    }

    async initializeDebugDraw() {
        const loader = new GLTFLoader();
        await loader.load('../Assets/Models/collider.gltf');
        this.collider_parent = new Node();
        let mesh = loader.loadNode(0);
        mesh.getComponentOfType(Transform).scale = [this.radius + 0.15, this.radius + 0.15, this.radius + 0.15];
        this.collider_parent.addChild(mesh);
        this.collider_parent.addComponent(new Transform({translation: this.transform.translation}));

        debug_objects.push(this.collider_parent);
    }

    drawCollider() {

    }

    update() {

    }
}