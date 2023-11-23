export class Light {
    constructor({ambient = 0, shininess = 100} = {}) {
        this.ambient = ambient;
        this.shininess = shininess;
    }
}