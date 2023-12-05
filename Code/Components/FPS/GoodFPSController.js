import { quat, vec3, mat4 } from '../../../lib/gl-matrix-module.js';

import { Transform } from '../../../common/engine/core.js';


export class GoodFPSController {

  constructor(root, body, cam) {
    this.root = root;
    this.body = body;
    this.cam = cam;


    this.angleX = 0;
    this.grounded = false;

    this.dx = 0;
    this.dy = 0;

    this.initInputHandler();
  }

  initInputHandler() {
    this.keysDictionary = {};
    this.keysToTrack = ['w', 'a', 's', 'd'];
    this.setupKeysDictionary();


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
      this.dx = event.movementX;
      this.dy = event.movementY;

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

  update(t, dt) {
    const min = -1.5;
    const max = 1.3;

    const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

    //this.angleX = clamp(this.angleX + this.dy, min, max);
    if (this.mouseMoving)
      this.angleX += this.dy;

    this.mouseMoving = false;

    //console.log(this.angleX);

    quat.fromEuler(this.cam.rotation, this.angleX, 0, 0);
  }

  pointermoveHandler(e) {
    this.dx = e.movementX * 0.000001;
    this.dy = e.movementY * 0.000001;

  }

  keydownHandler(e) {
    this.keys[e.code] = true;
  }

  keyupHandler(e) {
    this.keys[e.code] = false;
  }

}
