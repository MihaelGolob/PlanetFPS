import { quat, mat4 } from "../Libraries/gl-matrix-module.js";
import { Node } from "./Node.js";
import { Transform } from "./Components/Transform.js";
import { Camera } from './Components/Camera.js'

export class Scene {
    constructor() {
        // parent scene node
        this.scene = new Node();

        // scene supports only one camera for now
        this.camera = new Node();
        this.camera.addComponent(new Camera());
        this.camera.addComponent(new Transform({
            translation: [0, 0, 5],
        }));
        this.scene.addChild(this.camera);

        // cube
        this.rotatingCube = new Node();
        this.rotatingCube.addComponent(new Transform());
        this.rotatingCube.addComponent({
            update() {
                const time = performance.now() / 1000;
                const transform = this.rotatingCube.getComponentOfType(Transform);
                const rotation = transform.rotation;

                quat.identity(rotation);
                quat.rotateX(rotation, rotation, time * 0.6);
                quat.rotateY(rotation, rotation, time * 0.7);
            }
        });

        this.scene.addChild(this.rotatingCube);
    }

    update() {
        const time = performance.now() / 1000;

        this.scene.traverse(node => {
            for (const component of node.components) {
                component.update?.(time);
            }
        });
    }
}
