export class Renderer {
    constructor({vertexPositions = [], vertexColors = [], indices = new Uint32Array, normals = []} = {}) {
        // vertex positions should be of type vec4
        this.vertexPositions = vertexPositions;
        // vertex colors should be of type vec4 (same length as vertex positions)
        this.vertexColors = vertexColors;
        this.indices = indices;
        this.normals = normals;
    }

    getVerticesAndColors(positions, colors, normals) {
        let buffer = [];
        for (let i = 0; i < this.vertexPositions.length; i++) {
            buffer.push.apply(buffer, [positions[i][0], positions[i][1], positions[i][2], positions[i][3]]);
            buffer.push.apply(buffer, [normals[i][0], normals[i][1], normals[i][2], normals[i][3]]);
            buffer.push.apply(buffer, [colors[i][0], colors[i][1], colors[i][2], colors[i][3]]);
        }

        return buffer;
    }
}