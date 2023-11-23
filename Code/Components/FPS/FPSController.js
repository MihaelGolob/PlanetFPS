import { vec3 } from '../../../lib/gl-matrix-module.js';

export class FPSController{
    constructor(transform) {
        this.transform = transform;

        // setup functions
        this.initInputHandler();

        // movement parameter initialization
        this.movementSpeed = 100;
        this.rotationSpeed = 0.5;

        // movement direction initialization
        this.viewDirection = vec3.fromValues(0, 0, -1)
        this.upDirection = vec3.fromValues(0, 1, 0);
    }

    initInputHandler() {
        this.keysDictionary = {};
        this.keysToTrack = ['w', 'a', 's', 'd'];
        this.setupKeysDictionary();

        this.mouseDeltaX = 0;
        this.mouseDeltaY = 0;

        document.addEventListener('keydown', (event) => {
            this.keysToTrack.forEach((key, _) => {
                if (key == event.key) {
                    // track key down
                    this.keysDictionary[key] = 1;
                }
            });
        });

        document.addEventListener('keyup', (event) => {
            this.keysToTrack.forEach((key, _) => {
                if (key == event.key) {
                    // track key down
                    this.keysDictionary[key] = 0;
                }
            });
        });

        document.querySelector('canvas').addEventListener('mousemove', (event) => {
            this.mouseDeltaX = event.movementX;
            this.mouseDeltaY = event.movementY;

            this.mouseMoving = true;
        });

        document.querySelector('canvas').addEventListener('click', async () => {
            await document.querySelector('canvas').requestPointerLock({
                unadjustedMovement: true,
            });
        });
    }

    setupKeysDictionary() {
        this.keysToTrack.forEach((key, _) => {
            this.keysDictionary[key] = 0;
        });
    }

    move(deltaTime) {
        let moveDirection = vec3.create();
        let viewDirection = this.transform.viewDirection;

        if (this.keysDictionary['w'] == 1) { // move forward
            vec3.add(moveDirection, moveDirection, viewDirection);
        }

        if (this.keysDictionary['a'] == 1) { // move left
            let leftDirection = vec3.create();
            vec3.cross(leftDirection, this.upDirection, viewDirection);
            vec3.normalize(leftDirection, leftDirection);

            vec3.add(moveDirection, moveDirection, leftDirection);
        }

        if (this.keysDictionary['s'] == 1) { // move backward
            let backwardDirection = vec3.create();
            vec3.scale(backwardDirection, viewDirection, -1);
            
            vec3.add(moveDirection, moveDirection, backwardDirection);
        }
        
        if (this.keysDictionary['d'] == 1) { // move right
            let rightDirection = vec3.create();
            vec3.cross(rightDirection, viewDirection, this.upDirection);
            vec3.normalize(rightDirection, rightDirection);

            vec3.add(moveDirection, moveDirection, rightDirection);
        }

        vec3.normalize(moveDirection, moveDirection);
        vec3.scale(moveDirection, moveDirection, this.movementSpeed);
        vec3.scale(moveDirection, moveDirection, deltaTime);
        this.transform.translateWithDeg(moveDirection);
    }

    rotate(deltaTime) {
        if (!this.mouseMoving) return;

        let rotation = vec3.create();

        let horizontalRotation = vec3.fromValues(0, -this.mouseDeltaX, 0);
        let verticalRotation = vec3.fromValues(-this.mouseDeltaY, 0, 0);

        vec3.add(rotation, rotation, horizontalRotation);
        vec3.add(rotation, rotation, verticalRotation);

        vec3.scale(rotation, rotation, this.rotationSpeed);
        vec3.scale(rotation, rotation, deltaTime);
        this.transform.rotate(rotation);
    }

    update(time, deltaTime) {
        this.move(deltaTime);
        this.rotate(deltaTime);

        this.mouseMoving = false;
    }
}