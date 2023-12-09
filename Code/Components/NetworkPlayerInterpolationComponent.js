import { quat, vec3 } from '../../lib/gl-matrix-module.js';

export class NetworkPlayerInterpolationComponent {
    constructor(transform) {
        this.transform = transform;
        this.oldPosition = vec3.create();
        this.newPosition = vec3.create();
        this.oldRotation = quat.create();
        this.newRotation = quat.create();

        this.lerpTime = 0;
        this.lerpDuration = 100;
        this.averageRefreshRate = 1000 / 20;

        this.lastUpdate = Date.now();
    }

    update(time, deltaTime) {
        let t = (Date.now() - this.lastUpdate) / this.averageRefreshRate;

        let position = vec3.lerp(vec3.create(), this.oldPosition, this.newPosition, t);
        let rotation = quat.lerp(quat.create(), this.oldRotation, this.newRotation, t);

        this.transform.translation = position;
        this.transform.rotation = rotation;
    }

    updateTransform(position, rotation) {
        this.oldPosition = this.newPosition;
        this.newPosition = position;
        this.oldRotation = this.newRotation;
        this.newRotation = rotation;

        this.averageRefreshRate = this.averageRefreshRate * 0.5 + (Date.now() - this.lastUpdate) * 0.5;
        this.lastUpdate = Date.now();
    }
}