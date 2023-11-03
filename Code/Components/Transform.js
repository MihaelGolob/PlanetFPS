import { mat4, vec3 } from '../../Libraries/gl-matrix-module.js';

export class Transform {
    constructor({position = vec3.create(), rotation = vec3.create(), scale = vec3.create()} = {}) {
        this.rotation = rotation;
        this.translation = translation;
        this.scale = scale;
    } 

    get matrix() {
        const rotation = rotation.create();
        rotation.fromEuler(rotation, this.rotation[0], this.rotation[1], this.rotation[2]);
        return mat4.fromRotationTranslationScale(mat4.create(),
            rotation, this.translation, this.scale);
    }
}