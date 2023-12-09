import { quat } from '../../lib/gl-matrix-module.js';

export class GunComponent {
    constructor(transform) {
        this.transform = transform;

        this.lastShot = Date.now();
        this.recoilDuration = 100;
        this.recoilAngle = 20;
    }

    shoot() {
        this.transform.rotation = quat.fromEuler(quat.create(), this.recoilAngle, 0, 0);
        this.lastShot = Date.now();
    }

    update(t, dt) {
        let f = (Date.now() - this.lastShot) / this.recoilDuration;
        f = Math.min(f, 1);
        f = Math.max(f, 0);
        let angle = this.recoilAngle * (1 - f);
        this.transform.rotation = quat.fromEuler(quat.create(), angle, 0, 0);
    }
}