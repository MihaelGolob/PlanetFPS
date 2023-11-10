import { vec3 } from '../../../Libraries/gl-matrix-module.js';

export class FPSController{
    constructor(transform) {
        this.transform = transform;

        // setup functions
        this.initInputHandler();

        // movement parameter initialization
        this.movementSpeed = 10;

        // movement direction initialization
        this.viewDirection = vec3.fromValues(0, 0, -1)
        this.upDirection = vec3.fromValues(0, 1, 0);
    }

    initInputHandler() {
        this.keysDictionary = {};
        this.keysToTrack = ['w', 'a', 's', 'd'];
        this.setupKeysDictionary();

        document.addEventListener('keydown', (event) => {
            this.keysToTrack.forEach((key, index) => {
                if (key == event.key) {
                    // track key down
                    this.keysDictionary[key] = 1;
                }
            });
        });

        document.addEventListener('keyup', (event) => {
            this.keysToTrack.forEach((key, index) => {
                if (key == event.key) {
                    // track key down
                    this.keysDictionary[key] = 0;
                }
            });
        });

        document.addEventListener('mousemove', (event) => {
            this.mouseDeltaX = event.movementX;
            this.mouseDeltaY = event.movementY;
        });
    }

    setupKeysDictionary() {
        this.keysToTrack.forEach((key, _) => {
            this.keysDictionary[key] = 0;
        });
    }

    move(deltaTime) {
        let moveDirection = vec3.create();

        if (this.keysDictionary['w'] == 1) { // move forward
            vec3.add(moveDirection, moveDirection, this.viewDirection);
        }

        if (this.keysDictionary['a'] == 1) { // move left
            let leftDirection = vec3.create();
            vec3.cross(leftDirection, this.upDirection, this.viewDirection);
            vec3.normalize(leftDirection, leftDirection);

            vec3.add(moveDirection, moveDirection, leftDirection);
        }

        if (this.keysDictionary['s'] == 1) { // move backward
            let backwardDirection = vec3.create();
            vec3.scale(backwardDirection, this.viewDirection, -1);
            
            vec3.add(moveDirection, moveDirection, backwardDirection);
        }
        
        if (this.keysDictionary['d'] == 1) { // move right
            let rightDirection = vec3.create();
            vec3.cross(rightDirection, this.viewDirection, this.upDirection);
            vec3.normalize(rightDirection, rightDirection);

            vec3.add(moveDirection, moveDirection, rightDirection);
        }

        vec3.normalize(moveDirection, moveDirection);
        vec3.scale(moveDirection, moveDirection, this.movementSpeed);
        vec3.scale(moveDirection, moveDirection, deltaTime);
        this.transform.translate(moveDirection);
    }

    update(deltaTime) {
        this.move(deltaTime);
    }
}