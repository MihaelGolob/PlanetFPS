import { quat, vec3, vec4, mat4 } from '../../../lib/gl-matrix-module.js';
import { Transform } from '../../../common/engine/core/Transform.js';
import { getGlobalModelMatrix } from '../../../common/engine/core/SceneUtils.js';


export class GoodFPSController {

  constructor(rootNode, root, body, cam) {
    this.rootNode = rootNode;
    this.root = root;
    this.body = body;
    this.cam = cam;

    // rotate parameters
    this.sensitivity = 0.15;
    this.gravityAcceleration = 9.8;

    // movement parameters
    this.speed = 8; 
    this.airSpeed = 5;
    this.jumpHeight = 5;

    this.isGrounded = true;

    // mouse delta
    this.dx = 0;
    this.dy = 0;
    this.angleX = 0;
    
    // gravity
    this.gravityVelocity = 0;
    this.grounded = false;

    // input
    this.keysToTrack = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space'];
    this.initInputHandler();
  }

  initInputHandler() {
    this.keysDictionary = {};
    this.setupKeysDictionary();

    document.addEventListener('keydown', (event) => {
      this.keysToTrack.forEach((key, _) => {
        if (key == event.code) {
          // track key down
          this.keysDictionary[key] = 1;
        }
      });
    });

    document.addEventListener('keyup', (event) => {
      this.keysToTrack.forEach((key, _) => {
        if (key == event.code) {
          // track key down
          this.keysDictionary[key] = 0;
        }
      });
    });

    document.querySelector('canvas').addEventListener('mousemove', (event) => {
      this.dx = event.movementX * this.sensitivity;
      this.dy = event.movementY * this.sensitivity;

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

  vec3FromVec4(v4) {
    if(v4[3]) {
        return vec3.fromValues(v4[0]/v4[3], v4[1]/v4[3], v4[2]/v4[3]);
    }
    return vec3.fromValues(v4[0], v4[1], v4[2]);
  }

  updateRotation() {
    if(!this.mouseMoving)
      return;

    const min = -85;
    const max = 75;

    const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
    this.angleX += this.dy;
    this.angleX = clamp(this.angleX, min, max);
  
    // y axis
    quat.fromEuler(this.cam.rotation, -this.angleX, 0, 0);
    
    // x axis
    let rot = quat.create();
    quat.fromEuler(rot, 0, -this.dx, 0);
    quat.mul(this.body.rotation, rot, this.body.rotation);
  }

  updateMovement(dt) {
    let moveDir = vec4.fromValues(this.keysDictionary['KeyD'] - this.keysDictionary['KeyA'], 0, this.keysDictionary['KeyS'] - this.keysDictionary['KeyW'], 0);

    if (vec4.len(moveDir) != 0)   
      vec4.normalize(moveDir, moveDir);

    let speed = this.isGrounded ? this.speed : this.airSpeed;
    vec4.scale(moveDir, moveDir, speed * dt);
    
    let globalMatrix = mat4.create();
    mat4.mul(globalMatrix, this.root.matrix, this.body.matrix);
    
    let moveVector = vec4.create();
    vec4.transformMat4(moveVector, moveDir, globalMatrix);
    moveVector = this.vec3FromVec4(moveVector);
    // apply movement
    vec3.add(this.root.translation, this.root.translation, moveVector);
    
    // apply gravity
    let bodyDownDir = this.vec3FromVec4(vec4.transformMat4(vec4.create(), vec4.fromValues(0, -1, 0, 0), globalMatrix));
    let globalBodyPos = this.vec3FromVec4(vec4.transformMat4(vec4.create(), vec4.fromValues(0, 0, 0, 1), globalMatrix));
    let gravityDir = vec3.normalize(vec3.create(), globalBodyPos);
    vec3.scale(gravityDir, gravityDir, -1);

    let rotation = quat.rotationTo(quat.create(), bodyDownDir, gravityDir);
    quat.mul(this.root.rotation, rotation, this.root.rotation);
    
    let globalRootPos = this.vec3FromVec4(vec4.transformMat4(vec4.create(), vec4.fromValues(0, 0, 0, 1), this.root.matrix));
    // TODO: this should be checked via collision detection
    this.isGrounded = vec3.len(globalRootPos) <= 10;

    if (this.isGrounded) {
      this.gravityVelocity = 0;

      if (this.keysDictionary['Space']) {
        this.gravityVelocity = this.jumpHeight;
      }
    } else {
      this.gravityVelocity += -this.gravityAcceleration * dt;
    }

    let gravityMove = vec3.scale(vec3.create(), gravityDir, -this.gravityVelocity * dt);
    vec3.add(this.root.translation, this.root.translation, gravityMove);
  }

  update(t, dt) {
    this.updateRotation();
    this.updateMovement(dt);
    this.mouseMoving = false;
  }
}
