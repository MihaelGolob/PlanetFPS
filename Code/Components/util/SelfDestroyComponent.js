export class SelfDestroyComponent {
    constructor(node, parent, lifetime) {
        this.node = node;
        this.parent = parent;
        this.lifetime = lifetime;
        this.timeLeft = lifetime;
    }

    update(t, dt) {
        this.timeLeft -= dt;
        if (this.timeLeft <= 0) {
            this.parent.removeChild(this.node);
        }
    }
}