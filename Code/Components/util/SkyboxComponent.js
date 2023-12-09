import {
    Node,
    Transform,
  } from '../../../common/engine/core.js';

export class SkyboxComponent {
    constructor(node, fpsTransform) {
        this.fpsTransform = fpsTransform;
        this.transform = node.getComponentOfType(Transform);
    }

    update(t, dt) {
        this.transform.translation = this.fpsTransform.translation;
    }
}