import { vec4, quat, mat4 } from "../Libraries/gl-matrix-module.js";
import { Node } from "./Node.js";
import { Transform } from "./Components/Transform.js";
import { Camera } from './Components/Camera.js'
import { Renderer } from "./Components/Renderer.js";

export class Scene {
    constructor() {
        // parent scene node
        this.scene = new Node();

        // scene supports only one camera for now
        this.camera = new Node();
        this.camera.addComponent(new Camera());
        this.camera.addComponent(new Transform({
            position: [0, 0, 5],
        }));
        this.scene.addChild(this.camera);

        // cube
        this.rotatingCube = new Node();
        this.rotatingCube.addComponent(new Transform());
        const vertices = [
            // positions    // index
            vec4.fromValues(-1, -1, -1, 1), //   0
            vec4.fromValues(-1, -1,  1, 1), //   1
            vec4.fromValues(-1,  1, -1, 1), //   2
            vec4.fromValues(-1,  1,  1, 1), //   3
            vec4.fromValues( 1, -1, -1, 1), //   4
            vec4.fromValues( 1, -1,  1, 1), //   5
            vec4.fromValues( 1,  1, -1, 1), //   6
            vec4.fromValues( 1,  1,  1, 1), //   7
        ];

        const colors = [
           vec4.fromValues(0, 0, 0, 1),
           vec4.fromValues(0, 0, 1, 1),
           vec4.fromValues(0, 1, 0, 1),
           vec4.fromValues(0, 1, 1, 1),
           vec4.fromValues(1, 0, 0, 1),
           vec4.fromValues(1, 0, 1, 1),
           vec4.fromValues(1, 1, 0, 1),
           vec4.fromValues(1, 1, 1, 1),
        ];

        const indices = new Uint32Array([
            0, 1, 2,    2, 1, 3,
            4, 0, 6,    6, 0, 2,
            5, 4, 7,    7, 4, 6,
            1, 5, 3,    3, 5, 7,
            6, 2, 7,    7, 2, 3,
            1, 0, 5,    5, 0, 4,
        ]);
        this.rotatingCube.addComponent(new Renderer({
            vertexPositions: vertices,
            vertexColors: colors,
            indices: indices,
        }));
        this.rotatingCube.addComponent({
            update() {
                // const time = performance.now() / 1000;
                // const transform = this.rotatingCube.getComponentOfType(Transform);
                // const rotation = transform.rotation;

                // quat.identity(rotation);
                // quat.rotateX(rotation, rotation, time * 0.6);
                // quat.rotateY(rotation, rotation, time * 0.7);
            }
        });

        this.scene.addChild(this.rotatingCube);

        this.createBufferArrays();
    }

    createBufferArrays() {
        let vertexArray = [];
        let indexArray = [];
        this.indexCount = 0;
        let vertexCount = 0;

        this.scene.traverse(node => {
            const renderer = node.getComponentOfType(Renderer);
            if (renderer) {
                vertexArray.push.apply(vertexArray, renderer.vertices);

                let indices = renderer.indices;
                for (let i = 0; i < indices.length; i++) {
                    indices[i] += vertexCount;
                }
                indexArray.push.apply(indexArray, indices);

                vertexCount += renderer.vertexPositions.length;
                this.indexCount += renderer.indices.length;
            }
        });

        this.indexBufferArray = Uint32Array.from(indexArray);
        this.vertexBufferArray = Float32Array.from(vertexArray);
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
