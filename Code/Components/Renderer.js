export class Renderer {
    constructor({vertexPositions = [], vertexColors = [], indices = new Uint32Array} = {}) {
        // vertex positions should be of type vec4
        this.vertexPositions = vertexPositions;
        // vertex colors should be of type vec4 (same length as vertex positions)
        this.vertexColors = vertexColors;
        this.indices = indices;

        this.vertices = this.#getVerticesAndColors();
    }

    #getVerticesAndColors() {
        let buffer = [];
        for (let i = 0; i < this.vertexPositions.length; i++) {
            buffer.push.apply(buffer, [this.vertexPositions[i][0], this.vertexPositions[i][1], this.vertexPositions[i][2], this.vertexPositions[i][3]]);
            buffer.push.apply(buffer, [this.vertexColors[i][0], this.vertexColors[i][1], this.vertexColors[i][2], this.vertexColors[i][3]]);
        }

        return buffer;
    }
}