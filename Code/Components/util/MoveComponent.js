import { vec3 } from "../../../lib/gl-matrix-module.js";

export class MoveComponent {
    constructor(transform, speed, direction) {
        this.transform = transform;
        this.speed = speed;
        this.direction = direction;
    }

    update(t, dt) {
        let moveVector = vec3.scale(vec3.create(), this.direction, this.speed * dt);
        vec3.add(this.transform.translation, this.transform.translation, moveVector);
    }
}