import { mat4, quat, vec3 } from '../../../lib/gl-matrix-module.js';

export class Transform {

    constructor({
        rotation = [0, 0, 0, 1],
        translation = [0, 0, 0],
        scale = [1, 1, 1],
        matrix,
    } = {}) {
        this.rotation = rotation;
        this.translation = translation;
        this.scale = scale;
        if (matrix) {
            this.matrix = matrix;
        }
    }

    get matrix() {
        return mat4.fromRotationTranslationScale(mat4.create(),
            this.rotation, this.translation, this.scale);
    }

    set matrix(matrix) {
        mat4.getRotation(this.rotation, matrix);
        mat4.getTranslation(this.translation, matrix);
        mat4.getScaling(this.scale, matrix);
    }

    get viewDirection() {
        const rotation = quat.create();
        quat.fromEuler(rotation, this.rotation[0], this.rotation[1], this.rotation[2]);
        const viewDirection = vec3.fromValues(0, 0, -1);
        return vec3.transformQuat(viewDirection, viewDirection, rotation);
    }

    translateWithDeg(translate = vec3.create()) {
        let toRad = Math.PI / 180;
        vec3.add(this.translation, this.translation, vec3.scale(translate, translate, toRad));
    }

    translateWithRad(translate = vec3.create()) {
        vec3.add(this.translation, this.translation, translate);
    }

    rotate(rotation = vec3.create()) {
        vec3.add(this.rotation, this.rotation, rotation);
    }
}
