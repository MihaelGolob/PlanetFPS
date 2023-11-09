import { vec4, quat, mat4 } from "../Libraries/gl-matrix-module.js";
import { Node } from "./Node.js";
import { Transform } from "./Components/Transform.js";
import { Camera } from './Components/Camera.js'
import { Renderer } from "./Components/Renderer.js";
import { FPSController } from "./Components/FPS/FPSController.js";

export class Scene {
    constructor() {
        // parent scene node
        this.scene = new Node();

        // scene supports only one camera for now
        this.camera = new Node();
        this.camera.addComponent(new Camera());
        let cameraTransform = new Transform({ position: [0, 0, 5], });
        this.camera.addComponent(cameraTransform);
        this.camera.addComponent(new FPSController(cameraTransform))
        this.scene.addChild(this.camera);

        // scene supports only one light for now
        this.light = new Node();
        this.light.addComponent(new Transform({
            position: [0, 0, 5],
        }));
        this.scene.addChild(this.light);

        // cube
        let rotatingCube = new Node();
        rotatingCube.addComponent(new Transform({scale: [0.5, 0.5, 0.5], position: [-1, 0, 0]}));
        const vertices = [
            // positions    // index
            vec4.fromValues(-1, -1, -1, 1), // 0
            vec4.fromValues(-1, -1, -1, 1), // 1
            vec4.fromValues(-1, -1, -1, 1), // 2

            vec4.fromValues(-1, -1,  1, 1), // 3
            vec4.fromValues(-1, -1,  1, 1), // 4
            vec4.fromValues(-1, -1,  1, 1), // 5

            vec4.fromValues(-1,  1, -1, 1), // 6
            vec4.fromValues(-1,  1, -1, 1), // 7
            vec4.fromValues(-1,  1, -1, 1), // 8

            vec4.fromValues(-1,  1,  1, 1), // 9
            vec4.fromValues(-1,  1,  1, 1), // 10
            vec4.fromValues(-1,  1,  1, 1), // 11

            vec4.fromValues( 1, -1, -1, 1), // 12
            vec4.fromValues( 1, -1, -1, 1), // 13
            vec4.fromValues( 1, -1, -1, 1), // 14

            vec4.fromValues( 1, -1,  1, 1), // 15
            vec4.fromValues( 1, -1,  1, 1), // 16
            vec4.fromValues( 1, -1,  1, 1), // 17

            vec4.fromValues( 1,  1, -1, 1), // 18
            vec4.fromValues( 1,  1, -1, 1), // 19
            vec4.fromValues( 1,  1, -1, 1), // 20

            vec4.fromValues( 1,  1,  1, 1), // 21
            vec4.fromValues( 1,  1,  1, 1), // 22
            vec4.fromValues( 1,  1,  1, 1), // 23
        ];

        const normals = [
            vec4.fromValues(-1, 0, 0, 0), // 0
            vec4.fromValues(0, -1, 0, 0), // 1 
            vec4.fromValues(0, 0, -1, 0), // 2

            vec4.fromValues(-1, 0, 0, 0), // 3 
            vec4.fromValues(0, -1, 0, 0), // 4
            vec4.fromValues(0, 0, 1, 0), // 5

            vec4.fromValues(-1, 0, 0, 0), // 6
            vec4.fromValues(0, 0, -1, 0), // 7 
            vec4.fromValues(0, 1, 0, 0), // 8

            vec4.fromValues(-1, 0, 0, 0), // 9
            vec4.fromValues(0, 0, 1, 0), // 10
            vec4.fromValues(0, 1, 0, 0), // 11

            vec4.fromValues(0, -1, 0, 0), // 12
            vec4.fromValues(0, 0, -1, 0), // 13
            vec4.fromValues(1, 0, 0, 0), // 14

            vec4.fromValues(0, -1, 0, 0), // 15
            vec4.fromValues(0, 0, 1, 0), // 16
            vec4.fromValues(1, 0, 0, 0), // 17

            vec4.fromValues(0, 0, -1, 0), // 18
            vec4.fromValues(0, 1, 0, 0), // 19
            vec4.fromValues(1, 0, 0, 0), // 20

            vec4.fromValues(0, 0, 1, 0), // 21
            vec4.fromValues(0, 1, 0, 0), // 22
            vec4.fromValues(1, 0, 0, 0), // 23
        ];

        const colors = [
           vec4.fromValues(0, 0, 0, 1),
           vec4.fromValues(0, 0, 0, 1),
           vec4.fromValues(0, 0, 0, 1),

           vec4.fromValues(0, 0, 1, 1),
           vec4.fromValues(0, 0, 1, 1),
           vec4.fromValues(0, 0, 1, 1),

           vec4.fromValues(0, 1, 0, 1),
           vec4.fromValues(0, 1, 0, 1),
           vec4.fromValues(0, 1, 0, 1),

           vec4.fromValues(0, 1, 1, 1),
           vec4.fromValues(0, 1, 1, 1),
           vec4.fromValues(0, 1, 1, 1),

           vec4.fromValues(1, 0, 0, 1),
           vec4.fromValues(1, 0, 0, 1),
           vec4.fromValues(1, 0, 0, 1),

           vec4.fromValues(1, 0, 1, 1),
           vec4.fromValues(1, 0, 1, 1),
           vec4.fromValues(1, 0, 1, 1),

           vec4.fromValues(1, 1, 0, 1),
           vec4.fromValues(1, 1, 0, 1),
           vec4.fromValues(1, 1, 0, 1),

           vec4.fromValues(1, 1, 1, 1),
           vec4.fromValues(1, 1, 1, 1),
           vec4.fromValues(1, 1, 1, 1),
        ];

        const indices = new Uint32Array([
            0, 3, 6,    6, 3, 9, // left
            1, 4, 12,   12, 15, 4, // bottom 
            2, 7, 13,   13, 18, 7, // back 
            5, 16, 10,   10, 21, 16, // front
            8, 11, 19,   19, 22, 11, // top 
            14, 17, 20,  20, 23, 17, // right 
        ]);
        rotatingCube.addComponent(new Renderer({
            vertexPositions: vertices,
            vertexColors: colors,
            indices: indices,
            normals: normals,
        }));
        rotatingCube.addComponent({
            update(deltaTime) {
                const transform = rotatingCube.getComponentOfType(Transform);
                transform.rotation[0] += 10 * deltaTime;
                transform.rotation[1] += 10 * deltaTime;
            }
        });

        this.scene.addChild(rotatingCube);

        let rotatingCube2 = new Node();
        rotatingCube2.addComponent(new Transform({scale: [0.5, 0.5, 0.7], position: [1, 1.5, -0.5]}));

        rotatingCube2.addComponent(new Renderer({
            vertexPositions: vertices,
            vertexColors: colors,
            indices: indices,
            normals: normals,
        }));
        rotatingCube2.addComponent({
            update(deltaTime) {
                const transform = rotatingCube2.getComponentOfType(Transform);
                transform.rotation[2] += 30 * deltaTime;
                transform.rotation[1] += deltaTime;
            }
        }); 
        
        this.scene.addChild(rotatingCube2);
    }

