import { mat4, vec3, quat } from '../../Libraries/gl-matrix-module.js';

export class Transform {
    constructor({position = vec3.create(), rotation = vec3.create(), scale = vec3.fromValues(1, 1, 1)} = {}) {
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
    } 

    get matrix() {
        const rotation = quat.create();
        quat.fromEuler(rotation, this.rotation[0], this.rotation[1], this.rotation[2]);
        return mat4.fromRotationTranslationScale(mat4.create(),
            rotation, this.position, this.scale);
    }
}