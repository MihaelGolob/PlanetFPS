import { quat, vec3, vec4, mat4 } from '../../../lib/gl-matrix-module.js';
import { Bullet } from './Bullet.js';
import { toVec3 } from '../../../common/engine/core/SceneUtils.js';
import { NetworkManager } from '../../Network.js';
import { Transform } from '../../../common/engine/core/Transform.js';
import { GunComponent } from '../GunComponent.js';
import { UserInterface } from '../../UI/UserInterface.js';
import { MainMenuUI } from '../../UI/MainMenuUI.js';
import { PlayerDeadUI } from '../../UI/PlayerDeadUI.js';

export let hitParameter = 0;

export class GoodFPSController {

  constructor(rootNode, root, body, camera, gun, sceneNode) {
    this.rootNode = rootNode;
    this.root = root;
    this.body = body;
    this.camera = camera;
    this.sceneNode = sceneNode;

    this.gunNode = gun
    this.gunComponent = gun.getComponentOfType(GunComponent);
    this.gunTransform = gun.getComponentOfType(Transform);

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
    this.bopHeight = 0.002;
    this.bopSpeed = 25;
    this.bopInput = 0;

    // gravity
    this.gravityVelocity = 0;
    this.grounded = false;

    // shoot parameters
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

    this.globalBodyMatrix = mat4.create();
    this.globalBodyPos = vec3.create();
    this.gunPos = this.gunTransform.translation;

    this.health = 100;
    this.killCount = 0;

    this.hitAnimationSpeed = 6;
    this.hitAnimationStrength = 0.7;
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

    document.querySelector('body').addEventListener('mousemove', (event) => {
      this.dx = event.movementX * this.sensitivity;
      this.dy = event.movementY * this.sensitivity;

      this.mouseMoving = true;
    });

    document.addEventListener('mousedown', (event) => {
      if (event.button == 0) {
        this.leftMouseButtonPressed = true;
      }

      document.querySelector('canvas').requestPointerLock({
      });
    });

    // document.querySelector('body').addEventListener('click', async () => {
    //   await document.querySelector('body').requestPointerLock({
    //     unadjustedMovement: true,
    //   });
    // });
  }

  setupKeysDictionary() {
    this.keysToTrack.forEach((key, _) => {
      this.keysDictionary[key] = 0;
    });
  }

  takeDamage(damage) {
    this.health -= damage;
    hitParameter = this.hitAnimationStrength;

    let lifeCountText = document.getElementById("life-count")

    if (lifeCountText) {
      lifeCountText.textContent = this.health;
    }

    console.log('health: ' + this.health);

    if (this.health <= 0) {
      // todo: die go to menu
      this.sceneNode.removeChild(this.rootNode);
      console.log('you suck');
      NetworkManager.instance().sendDestroyNetPlayer();

      UserInterface.setInstance(PlayerDeadUI);
    }
  }

  updateRotation() {
    if (!this.mouseMoving)
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

    mat4.mul(this.globalBodyMatrix, this.root.matrix, this.body.matrix);

    let moveVector = vec4.create();
    vec4.transformMat4(moveVector, moveDir, this.globalBodyMatrix);
    moveVector = toVec3(moveVector);
    // apply movement
    vec3.add(this.root.translation, this.root.translation, moveVector);

    // apply gravity
    let bodyDownDir = toVec3(vec4.transformMat4(vec4.create(), vec4.fromValues(0, -1, 0, 0), this.globalBodyMatrix));
    this.globalBodyPos = toVec3(vec4.transformMat4(vec4.create(), vec4.fromValues(0, 0, 0, 1), this.globalBodyMatrix));
    let gravityDir = vec3.normalize(vec3.create(), this.globalBodyPos);
    vec3.scale(gravityDir, gravityDir, -1);

    let rotation = quat.rotationTo(quat.create(), bodyDownDir, gravityDir);
    quat.mul(this.root.rotation, rotation, this.root.rotation);

    if (this.isGrounded && this.gravityVelocity <= 0) {
      this.gravityVelocity = 0;

      if (this.keysDictionary['Space'] && Date.now() - this.lastJumpTime >= this.jumpCooldown) {
        this.lastJumpTime = Date.now();
        this.gravityVelocity = this.jumpHeight;
      }
    } else {
      this.gravityVelocity += -this.gravityAcceleration * dt;
    }

    if (vec4.len(moveDir) > 0 && this.isGrounded) {
      let bopFactor = Math.sin(this.bopSpeed * this.bopInput) * this.bopHeight;
      this.gunTransform.translation[1] = this.gunPos[1] + bopFactor;
      this.bopInput += dt;
      if (this.bopInput > 10)
        this.bopInput -= 10;
    }

    this.isGrounded = false;

    let gravityMove = vec3.scale(vec3.create(), gravityDir, -this.gravityVelocity * dt);
    vec3.add(this.root.translation, this.root.translation, gravityMove);

    let globalRot = quat.mul(quat.create(), this.root.rotation, this.body.rotation);

    NetworkManager.instance().sendPlayerTransform(this.root.translation, globalRot);
  }

  async shoot() {
    if (this.leftMouseButtonPressed && Date.now() - this.lastShootTime >= this.shootCooldown) {
      this.lastShootTime = Date.now();

      let globalCameraMatrix = mat4.create();
      mat4.mul(globalCameraMatrix, this.globalBodyMatrix, this.camera.matrix);
      let cameraForward = toVec3(vec4.transformMat4(vec4.create(), vec4.fromValues(0, 0, -1, 0), globalCameraMatrix));
      let cameraPos = toVec3(vec4.transformMat4(vec4.create(), vec4.fromValues(0, 0, 0, 1), globalCameraMatrix));

      let origin = vec3.add(vec3.create(), cameraPos, vec3.scale(vec3.create(), cameraForward, 1.5));
      const bullet = new Bullet(this.sceneNode, origin, cameraForward);
      await bullet.initialize();

      let nmanager = NetworkManager.instance();
      nmanager.sendCreateBullet(origin, cameraForward);
      this.gunComponent.shoot();

    }
  }


  update(t, dt) {
    this.updateRotation();
    this.updateMovement(dt);
    this.shoot();
    hitParameter = Math.max(hitParameter - this.hitAnimationSpeed * dt, 0);
    this.mouseMoving = false;
  }
}