    get bufferArray() {
        let vertexArray = [];
        let indexArray = [];
        this.indexCount = 0;
        let vertexCount = 0;

        this.scene.traverse(node => {
            const renderer = node.getComponentOfType(Renderer);
            if (renderer) {
                const transform = node.getComponentOfType(Transform);
                let vertexPositions = [];
                let normals = [];

                // TODO: refactor and make this more efficient!
                for (let i = 0; i < renderer.vertexPositions.length; i++) {
                    vertexPositions.push(vec4.clone(renderer.vertexPositions[i]));
                    normals.push(vec4.clone(renderer.normals[i]));
                }

                if (transform) {
                    const matrix = transform.matrix;
                    for (let i = 0; i < vertexPositions.length; i++) {
                        vec4.transformMat4(vertexPositions[i], vertexPositions[i], matrix);
                        vec4.transformMat4(normals[i], normals[i], matrix);
                    }
                }

                vertexArray.push.apply(vertexArray, renderer.getVerticesAndColors(vertexPositions, renderer.vertexColors, normals));

                let indices = renderer.indices;
                for (let i = 0; i < indices.length; i++) {
                    indices[i] += vertexCount;
                }
                indexArray.push.apply(indexArray, indices);

                vertexCount += renderer.vertexPositions.length;
                this.indexCount += renderer.indices.length;
            }
        });

        return [Uint32Array.from(indexArray), Float32Array.from(vertexArray)]
    }

    update(deltaTime) {
        this.scene.traverse(node => {
            for (const component of node.components) {
                component.update?.(deltaTime);
            }
        });
    }
}
