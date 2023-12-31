import { vec3, mat4 } from '../../../lib/gl-matrix-module.js';

import { Camera } from './Camera.js';
import { Model } from './Model.js';
import { Transform } from './Transform.js';

export function getLocalModelMatrix(node) {
    const matrix = mat4.create();
    for (const transform of node.getComponentsOfType(Transform)) {
        mat4.mul(matrix, matrix, transform.matrix);
    }
    return matrix;
}

export function getGlobalModelMatrix(node) {
    if (node.parent) {
        const parentMatrix = getGlobalModelMatrix(node.parent);
        const modelMatrix = getLocalModelMatrix(node);
        return mat4.multiply(parentMatrix, parentMatrix, modelMatrix);
    } else {
        return getLocalModelMatrix(node);
    }
}

export function getLocalViewMatrix(node) {
    const matrix = getLocalModelMatrix(node);
    return mat4.invert(matrix, matrix);
}

export function getGlobalViewMatrix(node) {
    const matrix = getGlobalModelMatrix(node);
    return mat4.invert(matrix, matrix);
}

export function getProjectionMatrix(node) {
    const camera = node.getComponentOfType(Camera);
    return camera ? camera.projectionMatrix : mat4.create();
}

export function getModels(node) {
    return node.getComponentsOfType(Model);
}

export function toVec3(v4) {
    if(v4[3]) {
        return vec3.fromValues(v4[0]/v4[3], v4[1]/v4[3], v4[2]/v4[3]);
    }
    return vec3.fromValues(v4[0], v4[1], v4[2]);
}
