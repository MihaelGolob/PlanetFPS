import { quat, vec3, vec4, mat4 } from '../../../lib/gl-matrix-module.js';
import { Bullet } from './Bullet.js';

export class GoodFPSController {

  constructor(rootNode, root, body, camera, bulletParent) {
    this.rootNode = rootNode;
    this.root = root;
    this.body = body;
    this.camera = camera;
    this.bulletParent = bulletParent;

    // rotate parameters
    this.sensitivity = 0.15;
    this.gravityAcceleration = 9.8;

    // movement parameters
    this.moveSpeed = 8; 
    this.airMoveSpeed = 5;
    this.jumpHeight = 5;
    this.jumpCooldown = 1200;
    this.lastJumpTime = 0;

    this.isGrounded = true;

    // gravity
    this.gravityVelocity = 0;
    this.grounded = false;
    
    // shoot parameters
    this.bulletSpeed = 20;
    this.shootCooldown = 400;
    this.lastShootTime = 0;
    
    // input
    this.keysToTrack = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space'];
    this.initInputHandler();
    this.leftMouseButtonPressed = false;

    // mouse delta
    this.dx = 0;
    this.dy = 0;
    this.angleX = 0;

    this.globalMatrix = mat4.create();
    this.globalBodyPos = vec3.create();
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

    document.addEventListener('mousedown', (event) => {
      if (event.button == 0) {
        this.leftMouseButtonPressed = true;
      }
    });

    document.addEventListener('mouseup', (event) => {
      if (event.button == 0) {
        this.leftMouseButtonPressed = false;
      }
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

  toVec3(v4) {
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
    quat.fromEuler(this.camera.rotation, -this.angleX, 0, 0);
    
    // x axis
    let rot = quat.create();
    quat.fromEuler(rot, 0, -this.dx, 0);
    quat.mul(this.body.rotation, rot, this.body.rotation);
  }

  updateMovement(dt) {
    let moveDir = vec4.fromValues(this.keysDictionary['KeyD'] - this.keysDictionary['KeyA'], 0, this.keysDictionary['KeyS'] - this.keysDictionary['KeyW'], 0);

    if (vec4.len(moveDir) != 0)   
      vec4.normalize(moveDir, moveDir);

    let moveSpeed = this.isGrounded ? this.moveSpeed : this.airMoveSpeed;
    vec4.scale(moveDir, moveDir, moveSpeed * dt);
    
    mat4.mul(this.globalMatrix, this.root.matrix, this.body.matrix);
    
    let moveVector = vec4.create();
    vec4.transformMat4(moveVector, moveDir, this.globalMatrix);
    moveVector = this.toVec3(moveVector);
    // apply movement
    vec3.add(this.root.translation, this.root.translation, moveVector);
    
    // apply gravity
    let bodyDownDir = this.toVec3(vec4.transformMat4(vec4.create(), vec4.fromValues(0, -1, 0, 0), this.globalMatrix));
    this.globalBodyPos = this.toVec3(vec4.transformMat4(vec4.create(), vec4.fromValues(0, 0, 0, 1), this.globalMatrix));
    let gravityDir = vec3.normalize(vec3.create(), this.globalBodyPos);
    vec3.scale(gravityDir, gravityDir, -1);

    let rotation = quat.rotationTo(quat.create(), bodyDownDir, gravityDir);
    quat.mul(this.root.rotation, rotation, this.root.rotation);
    
    let globalRootPos = this.toVec3(vec4.transformMat4(vec4.create(), vec4.fromValues(0, 0, 0, 1), this.root.matrix));
    // TODO: this should be checked via collision detection
    this.isGrounded = vec3.len(globalRootPos) <= 10;

    if (this.isGrounded) {
      this.gravityVelocity = 0;

      if (this.keysDictionary['Space'] && Date.now() - this.lastJumpTime >= this.jumpCooldown) {
        this.lastJumpTime = Date.now();
        this.gravityVelocity = this.jumpHeight;
      }
    } else {
      this.gravityVelocity += -this.gravityAcceleration * dt;
    }

    let gravityMove = vec3.scale(vec3.create(), gravityDir, -this.gravityVelocity * dt);
    vec3.add(this.root.translation, this.root.translation, gravityMove);
  }

  async shoot() {
    if (this.leftMouseButtonPressed && Date.now() - this.lastShootTime >= this.shootCooldown) {
      this.lastShootTime = Date.now();
      let forward = vec4.transformMat4(vec4.create(), vec4.fromValues(0, 0, -1, 0), this.globalMatrix);
      let forwardVector = this.toVec3(forward);
      let start = vec4.add(vec4.create(), this.globalBodyPos, vec4.fromValues(0, 2, 0, 0))
      const bullet = new Bullet(this.bulletParent, start, this.bulletSpeed, forwardVector, 0, 7);
      await bullet.initialize();
    }
  }


  update(t, dt) {
    this.updateRotation();
    this.updateMovement(dt);
    this.shoot();
    this.mouseMoving = false;
  }
}
