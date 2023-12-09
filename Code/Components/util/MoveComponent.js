import { vec3 } from "../../../lib/gl-matrix-module.js";

export class MoveComponent {
    constructor(transform, speed, direction) {
        this.transform = transform;
        this.speed = speed;
        this.direction = direction;
        this.velocity = vec3.scale(vec3.create(), this.direction, this.speed);
        this.gravityFactor = 0.35;
    }

    update(t, dt) {
        let gravityDir = vec3.normalize(vec3.create(), this.transform.translation);
        let gravityVelocity = vec3.scale(gravityDir, gravityDir, -this.gravityFactor);
        vec3.add(this.velocity, this.velocity, gravityVelocity);
        let moveVector = vec3.scale(vec3.create(), this.velocity, dt);
        vec3.add(this.transform.translation, this.transform.translation, moveVector);
    }
}